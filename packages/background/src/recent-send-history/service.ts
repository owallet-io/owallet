import { ChainsService } from "../chains";
import {
  Bech32Address,
  ChainIdHelper,
  TendermintTxTracer,
  WsReadyState,
} from "@owallet/cosmos";
import { BackgroundTxService, Notification } from "../tx";
import {
  action,
  autorun,
  makeObservable,
  observable,
  runInAction,
  toJS,
} from "mobx";
import { KVStore, retry } from "@owallet/common";
import {
  IBCHistory,
  RecentSendHistory,
  SkipHistory,
  StatusRequest,
  TxStatusResponse,
} from "./types";
import { Buffer } from "buffer/";
import {
  AppCurrency,
  ChainInfo,
  EthTxReceipt,
  EthTxStatus,
} from "@owallet/types";
import { CoinPretty } from "@owallet/unit";
import { simpleFetch } from "@owallet/simple-fetch";
import { id } from "@ethersproject/hash";

export class RecentSendHistoryService {
  // Key: {chain_identifier}/{type}
  @observable
  protected readonly recentSendHistoryMap: Map<string, RecentSendHistory[]> =
    new Map();

  @observable
  protected recentIBCHistorySeq: number = 0;
  // Key: id (sequence, it should be increased by 1 for each)
  @observable
  protected readonly recentIBCHistoryMap: Map<string, IBCHistory> = new Map();

  @observable
  protected recentSkipHistorySeq: number = 0;
  // Key: id (sequence, it should be increased by 1 for each)
  @observable
  protected readonly recentSkipHistoryMap: Map<string, SkipHistory> = new Map();

  constructor(
    protected readonly kvStore: KVStore,
    protected readonly chainsService: ChainsService,
    protected readonly txService: BackgroundTxService,
    protected readonly notification: Notification
  ) {
    makeObservable(this);
  }

  async init(): Promise<void> {
    const recentSendHistoryMapSaved = await this.kvStore.get<
      Record<string, RecentSendHistory[]>
    >("recentSendHistoryMap");
    if (recentSendHistoryMapSaved) {
      runInAction(() => {
        for (const [key, value] of Object.entries(recentSendHistoryMapSaved)) {
          this.recentSendHistoryMap.set(key, value);
        }
      });
    }
    autorun(() => {
      const js = toJS(this.recentSendHistoryMap);
      const obj = Object.fromEntries(js);
      this.kvStore.set<Record<string, RecentSendHistory[]>>(
        "recentSendHistoryMap",
        obj
      );
    });

    // The storage keys below include "ibc transfer" because
    // when only transfer history was supported previously,
    // the keys were named that way.
    // The keys were kept for backward compatibility.
    const recentIBCHistorySeqSaved = await this.kvStore.get<number>(
      "recentIBCTransferHistorySeq"
    );
    if (recentIBCHistorySeqSaved) {
      runInAction(() => {
        this.recentIBCHistorySeq = recentIBCHistorySeqSaved;
      });
    }
    autorun(() => {
      const js = toJS(this.recentIBCHistorySeq);
      this.kvStore.set<number>("recentIBCTransferHistorySeq", js);
    });

    const recentIBCHistoryMapSaved = await this.kvStore.get<
      Record<string, IBCHistory>
    >("recentIBCTransferHistoryMap");
    if (recentIBCHistoryMapSaved) {
      runInAction(() => {
        let entries = Object.entries(recentIBCHistoryMapSaved);
        entries = entries.sort(([, a], [, b]) => {
          // There is no guarantee that the order of the object is same as the order of the last saved.
          // So we need to sort them.
          // id is increased by 1 for each.
          // So we can sort by id.
          return parseInt(a.id) - parseInt(b.id);
        });
        for (const [key, value] of entries) {
          this.recentIBCHistoryMap.set(key, value);
        }
      });
    }
    autorun(() => {
      const js = toJS(this.recentIBCHistoryMap);
      const obj = Object.fromEntries(js);
      this.kvStore.set<Record<string, IBCHistory>>(
        "recentIBCTransferHistoryMap",
        obj
      );
    });

    for (const history of this.getRecentIBCHistories()) {
      this.trackIBCPacketForwardingRecursive(history.id);
    }

    // Load skip history sequence from the storage
    const recentSkipHistorySeqSaved = await this.kvStore.get<number>(
      "recentSkipHistorySeq"
    );

    if (recentSkipHistorySeqSaved) {
      // Set the loaded sequence to the observable
      runInAction(() => {
        this.recentSkipHistorySeq = recentSkipHistorySeqSaved;
      });
    }

    // Save the sequence to the storage when the sequence is changed
    autorun(() => {
      const js = toJS(this.recentSkipHistorySeq);
      this.kvStore.set<number>("recentSkipHistorySeq", js);
    });

    // Load skip history from the storage
    const recentSkipHistoryMapSaved = await this.kvStore.get<
      Record<string, SkipHistory>
    >("recentSkipHistoryMap");
    if (recentSkipHistoryMapSaved) {
      runInAction(() => {
        let entries = Object.entries(recentSkipHistoryMapSaved);
        entries = entries.sort(([, a], [, b]) => {
          return parseInt(a.id) - parseInt(b.id);
        });
        for (const [key, value] of entries) {
          this.recentSkipHistoryMap.set(key, value);
        }
      });
    }

    // Save the skip history to the storage when the skip history is changed
    autorun(() => {
      const js = toJS(this.recentSkipHistoryMap);
      const obj = Object.fromEntries(js);
      this.kvStore.set<Record<string, SkipHistory>>(
        "recentSkipHistoryMap",
        obj
      );
    });

    // Track the recent skip history
    for (const history of this.getRecentSkipHistories()) {
      this.trackSkipSwapRecursive(history.id);
    }

    this.chainsService.addChainRemovedHandler(this.onChainRemoved);
  }

  async sendTxAndRecord(
    type: string,
    sourceChainId: string,
    destinationChainId: string,
    tx: unknown,
    mode: "async" | "sync" | "block",
    silent: boolean,
    sender: string,
    recipient: string,
    amount: {
      amount: string;
      denom: string;
    }[],
    memo: string,
    ibcChannels:
      | {
          portId: string;
          channelId: string;
          counterpartyChainId: string;
        }[]
      | undefined,
    notificationInfo: {
      currencies: AppCurrency[];
    },
    shouldLegacyTrack: boolean = false
  ): Promise<Uint8Array> {
    const sourceChainInfo =
      this.chainsService.getChainInfoOrThrow(sourceChainId);
    Bech32Address.validate(
      sender,
      sourceChainInfo.bech32Config?.bech32PrefixAccAddr
    );

    const destinationChainInfo =
      this.chainsService.getChainInfoOrThrow(destinationChainId);
    if (recipient.startsWith("0x")) {
      if (!recipient.match(/^0x[0-9A-Fa-f]*$/) || recipient.length !== 42) {
        throw new Error("Recipient address is not valid hex address");
      }
    } else {
      Bech32Address.validate(
        recipient,
        destinationChainInfo.bech32Config?.bech32PrefixAccAddr
      );
    }

    const txHash = await this.txService.sendTx(sourceChainId, tx, mode, {
      silent,
      onFulfill: (tx) => {
        if (tx.code == null || tx.code === 0) {
          this.addRecentSendHistory(destinationChainId, type, {
            sender,
            recipient,
            amount,
            memo,
            ibcChannels,
          });

          if (tx.hash) {
            if (shouldLegacyTrack) {
              // no wait
              setTimeout(() => {
                simpleFetch<any>("https://api.skip.build/", "/v2/tx/track", {
                  method: "POST",
                  headers: {
                    "content-type": "application/json",
                    ...(() => {
                      const res: { authorization?: string } = {};
                      if (process.env["SKIP_API_KEY"]) {
                        res.authorization = process.env["SKIP_API_KEY"];
                      }

                      return res;
                    })(),
                  },
                  body: JSON.stringify({
                    tx_hash: Buffer.from(tx.hash).toString("hex"),
                    chain_id: sourceChainId,
                  }),
                })
                  .then((result) => {
                    console.log(
                      `Skip tx track result: ${JSON.stringify(result)}`
                    );
                  })
                  .catch((e) => {
                    console.log(e);
                  });
              }, 2000);
            }
          }
        }
      },
    });

    if (ibcChannels && ibcChannels.length > 0) {
      const id = this.addRecentIBCTransferHistory(
        sourceChainId,
        destinationChainId,
        sender,
        recipient,
        amount,
        memo,
        ibcChannels,
        notificationInfo,
        txHash
      );

      this.trackIBCPacketForwardingRecursive(id);
    }

    return txHash;
  }

  async sendTxAndRecordIBCSwap(
    swapType: "amount-in" | "amount-out",
    sourceChainId: string,
    destinationChainId: string,
    tx: unknown,
    mode: "async" | "sync" | "block",
    silent: boolean,
    sender: string,
    amount: {
      amount: string;
      denom: string;
    }[],
    memo: string,
    ibcChannels:
      | {
          portId: string;
          channelId: string;
          counterpartyChainId: string;
        }[],
    destinationAsset: {
      chainId: string;
      denom: string;
    },
    swapChannelIndex: number,
    swapReceiver: string[],
    notificationInfo: {
      currencies: AppCurrency[];
    },
    shouldLegacyTrack: boolean = false
  ): Promise<Uint8Array> {
    const sourceChainInfo =
      this.chainsService.getChainInfoOrThrow(sourceChainId);
    Bech32Address.validate(
      sender,
      sourceChainInfo.bech32Config?.bech32PrefixAccAddr
    );

    this.chainsService.getChainInfoOrThrow(destinationChainId);

    const txHash = await this.txService.sendTx(sourceChainId, tx, mode, {
      silent,
      onFulfill: (tx) => {
        if (tx.code == null || tx.code === 0) {
          if (tx.hash) {
            if (shouldLegacyTrack) {
              setTimeout(() => {
                // no wait
                simpleFetch<any>("https://api.skip.build/", "/v2/tx/track", {
                  method: "POST",
                  headers: {
                    "content-type": "application/json",
                    ...(() => {
                      const res: { authorization?: string } = {};
                      if (process.env["SKIP_API_KEY"]) {
                        res.authorization = process.env["SKIP_API_KEY"];
                      }

                      return res;
                    })(),
                  },
                  body: JSON.stringify({
                    tx_hash: Buffer.from(tx.hash).toString("hex"),
                    chain_id: sourceChainId,
                  }),
                })
                  .then((result) => {
                    console.log(
                      `Skip tx track result: ${JSON.stringify(result)}`
                    );
                  })
                  .catch((e) => {
                    console.log(e);
                  });
              }, 2000);
            }
          }
        }
      },
    });

    if (shouldLegacyTrack) {
      const id = this.addRecentIBCSwapHistory(
        swapType,
        sourceChainId,
        destinationChainId,
        sender,
        amount,
        memo,
        ibcChannels,
        destinationAsset,
        swapChannelIndex,
        swapReceiver,
        notificationInfo,
        txHash
      );

      this.trackIBCPacketForwardingRecursive(id);
    }

    return txHash;
  }

  trackIBCPacketForwardingRecursive(id: string): void {
    retry(
      () => {
        return new Promise<void>((resolve, reject) => {
          this.trackIBCPacketForwardingRecursiveInternal(
            id,
            () => {
              resolve();
            },
            () => {
              // reject if ws closed before fulfilled
              // However, due to the logic, the websocket might close before fulfillment
              // so we add a slight delay.
              // Since there are only synchronous operations after websocket close in trackIBCPacketForwardingRecursiveInternal,
              // this shouldn't cause any issues.
              setTimeout(() => {
                reject();
              }, 500);
            },
            () => {
              // reject if ws error occurred before fulfilled
              reject();
            }
          );
        });
      },
      {
        maxRetries: 10,
        waitMsAfterError: 10 * 1000, // 10sec
        maxWaitMsAfterError: 5 * 60 * 1000, // 5min
      }
    );
  }

  // This is a recursive function for IBC packet forwarding
  // It's separated to perform retries when failures occur
  // Also see trackIBCPacketForwardingRecursive
  // As noted in the comments of trackIBCPacketForwardingRecursive,
  // only synchronous logic should be present after the tx tracer is closed.
  protected trackIBCPacketForwardingRecursiveInternal = (
    id: string,
    onFulfill: () => void,
    onClose: () => void,
    onError: () => void
  ): void => {
    const history = this.getRecentIBCHistory(id);
    if (!history) {
      onFulfill();
      return;
    }

    const needRewind = (() => {
      if (!history.txFulfilled) {
        return false;
      }

      if (history.ibcHistory.length === 0) {
        return false;
      }

      return history.ibcHistory.find((h) => h.error != null) != null;
    })();

    if (needRewind) {
      if (history.ibcHistory.find((h) => h.rewoundButNextRewindingBlocked)) {
        onFulfill();
        return;
      }
      const isTimeoutPacket = history.packetTimeout || false;
      const lastRewoundChannelIndex = history.ibcHistory.findIndex((h) => {
        if (h.rewound) {
          return true;
        }
      });
      const targetChannel = (() => {
        if (lastRewoundChannelIndex >= 0) {
          if (lastRewoundChannelIndex === 0) {
            return undefined;
          }

          return history.ibcHistory[lastRewoundChannelIndex - 1];
        }
        return history.ibcHistory.find((h) => h.error != null);
      })();
      const isSwapTargetChannel =
        targetChannel &&
        "swapChannelIndex" in history &&
        history.ibcHistory.indexOf(targetChannel) ===
          history.swapChannelIndex + 1;

      if (targetChannel && targetChannel.sequence) {
        const prevChainInfo = (() => {
          const targetChannelIndex = history.ibcHistory.findIndex(
            (h) => h === targetChannel
          );
          if (targetChannelIndex < 0) {
            return undefined;
          }
          if (targetChannelIndex === 0) {
            return this.chainsService.getChainInfo(history.chainId);
          }
          return this.chainsService.getChainInfo(
            history.ibcHistory[targetChannelIndex - 1].counterpartyChainId
          );
        })();
        if (prevChainInfo) {
          const txTracer = new TendermintTxTracer(
            prevChainInfo.rpc,
            "/websocket"
          );
          txTracer.addEventListener("close", onClose);
          txTracer.addEventListener("error", onError);
          txTracer
            .traceTx(
              isTimeoutPacket
                ? {
                    // "timeout_packet.packet_src_port": targetChannel.portId,
                    "timeout_packet.packet_src_channel":
                      targetChannel.channelId,
                    "timeout_packet.packet_sequence": targetChannel.sequence,
                  }
                : {
                    // "acknowledge_packet.packet_src_port": targetChannel.portId,
                    "acknowledge_packet.packet_src_channel":
                      targetChannel.channelId,
                    "acknowledge_packet.packet_sequence":
                      targetChannel.sequence,
                  }
            )
            .then((res: any) => {
              txTracer.close();

              if (!res) {
                return;
              }

              runInAction(() => {
                if (isSwapTargetChannel) {
                  const txs = res.txs
                    ? res.txs.map((res: any) => res.tx_result || res)
                    : [res.tx_result || res];
                  if (txs && Array.isArray(txs)) {
                    for (const tx of txs) {
                      if (targetChannel.sequence && "swapReceiver" in history) {
                        const index = isTimeoutPacket
                          ? this.getIBCTimeoutPacketIndexFromTx(
                              tx,
                              targetChannel.portId,
                              targetChannel.channelId,
                              targetChannel.sequence
                            )
                          : this.getIBCAcknowledgementPacketIndexFromTx(
                              tx,
                              targetChannel.portId,
                              targetChannel.channelId,
                              targetChannel.sequence
                            );
                        if (index >= 0) {
                          // Annoyingly, the "timeout_packet" event occurs after the refund logic is executed.
                          const refunded = isTimeoutPacket
                            ? this.getIBCSwapResAmountFromTx(
                                tx,
                                history.swapReceiver[
                                  history.swapChannelIndex + 1
                                ],
                                (() => {
                                  const i =
                                    this.getLastIBCTimeoutPacketBeforeIndexFromTx(
                                      tx,
                                      index
                                    );

                                  if (i < 0) {
                                    return 0;
                                  }
                                  return i;
                                })(),
                                index
                              )
                            : this.getIBCSwapResAmountFromTx(
                                tx,
                                history.swapReceiver[
                                  history.swapChannelIndex + 1
                                ],
                                index
                              );
                          history.swapRefundInfo = {
                            chainId: prevChainInfo.chainId,
                            amount: refunded,
                          };

                          targetChannel.rewoundButNextRewindingBlocked = true;
                          break;
                        }
                      }
                    }
                  }
                }
                targetChannel.rewound = true;
              });
              onFulfill();
              this.trackIBCPacketForwardingRecursive(id);
            });
        }
      }
    } else if (!history.txFulfilled) {
      const chainId = history.chainId;
      const chainInfo = this.chainsService.getChainInfo(chainId);
      const txHash = Buffer.from(history.txHash, "hex");

      if (chainInfo) {
        const txTracer = new TendermintTxTracer(chainInfo.rpc, "/websocket");
        txTracer.addEventListener("close", onClose);
        txTracer.addEventListener("error", onError);

        txTracer.traceTx(txHash).then((tx) => {
          txTracer.close();

          runInAction(() => {
            history.txFulfilled = true;
            if (tx.code != null && tx.code !== 0) {
              history.txError = tx.log || tx.raw_log || "Unknown error";

              // TODO: In this case, it is not currently displayed in the UI. So, delete it for now.
              //       The user can still be aware of the tx failure through notifications, so deleting it here won't prevent them from knowing about the failure.
              this.removeRecentIBCHistory(id);
            } else {
              if ("swapReceiver" in history) {
                const resAmount = this.getIBCSwapResAmountFromTx(
                  tx,
                  history.swapReceiver[0]
                );

                history.resAmount.push(resAmount);
              }

              if (history.ibcHistory.length > 0) {
                const firstChannel = history.ibcHistory[0];

                firstChannel.sequence = this.getIBCPacketSequenceFromTx(
                  tx,
                  firstChannel.portId,
                  firstChannel.channelId
                );
                firstChannel.dstChannelId = this.getDstChannelIdFromTx(
                  tx,
                  firstChannel.portId,
                  firstChannel.channelId
                );

                onFulfill();
                this.trackIBCPacketForwardingRecursive(id);
              }
            }
          });
        });
      }
    } else if (history.ibcHistory.length > 0) {
      const targetChannelIndex = history.ibcHistory.findIndex((history) => {
        return !history.completed;
      });
      const targetChannel =
        targetChannelIndex >= 0
          ? history.ibcHistory[targetChannelIndex]
          : undefined;
      const nextChannel =
        targetChannelIndex >= 0 &&
        targetChannelIndex + 1 < history.ibcHistory.length
          ? history.ibcHistory[targetChannelIndex + 1]
          : undefined;

      if (targetChannel && targetChannel.sequence) {
        const closables: {
          readyState: WsReadyState;
          close: () => void;
        }[] = [];
        let _onFulfillOnce = false;
        const onFulfillOnce = () => {
          if (!_onFulfillOnce) {
            _onFulfillOnce = true;
            closables.forEach((closable) => {
              if (
                closable.readyState === WsReadyState.OPEN ||
                closable.readyState === WsReadyState.CONNECTING
              ) {
                closable.close();
              }
            });
            onFulfill();
          }
        };
        let _onCloseOnce = false;
        const onCloseOnce = () => {
          if (!_onCloseOnce) {
            _onCloseOnce = true;
            closables.forEach((closable) => {
              if (
                closable.readyState === WsReadyState.OPEN ||
                closable.readyState === WsReadyState.CONNECTING
              ) {
                closable.close();
              }
            });
            onClose();
          }
        };
        let _onErrorOnce = false;
        const onErrorOnce = () => {
          if (!_onErrorOnce) {
            _onErrorOnce = true;
            closables.forEach((closable) => {
              if (
                closable.readyState === WsReadyState.OPEN ||
                closable.readyState === WsReadyState.CONNECTING
              ) {
                closable.close();
              }
            });
            onError();
          }
        };

        const chainInfo = this.chainsService.getChainInfo(
          targetChannel.counterpartyChainId
        );
        if (chainInfo) {
          const queryEvents: any = {
            // "recv_packet.packet_src_port": targetChannel.portId,
            "recv_packet.packet_dst_channel": targetChannel.dstChannelId,
            "recv_packet.packet_sequence": targetChannel.sequence,
          };

          const txTracer = new TendermintTxTracer(chainInfo.rpc, "/websocket");
          closables.push(txTracer);
          txTracer.addEventListener("close", onCloseOnce);
          txTracer.addEventListener("error", onErrorOnce);
          txTracer.traceTx(queryEvents).then((res) => {
            txTracer.close();

            if (!res) {
              return;
            }

            const txs = res.txs
              ? res.txs.map((res: any) => res.tx_result || res)
              : [res.tx_result || res];
            if (txs && Array.isArray(txs)) {
              runInAction(() => {
                targetChannel.completed = true;

                for (const tx of txs) {
                  try {
                    const ack = this.getIBCWriteAcknowledgementAckFromTx(
                      tx,
                      targetChannel.portId,
                      targetChannel.channelId,
                      targetChannel.sequence!
                    );

                    if (ack && ack.length > 0) {
                      const str = Buffer.from(ack);
                      try {
                        const decoded = JSON.parse(str.toString());
                        if (decoded.error) {
                          // XXX: {key: 'packet_ack', value: '{"error":"ABCI code: 6: error handling packet: see events for details"}'}
                          //      There's no way to show this kind of error to users because it appears in this format
                          targetChannel.error = "Packet processing failed";
                          onFulfillOnce();
                          this.trackIBCPacketForwardingRecursive(id);
                          break;
                        }
                      } catch (e) {
                        // There's really no way to handle decode failures.
                        // Let's just assume the packet was successful and proceed.
                        console.log(e);
                      }
                    }

                    // Because a tx can contain multiple messages, it's hard to know exactly which event we want.
                    // But logically, the events closest to the recv_packet event is the events we want.
                    const index = this.getIBCRecvPacketIndexFromTx(
                      tx,
                      targetChannel.portId,
                      targetChannel.channelId,
                      targetChannel.sequence!
                    );

                    if (index >= 0) {
                      if ("swapReceiver" in history) {
                        const res: {
                          amount: string;
                          denom: string;
                        }[] = this.getIBCSwapResAmountFromTx(
                          tx,
                          history.swapReceiver[targetChannelIndex + 1],
                          index
                        );

                        history.resAmount.push(res);
                      }

                      if (nextChannel) {
                        nextChannel.sequence = this.getIBCPacketSequenceFromTx(
                          tx,
                          nextChannel.portId,
                          nextChannel.channelId,
                          index
                        );
                        nextChannel.dstChannelId = this.getDstChannelIdFromTx(
                          tx,
                          nextChannel.portId,
                          nextChannel.channelId,
                          index
                        );
                        onFulfillOnce();
                        this.trackIBCPacketForwardingRecursive(id);
                        break;
                      } else {
                        // Packet received to destination chain.
                        if (history.notificationInfo && !history.notified) {
                          runInAction(() => {
                            history.notified = true;
                          });

                          const chainInfo = this.chainsService.getChainInfo(
                            history.destinationChainId
                          );
                          if (chainInfo) {
                            if ("swapType" in history) {
                              if (history.resAmount.length > 0) {
                                const amount =
                                  history.resAmount[
                                    history.resAmount.length - 1
                                  ];
                                const assetsText = amount
                                  .filter((amt) =>
                                    history.notificationInfo!.currencies.find(
                                      (cur) =>
                                        cur.coinMinimalDenom === amt.denom
                                    )
                                  )
                                  .map((amt) => {
                                    const currency =
                                      history.notificationInfo!.currencies.find(
                                        (cur) =>
                                          cur.coinMinimalDenom === amt.denom
                                      );
                                    return new CoinPretty(currency!, amt.amount)
                                      .hideIBCMetadata(true)
                                      .shrink(true)
                                      .maxDecimals(6)
                                      .inequalitySymbol(true)
                                      .trim(true)
                                      .toString();
                                  });
                                if (assetsText.length > 0) {
                                  // Notify user
                                  this.notification.create({
                                    iconRelativeUrl: "assets/logo-256.png",
                                    title: "IBC Swap Succeeded",
                                    message: `${assetsText.join(
                                      ", "
                                    )} received on ${chainInfo.chainName}`,
                                  });
                                }
                              }
                            } else {
                              const assetsText = history.amount
                                .filter((amt) =>
                                  history.notificationInfo!.currencies.find(
                                    (cur) => cur.coinMinimalDenom === amt.denom
                                  )
                                )
                                .map((amt) => {
                                  const currency =
                                    history.notificationInfo!.currencies.find(
                                      (cur) =>
                                        cur.coinMinimalDenom === amt.denom
                                    );
                                  return new CoinPretty(currency!, amt.amount)
                                    .hideIBCMetadata(true)
                                    .shrink(true)
                                    .maxDecimals(6)
                                    .inequalitySymbol(true)
                                    .trim(true)
                                    .toString();
                                });
                              if (assetsText.length > 0) {
                                // Notify user
                                this.notification.create({
                                  iconRelativeUrl: "assets/logo-256.png",
                                  title: "IBC Transfer Succeeded",
                                  message: `${assetsText.join(", ")} sent to ${
                                    chainInfo.chainName
                                  }`,
                                });
                              }
                            }
                          }
                        }
                        onFulfillOnce();
                        break;
                      }
                    }
                  } catch {
                    // noop
                  }
                }
              });
            }
          });
        }

        let prevChainId: string = "";
        if (targetChannelIndex > 0) {
          prevChainId =
            history.ibcHistory[targetChannelIndex - 1].counterpartyChainId;
        } else {
          prevChainId = history.chainId;
        }
        if (prevChainId) {
          const prevChainInfo = this.chainsService.getChainInfo(prevChainId);
          if (prevChainInfo) {
            const queryEvents: any = {
              // Unlike acknowledge_packet, timeout_packet can only be detected from events in the previous chain.
              // So we have no choice but to subscribe to events from the previous chain.
              // However, this means we'll be making the same subscription again in the IBC error tracking logic.
              // Since the logic is already complex, we accept this inefficiency to keep the code less complicated.
              // "timeout_packet.packet_src_port": targetChannel.portId,
              "timeout_packet.packet_src_channel": targetChannel.channelId,
              "timeout_packet.packet_sequence": targetChannel.sequence,
            };

            const txTracer = new TendermintTxTracer(
              prevChainInfo.rpc,
              "/websocket"
            );
            closables.push(txTracer);
            txTracer.addEventListener("close", onCloseOnce);
            txTracer.addEventListener("error", onErrorOnce);
            txTracer.traceTx(queryEvents).then((res) => {
              txTracer.close();

              if (!res) {
                return;
              }

              // At this point, the timeout packet has already been received
              // so we don't need to extract any additional information from res.
              // The res null check above is technically unnecessary but included just in case.
              runInAction(() => {
                targetChannel.error = "Packet timeout";
                history.packetTimeout = true;
                onFulfillOnce();
                this.trackIBCPacketForwardingRecursive(id);
              });
            });
          }
        }
      }
    }
  };

  getRecentSendHistories(chainId: string, type: string): RecentSendHistory[] {
    const key = `${ChainIdHelper.parse(chainId).identifier}/${type}`;
    return (this.recentSendHistoryMap.get(key) ?? []).slice(0, 20);
  }

  @action
  addRecentSendHistory(
    chainId: string,
    type: string,
    history: Omit<RecentSendHistory, "timestamp">
  ) {
    const key = `${ChainIdHelper.parse(chainId).identifier}/${type}`;

    let histories = this.recentSendHistoryMap.get(key) ?? [];
    histories.unshift({
      timestamp: Date.now(),
      ...history,
    });
    histories = histories.slice(0, 20);

    this.recentSendHistoryMap.set(key, histories);
  }

  @action
  addRecentIBCTransferHistory(
    chainId: string,
    destinationChainId: string,
    sender: string,
    recipient: string,
    amount: {
      amount: string;
      denom: string;
    }[],
    memo: string,
    ibcChannels:
      | {
          portId: string;
          channelId: string;
          counterpartyChainId: string;
        }[],
    notificationInfo: {
      currencies: AppCurrency[];
    },
    txHash: Uint8Array
  ): string {
    const id = (this.recentIBCHistorySeq++).toString();

    const history: IBCHistory = {
      id,
      chainId,
      destinationChainId,
      timestamp: Date.now(),
      sender,
      recipient,
      amount,
      memo,

      ibcHistory: ibcChannels.map((channel) => {
        return {
          portId: channel.portId,
          channelId: channel.channelId,
          counterpartyChainId: channel.counterpartyChainId,

          completed: false,
        };
      }),
      notificationInfo,
      txHash: Buffer.from(txHash).toString("hex"),
    };

    this.recentIBCHistoryMap.set(id, history);

    return id;
  }

  @action
  addRecentIBCSwapHistory(
    swapType: "amount-in" | "amount-out",
    chainId: string,
    destinationChainId: string,
    sender: string,
    amount: {
      amount: string;
      denom: string;
    }[],
    memo: string,
    ibcChannels:
      | {
          portId: string;
          channelId: string;
          counterpartyChainId: string;
        }[],
    destinationAsset: {
      chainId: string;
      denom: string;
    },
    swapChannelIndex: number,
    swapReceiver: string[],
    notificationInfo: {
      currencies: AppCurrency[];
    },
    txHash: Uint8Array
  ): string {
    const id = (this.recentIBCHistorySeq++).toString();

    const history: IBCHistory = {
      id,
      swapType,
      chainId,
      destinationChainId,
      timestamp: Date.now(),
      sender,
      amount,
      memo,

      ibcHistory: ibcChannels.map((channel) => {
        return {
          portId: channel.portId,
          channelId: channel.channelId,
          counterpartyChainId: channel.counterpartyChainId,

          completed: false,
        };
      }),
      destinationAsset,
      swapChannelIndex,
      swapReceiver,
      resAmount: [],
      notificationInfo,
      txHash: Buffer.from(txHash).toString("hex"),
    };

    this.recentIBCHistoryMap.set(id, history);

    return id;
  }

  getRecentIBCHistory(id: string): IBCHistory | undefined {
    return this.recentIBCHistoryMap.get(id);
  }

  getRecentIBCHistories(): IBCHistory[] {
    return Array.from(this.recentIBCHistoryMap.values()).filter((history) => {
      if (!this.chainsService.hasChainInfo(history.chainId)) {
        return false;
      }

      if (!this.chainsService.hasChainInfo(history.destinationChainId)) {
        return false;
      }

      if (
        history.ibcHistory.some((history) => {
          return !this.chainsService.hasChainInfo(history.counterpartyChainId);
        })
      ) {
        return false;
      }

      return true;
    });
  }

  @action
  removeRecentIBCHistory(id: string): boolean {
    return this.recentIBCHistoryMap.delete(id);
  }

  @action
  clearAllRecentIBCHistory(): void {
    this.recentIBCHistoryMap.clear();
  }

  // skip related methods
  @action
  recordTxWithSkipSwap(
    sourceChainId: string,
    destinationChainId: string,
    destinationAsset: {
      chainId: string;
      denom: string;
      expectedAmount: string;
    },
    simpleRoute: {
      isOnlyEvm: boolean;
      chainId: string;
      receiver: string;
    }[],
    sender: string,
    recipient: string,
    amount: {
      amount: string;
      denom: string;
    }[],
    notificationInfo: {
      currencies: AppCurrency[];
    },
    routeDurationSeconds: number = 0,
    txHash: string,
    isOnlyUseBridge?: boolean
  ): string {
    const id = (this.recentIBCHistorySeq++).toString();

    const history: SkipHistory = {
      id,
      chainId: sourceChainId,
      destinationChainId: destinationChainId,
      destinationAsset,
      simpleRoute,
      sender,
      recipient,
      amount,
      notificationInfo,
      routeDurationSeconds: routeDurationSeconds,
      txHash,
      routeIndex: -1,
      resAmount: [],
      timestamp: Date.now(),
      isOnlyUseBridge,
    };

    this.recentSkipHistoryMap.set(id, history);
    this.trackSkipSwapRecursive(id);

    return id;
  }

  getRecentSkipHistory(id: string): SkipHistory | undefined {
    return this.recentSkipHistoryMap.get(id);
  }

  getRecentSkipHistories(): SkipHistory[] {
    return Array.from(this.recentSkipHistoryMap.values()).filter((history) => {
      if (!this.chainsService.hasChainInfo(history.chainId)) {
        return false;
      }

      if (!this.chainsService.hasChainInfo(history.destinationChainId)) {
        return false;
      }

      if (
        history.simpleRoute.some((route) => {
          return !this.chainsService.hasChainInfo(route.chainId);
        })
      ) {
        return false;
      }

      return true;
    });
  }

  trackSkipSwapRecursive(id: string): void {
    const history = this.getRecentSkipHistory(id);
    if (!history) {
      return;
    }

    // check tx fulfilled and update history
    retry(
      () => {
        return new Promise<void>((txFulfilledResolve, txFulfilledReject) => {
          this.checkAndTrackSkipSwapTxFulfilledRecursive(
            history,
            (keepTracking: boolean) => {
              txFulfilledResolve();

              if (!keepTracking) {
                return;
              }

              const now = Date.now();
              const expectedEndTimestamp =
                history.timestamp + history.routeDurationSeconds * 1000;
              const diff = expectedEndTimestamp - now;

              const waitMsAfterError = 5 * 1000;
              const maxRetries = diff > 0 ? diff / waitMsAfterError : 10;

              retry(
                () => {
                  return new Promise<void>((resolve, reject) => {
                    this.checkAndUpdateSkipSwapHistoryRecursive(
                      id,
                      resolve,
                      reject
                    );
                  });
                },
                {
                  maxRetries,
                  waitMsAfterError,
                  maxWaitMsAfterError: 30 * 1000, // 30sec
                }
              );
            },
            txFulfilledReject
          );
        });
      },
      {
        maxRetries: 10,
        waitMsAfterError: 500,
        maxWaitMsAfterError: 4000,
      }
    );
  }

  protected checkAndTrackSkipSwapTxFulfilledRecursive = (
    history: SkipHistory,
    onFulfill: (keepTracking: boolean) => void,
    onError: () => void
  ): void => {
    const chainInfo = this.chainsService.getChainInfo(history.chainId);
    if (!chainInfo) {
      onFulfill(false);
      return;
    }

    if (this.chainsService.isEvmChain(history.chainId)) {
      const evmInfo = chainInfo.evm;
      if (!evmInfo) {
        onFulfill(false);
        return;
      }

      simpleFetch<{
        result: EthTxReceipt | null;
        error?: Error;
      }>(evmInfo.rpc, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "request-source": origin,
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "eth_getTransactionReceipt",
          params: [history.txHash],
          id: 1,
        }),
      })
        .then((res) => {
          const txReceipt = res.data.result;
          if (txReceipt) {
            if (txReceipt.status === EthTxStatus.Success) {
              setTimeout(() => {
                simpleFetch("https://api.skip.build/", "/v2/tx/track", {
                  method: "POST",
                  headers: {
                    "content-type": "application/json",
                    ...(() => {
                      const res: {
                        authorization?: string;
                      } = {};
                      if (process.env["SKIP_API_KEY"]) {
                        res.authorization = process.env["SKIP_API_KEY"];
                      }
                      return res;
                    })(),
                  },
                  body: JSON.stringify({
                    tx_hash: history.txHash,
                    chain_id: history.chainId.replace("eip155:", ""),
                  }),
                })
                  .then((result) => {
                    console.log(
                      `Skip tx track result: ${JSON.stringify(result)}`
                    );
                    onFulfill(true);
                  })
                  .catch((e) => {
                    console.log(e);
                    this.removeRecentSkipHistory(history.id);
                    onFulfill(false);
                  });
              }, 2000);
            } else {
              // If the transaction failed, terminate
              this.removeRecentSkipHistory(history.id);
              onFulfill(false);
            }
          } else {
            onError();
          }
        })
        .catch(() => {
          // If an error occurs, terminate
          onFulfill(false);
        });
    } else {
      const txTracer = new TendermintTxTracer(chainInfo.rpc, "/websocket");
      txTracer.addEventListener("error", () => onFulfill(false));
      txTracer
        .traceTx(Buffer.from(history.txHash.replace("0x", ""), "hex"))
        .then((res: any) => {
          txTracer.close();

          let txResult;

          if (Array.isArray(res.txs)) {
            if (res.txs && res.txs.length > 0) {
              txResult = res.txs[0].tx_result;
            } else {
              // In case tx is not confirmed, just wait for next check
              onError();
              return;
            }
          } else {
            txResult = res;
          }

          if (!txResult || typeof txResult.code !== "number") {
            onError();
            return;
          }

          if (txResult.code === 0) {
            setTimeout(() => {
              simpleFetch("https://api.skip.build/", "/v2/tx/track", {
                method: "POST",
                headers: {
                  "content-type": "application/json",
                  ...(() => {
                    const res: {
                      authorization?: string;
                    } = {};
                    if (process.env["SKIP_API_KEY"]) {
                      res.authorization = process.env["SKIP_API_KEY"];
                    }
                    return res;
                  })(),
                },
                body: JSON.stringify({
                  tx_hash: history.txHash,
                  chain_id: history.chainId,
                }),
              })
                .then((result) => {
                  console.log(
                    `Skip tx track result: ${JSON.stringify(result)}`
                  );
                  onFulfill(true);
                })
                .catch((e) => {
                  console.log(e);
                  this.removeRecentSkipHistory(history.id);
                  onFulfill(false);
                });
            }, 2000);
          } else {
            // If the transaction failed, terminate
            this.removeRecentSkipHistory(history.id);
            onFulfill(false);
          }
        })
        .catch(() => {
          // If an error occurs, terminate
          onFulfill(false);
        });
    }
  };

  protected checkAndUpdateSkipSwapHistoryRecursive = (
    id: string,
    onFulfill: () => void,
    onError: () => void
  ): void => {
    const history = this.getRecentSkipHistory(id);
    if (!history) {
      onFulfill();
      return;
    }

    const { txHash, chainId, trackStatus, trackDone, routeIndex, simpleRoute } =
      history;

    // Determine if execution is necessary
    const needRun = (() => {
      // 1) If status is COMPLETED but there are still routes remaining
      if (
        trackStatus?.includes("COMPLETED") &&
        routeIndex !== simpleRoute.length - 1
      ) {
        return true;
      }
      // 2) If status doesn't exist or tracking is not complete
      if (!trackStatus || !trackDone) {
        return true;
      }
      return false;
    })();

    // If no further progress is needed, terminate
    if (!needRun) {
      onFulfill();
      return;
    }

    // Request information to send to Skip API
    const request: StatusRequest = {
      tx_hash: txHash,
      chain_id: chainId.replace("eip155:", ""),
    };
    const requestParams = new URLSearchParams(request).toString();

    simpleFetch<TxStatusResponse>(
      "https://api.skip.build/",
      `v2/tx/status?${requestParams}`,
      {
        method: "GET",
        headers: {
          "content-type": "application/json",
          ...(() => {
            const res: { authorization?: string } = {};
            if (process.env["SKIP_API_KEY"]) {
              res.authorization = process.env["SKIP_API_KEY"];
            }
            return res;
          })(),
        },
      }
    )
      .then((res) => {
        const {
          state,
          error,
          transfer_sequence,
          next_blocking_transfer,
          transfer_asset_release,
        } = res.data;

        // Update status
        history.trackStatus = state;

        // If tracking is uncertain or incomplete, handle error and retry
        if (
          [
            "STATE_SUBMITTED",
            "STATE_RECEIVED",
            "STATE_COMPLETED",
            "STATE_UNKNOWN",
          ].includes(state)
        ) {
          onError();
          return;
        }

        // Assume normal tracking progress
        history.trackError = undefined;

        const currentRouteIndex =
          history.routeIndex < 0 ? 0 : history.routeIndex;
        let nextRouteIndex = currentRouteIndex;
        let errorMsg: string | undefined = error?.message;

        // If there is unlocked asset information, save it
        if (transfer_asset_release) {
          history.transferAssetRelease = transfer_asset_release;
        }

        // Index of the next blocking transfer
        const nextBlockingTransferIndex =
          next_blocking_transfer?.transfer_sequence_index ??
          transfer_sequence.length - 1;
        const transfer = transfer_sequence[nextBlockingTransferIndex];

        // Determine the transfer type to decide targetChainId / errorMsg / receiveTxHash (if-else chain)
        let targetChainId: string | undefined;
        let receiveTxHash: string | undefined;

        if (transfer) {
          if ("ibc_transfer" in transfer) {
            const {
              state: ibcState,
              from_chain_id,
              to_chain_id,
              packet_txs,
            } = transfer.ibc_transfer;
            switch (ibcState) {
              case "TRANSFER_UNKNOWN":
                targetChainId = from_chain_id;
                errorMsg =
                  packet_txs.error?.message ?? "Unknown IBC transfer error";
                break;
              case "TRANSFER_FAILURE":
                targetChainId = to_chain_id;
                errorMsg = packet_txs.error?.message ?? "IBC transfer failed";
                break;
              case "TRANSFER_PENDING":
              case "TRANSFER_RECEIVED":
                targetChainId = from_chain_id;
                break;
              case "TRANSFER_SUCCESS":
                targetChainId = to_chain_id;
                receiveTxHash = packet_txs.receive_tx?.tx_hash;
                break;
            }
          } else if ("axelar_transfer" in transfer) {
            const {
              state: axelarState,
              from_chain_id,
              to_chain_id,
            } = transfer.axelar_transfer;
            switch (axelarState) {
              case "AXELAR_TRANSFER_UNKNOWN":
                targetChainId = from_chain_id;
                errorMsg = "Unknown Axelar transfer error";
                break;
              case "AXELAR_TRANSFER_FAILURE":
                targetChainId = to_chain_id;
                errorMsg = "Axelar transfer failed";
                break;
              case "AXELAR_TRANSFER_PENDING_CONFIRMATION":
              case "AXELAR_TRANSFER_PENDING_RECEIPT":
                targetChainId = to_chain_id;
                break;
              case "AXELAR_TRANSFER_SUCCESS":
                targetChainId = to_chain_id;
                receiveTxHash =
                  "contract_call_with_token_txs" in transfer.axelar_transfer.txs
                    ? transfer.axelar_transfer.txs.contract_call_with_token_txs
                        .execute_tx?.tx_hash
                    : transfer.axelar_transfer.txs.send_token_txs.execute_tx
                        ?.tx_hash;
                break;
            }
          } else if ("cctp_transfer" in transfer) {
            const {
              state: cctpState,
              from_chain_id,
              to_chain_id,
            } = transfer.cctp_transfer;
            switch (cctpState) {
              case "CCTP_TRANSFER_UNKNOWN":
                targetChainId = from_chain_id;
                errorMsg = "Unknown CCTP transfer error";
                break;
              case "CCTP_TRANSFER_SENT":
                targetChainId = from_chain_id;
                break;
              case "CCTP_TRANSFER_CONFIRMED":
              case "CCTP_TRANSFER_PENDING_CONFIRMATION":
                targetChainId = to_chain_id;
                break;
              case "CCTP_TRANSFER_RECEIVED":
                targetChainId = to_chain_id;
                receiveTxHash = transfer.cctp_transfer.txs.receive_tx?.tx_hash;
                break;
            }
          } else if ("hyperlane_transfer" in transfer) {
            const {
              state: hyperState,
              from_chain_id,
              to_chain_id,
            } = transfer.hyperlane_transfer;
            switch (hyperState) {
              case "HYPERLANE_TRANSFER_UNKNOWN":
                targetChainId = from_chain_id;
                errorMsg = "Unknown Hyperlane transfer error";
                break;
              case "HYPERLANE_TRANSFER_FAILED":
                targetChainId = to_chain_id;
                errorMsg = "Hyperlane transfer failed";
                break;
              case "HYPERLANE_TRANSFER_SENT":
                targetChainId = from_chain_id;
                break;
              case "HYPERLANE_TRANSFER_RECEIVED":
                targetChainId = to_chain_id;
                receiveTxHash =
                  transfer.hyperlane_transfer.txs.receive_tx?.tx_hash;
                break;
            }
          } else if ("op_init_transfer" in transfer) {
            const {
              state: opState,
              from_chain_id,
              to_chain_id,
            } = transfer.op_init_transfer;
            switch (opState) {
              case "OPINIT_TRANSFER_UNKNOWN":
                targetChainId = from_chain_id;
                errorMsg = "Unknown OP_INIT transfer error";
                break;
              case "OPINIT_TRANSFER_RECEIVED":
                targetChainId = from_chain_id;
                break;
              case "OPINIT_TRANSFER_SENT":
                targetChainId = to_chain_id;
                break;
            }
          } else if ("go_fast_transfer" in transfer) {
            const {
              state: gofastState,
              from_chain_id,
              to_chain_id,
            } = transfer.go_fast_transfer;
            switch (gofastState) {
              case "GO_FAST_TRANSFER_UNKNOWN":
                targetChainId = from_chain_id;
                errorMsg = "Unknown GoFast transfer error";
                break;
              case "GO_FAST_TRANSFER_SENT":
                targetChainId = from_chain_id;
                break;
              case "GO_FAST_TRANSFER_TIMEOUT":
                targetChainId = from_chain_id;
                errorMsg = "GoFast transfer timeout";
                break;
              case "GO_FAST_POST_ACTION_FAILED":
                targetChainId = from_chain_id;
                errorMsg = "GoFast post action failed";
                break;
              case "GO_FAST_TRANSFER_REFUNDED":
                targetChainId = to_chain_id;
                errorMsg = "GoFast transfer refunded";
                break;
              case "GO_FAST_TRANSFER_FILLED":
                targetChainId = to_chain_id;
                receiveTxHash =
                  transfer.go_fast_transfer.txs.order_filled_tx?.tx_hash;
                break;
            }
          } else if ("stargate_transfer" in transfer) {
            const {
              state: sgState,
              from_chain_id,
              to_chain_id,
            } = transfer.stargate_transfer;
            switch (sgState) {
              case "STARGATE_TRANSFER_UNKNOWN":
                targetChainId = from_chain_id;
                errorMsg = "Unknown Stargate transfer error";
                break;
              case "STARGATE_TRANSFER_FAILED":
                targetChainId = to_chain_id;
                errorMsg = "Stargate transfer failed";
                break;
              case "STARGATE_TRANSFER_SENT":
                targetChainId = from_chain_id;
                break;
              case "STARGATE_TRANSFER_RECEIVED":
                targetChainId = to_chain_id;
                break;
            }
          } else if ("eureka_transfer" in transfer) {
            const {
              state: eurekaState,
              from_chain_id,
              to_chain_id,
            } = transfer.eureka_transfer;
            switch (eurekaState) {
              case "TRANSFER_UNKNOWN":
                targetChainId = from_chain_id;
                errorMsg = "Unknown Eureka transfer error";
                break;
              case "TRANSFER_PENDING":
                targetChainId = from_chain_id;
                break;
              case "TRANSFER_RECEIVED":
                targetChainId = to_chain_id;
                break;
              case "TRANSFER_SUCCESS":
                targetChainId = to_chain_id;
                receiveTxHash =
                  transfer.eureka_transfer.packet_txs.receive_tx?.tx_hash;
                break;
              case "TRANSFER_FAILURE":
                targetChainId = from_chain_id;
                errorMsg = "Eureka transfer failed";
                break;
            }
          }
        } else {
          // This probably only occurs on EVM chains, where it seems to be processed as if there's no transfer
          targetChainId = history.destinationChainId;
          receiveTxHash = history.txHash;
        }

        // Update next route index based on the found targetChainId
        if (targetChainId) {
          for (let i = currentRouteIndex; i < simpleRoute.length; i++) {
            const routeChain = simpleRoute[i].chainId.replace("eip155:", "");
            if (
              routeChain.toLocaleLowerCase() ===
              targetChainId.toLocaleLowerCase()
            ) {
              nextRouteIndex = i;
              break;
            }
          }

          // Even if not found, optimistically move to the next try
        }

        // Update error message
        history.trackError = errorMsg;
        // Final routeIndex update
        history.routeIndex = nextRouteIndex;

        // Decide whether to complete tracking or retry based on state
        switch (state) {
          case "STATE_ABANDONED":
          case "STATE_COMPLETED_ERROR":
          case "STATE_COMPLETED_SUCCESS":
            // If successful but routes remain, move to the last route
            if (
              state === "STATE_COMPLETED_SUCCESS" &&
              nextRouteIndex !== simpleRoute.length - 1
            ) {
              history.routeIndex = simpleRoute.length - 1;
            }

            if (receiveTxHash) {
              this.trackDestinationAssetAmount(id, receiveTxHash, onFulfill);
            } else {
              history.trackDone = true;
              onFulfill();
            }
            break;

          case "STATE_PENDING":
          case "STATE_PENDING_ERROR":
            // Still tracking or propagating error state => retry
            onError();
            break;
        }
      })
      .catch((e) => {
        console.error(e);
        onError();
      });
  };

  protected trackDestinationAssetAmount(
    historyId: string,
    txHash: string,
    onFulfill: () => void
  ) {
    const history = this.getRecentSkipHistory(historyId);
    if (!history) {
      onFulfill();
      return;
    }

    const chainInfo = this.chainsService.getChainInfo(
      history.destinationChainId
    );
    if (!chainInfo) {
      onFulfill();
      return;
    }

    if (this.chainsService.isEvmChain(history.destinationChainId)) {
      const evmInfo = chainInfo.evm;
      if (!evmInfo) {
        onFulfill();
        return;
      }

      simpleFetch<{
        result: EthTxReceipt | null;
        error?: Error;
      }>(evmInfo.rpc, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "request-source": origin,
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "eth_getTransactionReceipt",
          params: [txHash],
          id: 1,
        }),
      })
        .then((res) => {
          const txReceipt = res.data.result;
          if (txReceipt) {
            simpleFetch<{
              result: any;
              error?: Error;
            }>(evmInfo.rpc, {
              method: "POST",
              headers: {
                "content-type": "application/json",
                "request-source": origin,
              },
              body: JSON.stringify({
                jsonrpc: "2.0",
                method: "debug_traceTransaction",
                params: [txHash, { tracer: "callTracer" }],
                id: 1,
              }),
            }).then((res) => {
              runInAction(() => {
                let isFoundFromCall = false;
                if (res.data.result) {
                  const searchForTransfers = (calls: any) => {
                    for (const call of calls) {
                      if (
                        call.type === "CALL" &&
                        call.to.toLowerCase() ===
                          history.recipient.toLowerCase()
                      ) {
                        const isERC20Transfer =
                          call.input.startsWith("0xa9059cbb");
                        const value = BigInt(
                          isERC20Transfer
                            ? `0x${call.input.substring(74)}`
                            : call.value
                        );

                        history.resAmount.push([
                          {
                            amount: value.toString(10),
                            denom: history.destinationAsset.denom,
                          },
                        ]);
                        isFoundFromCall = true;
                      }

                      if (call.calls && call.calls.length > 0) {
                        searchForTransfers(call.calls);
                      }
                    }
                  };

                  searchForTransfers(res.data.result.calls || []);
                }

                if (isFoundFromCall) {
                  history.trackDone = true;
                  return;
                }

                const logs = txReceipt.logs;
                const transferTopic = id("Transfer(address,address,uint256)");
                const withdrawTopic = id("Withdrawal(address,uint256)");
                const hyperlaneReceiveTopic = id(
                  "ReceivedTransferRemote(uint32,bytes32,uint256)"
                );
                for (const log of logs) {
                  if (log.topics[0] === transferTopic) {
                    const to = "0x" + log.topics[2].slice(26);
                    if (to.toLowerCase() === history.recipient.toLowerCase()) {
                      const destinationAssetDenom =
                        history.destinationAsset.denom.replace("erc20:", "");

                      const amount = BigInt(log.data).toString(10);
                      if (log.address === destinationAssetDenom) {
                        history.resAmount.push([
                          {
                            amount,
                            denom: history.destinationAsset.denom,
                          },
                        ]);
                      } else {
                        console.log("refunded", log.address);
                        // In case of Transfer topic, it would be an ERC20 transfer call
                        // If called from a contract other than the token contract to be received, we assume the Swap failed
                        // Therefore, save the refund information with the contract address of the token actually received
                        history.trackError = "Swap failed";
                        history.swapRefundInfo = {
                          chainId: history.destinationChainId,
                          amount: [
                            {
                              amount,
                              denom: `erc20:${log.address.toLowerCase()}`,
                            },
                          ],
                        };
                      }

                      history.trackDone = true;
                      return;
                    }
                  } else if (log.topics[0] === withdrawTopic) {
                    const to = "0x" + log.topics[1].slice(26);
                    if (to.toLowerCase() === txReceipt.to.toLowerCase()) {
                      const amount = BigInt(log.data).toString(10);
                      history.resAmount.push([
                        { amount, denom: history.destinationAsset.denom },
                      ]);
                      history.trackDone = true;
                      return;
                    }
                  } else if (log.topics[0] === hyperlaneReceiveTopic) {
                    const to = "0x" + log.topics[2].slice(26);
                    if (to.toLowerCase() === history.recipient.toLowerCase()) {
                      const amount = BigInt(log.data).toString(10);
                      // When receiving TIA via Hyperlane to Forma, the token amount is recorded with decimal 6,
                      // but in Forma it's decimal 18, so we need to add 12 zeros.
                      history.resAmount.push([
                        {
                          amount:
                            history.destinationAsset.denom === "forma-native"
                              ? `${amount}000000000000`
                              : amount,
                          denom: history.destinationAsset.denom,
                        },
                      ]);
                      history.trackDone = true;
                      return;
                    }
                  }
                }
              });
            });
          }
        })
        .finally(() => {
          history.trackDone = true;
          onFulfill();
        });
    } else {
      const txTracer = new TendermintTxTracer(chainInfo.rpc, "/websocket");
      txTracer.addEventListener("error", () => onFulfill());
      txTracer
        .queryTx({
          "tx.hash": txHash,
        })
        .then((res: any) => {
          txTracer.close();

          if (!res) {
            return;
          }
          runInAction(() => {
            const txs = res.txs
              ? res.txs.map((res: any) => res.tx_result || res)
              : [res.tx_result || res];
            for (const tx of txs) {
              const resAmount = this.getIBCSwapResAmountFromTx(
                tx,
                history.recipient
              );

              history.resAmount.push(resAmount);
              history.trackDone = true;
              return;
            }
          });
        })
        .finally(() => {
          history.trackDone = true;
          onFulfill();
        });
    }
  }

  @action
  removeRecentSkipHistory(id: string): boolean {
    return this.recentSkipHistoryMap.delete(id);
  }

  @action
  clearAllRecentSkipHistory(): void {
    this.recentSkipHistoryMap.clear();
  }

  protected getIBCWriteAcknowledgementAckFromTx(
    tx: any,
    sourcePortId: string,
    sourceChannelId: string,
    sequence: string
  ): Uint8Array | undefined {
    const events = tx.events;
    if (!events) {
      throw new Error("Invalid tx");
    }
    if (!Array.isArray(events)) {
      throw new Error("Invalid tx");
    }

    // In injective, events from tendermint rpc is not encoded as base64.
    // I don't know that this is the difference from tendermint version, or just custom from injective.
    const compareStringWithBase64OrPlain = (
      target: string,
      value: string
    ): [boolean, boolean] => {
      if (target === value) {
        return [true, false];
      }

      if (target === Buffer.from(value).toString("base64")) {
        return [true, true];
      }

      return [false, false];
    };

    const packetEvent = events.find((event: any) => {
      if (event.type !== "write_acknowledgement") {
        return false;
      }
      const sourcePortAttr = event.attributes.find((attr: { key: string }) => {
        return compareStringWithBase64OrPlain(attr.key, "packet_src_port")[0];
      });
      if (!sourcePortAttr) {
        return false;
      }
      const sourceChannelAttr = event.attributes.find(
        (attr: { key: string }) => {
          return compareStringWithBase64OrPlain(
            attr.key,
            "packet_src_channel"
          )[0];
        }
      );
      if (!sourceChannelAttr) {
        return false;
      }
      let isBase64 = false;
      const sequenceAttr = event.attributes.find((attr: { key: string }) => {
        const c = compareStringWithBase64OrPlain(attr.key, "packet_sequence");
        isBase64 = c[1];
        return c[0];
      });
      if (!sequenceAttr) {
        return false;
      }

      if (isBase64) {
        return (
          Buffer.from(sourcePortAttr.value, "base64").toString() ===
            sourcePortId &&
          Buffer.from(sourceChannelAttr.value, "base64").toString() ===
            sourceChannelId &&
          Buffer.from(sequenceAttr.value, "base64").toString() === sequence
        );
      } else {
        return (
          sourcePortAttr.value === sourcePortId &&
          sourceChannelAttr.value === sourceChannelId &&
          sequenceAttr.value === sequence
        );
      }
    });
    if (!packetEvent) {
      return;
    }

    let isBase64 = false;
    const ackAttr = packetEvent.attributes.find((attr: { key: string }) => {
      const r = compareStringWithBase64OrPlain(attr.key, "packet_ack");
      isBase64 = r[1];
      return r[0];
    });

    if (ackAttr) {
      if (isBase64) {
        return Buffer.from(ackAttr.value, "base64");
      } else {
        return Buffer.from(ackAttr.value);
      }
    }

    return;
  }

  protected getIBCSwapResAmountFromTx(
    tx: any,
    receiver: string,
    startEventsIndex: number = 0,
    endEventsIndex: number = -1
  ): {
    amount: string;
    denom: string;
  }[] {
    // The Skip contract doesn't seem to emit convenient events that we can use.
    // So it's difficult to do anything precise here.
    // We'll try a reasonable approach that should work in 99% of cases...
    const events = tx.events.slice(
      startEventsIndex,
      endEventsIndex >= 0 ? endEventsIndex : undefined
    ) as {
      type: string;
      attributes: {
        key: string;
        value: string;
      }[];
    }[];

    // In injective, events from tendermint rpc is not encoded as base64.
    // I don't know that this is the difference from tendermint version, or just custom from injective.
    const compareStringWithBase64OrPlain = (
      target: string,
      value: string
    ): [boolean, boolean] => {
      if (target === value) {
        return [true, false];
      }

      if (target === Buffer.from(value).toString("base64")) {
        return [true, true];
      }

      return [false, false];
    };

    // The events closest to the end of the tx are likely to be most relevant to the result...
    // Simply find the last coin_received event.
    const receiveEvent = events.reverse().find((event) => {
      if (event.type === "coin_received") {
        const attr = event.attributes.find((attr) => {
          return (
            compareStringWithBase64OrPlain(attr.key, "receiver")[0] &&
            compareStringWithBase64OrPlain(attr.value, receiver)[0]
          );
        });

        if (attr) {
          return true;
        }
      }

      return false;
    });

    if (receiveEvent) {
      let isBase64 = false;
      const amountAttr = receiveEvent.attributes.find((attr) => {
        const c = compareStringWithBase64OrPlain(attr.key, "amount");
        isBase64 = c[1];
        return c[0];
      });
      if (amountAttr) {
        const amount = isBase64
          ? Buffer.from(amountAttr.value, "base64").toString()
          : amountAttr.value;
        const split = amount.split(/^([0-9]+)(\s)*([a-zA-Z][a-zA-Z0-9/-]*)$/);

        // If this if statement fails, we're already in trouble... there's no good way to handle this error, so just continue
        if (split.length === 5) {
          const amount = split[1];
          const denom = split[3];
          return [
            {
              denom,
              amount,
            },
          ];
        }
      }
    }

    return [];
  }

  protected getIBCAcknowledgementPacketIndexFromTx(
    tx: any,
    sourcePortId: string,
    sourceChannelId: string,
    sequence: string
  ): number {
    const events = tx.events;
    if (!events) {
      throw new Error("Invalid tx");
    }
    if (!Array.isArray(events)) {
      throw new Error("Invalid tx");
    }

    // In injective, events from tendermint rpc is not encoded as base64.
    // I don't know that this is the difference from tendermint version, or just custom from injective.
    const compareStringWithBase64OrPlain = (
      target: string,
      value: string
    ): [boolean, boolean] => {
      if (target === value) {
        return [true, false];
      }

      if (target === Buffer.from(value).toString("base64")) {
        return [true, true];
      }

      return [false, false];
    };

    const packetEvent = events.find((event: any) => {
      if (event.type !== "acknowledge_packet") {
        return false;
      }
      const sourcePortAttr = event.attributes.find((attr: { key: string }) => {
        return compareStringWithBase64OrPlain(attr.key, "packet_src_port")[0];
      });
      if (!sourcePortAttr) {
        return false;
      }
      const sourceChannelAttr = event.attributes.find(
        (attr: { key: string }) => {
          return compareStringWithBase64OrPlain(
            attr.key,
            "packet_src_channel"
          )[0];
        }
      );
      if (!sourceChannelAttr) {
        return false;
      }
      let isBase64 = false;
      const sequenceAttr = event.attributes.find((attr: { key: string }) => {
        const c = compareStringWithBase64OrPlain(attr.key, "packet_sequence");
        isBase64 = c[1];
        return c[0];
      });
      if (!sequenceAttr) {
        return false;
      }

      if (isBase64) {
        return (
          Buffer.from(sourcePortAttr.value, "base64").toString() ===
            sourcePortId &&
          Buffer.from(sourceChannelAttr.value, "base64").toString() ===
            sourceChannelId &&
          Buffer.from(sequenceAttr.value, "base64").toString() === sequence
        );
      } else {
        return (
          sourcePortAttr.value === sourcePortId &&
          sourceChannelAttr.value === sourceChannelId &&
          sequenceAttr.value === sequence
        );
      }
    });
    if (!packetEvent) {
      return -1;
    }

    return events.indexOf(packetEvent);
  }

  protected getIBCTimeoutPacketIndexFromTx(
    tx: any,
    sourcePortId: string,
    sourceChannelId: string,
    sequence: string
  ): number {
    const events = tx.events;
    if (!events) {
      throw new Error("Invalid tx");
    }
    if (!Array.isArray(events)) {
      throw new Error("Invalid tx");
    }

    // In injective, events from tendermint rpc is not encoded as base64.
    // I don't know that this is the difference from tendermint version, or just custom from injective.
    const compareStringWithBase64OrPlain = (
      target: string,
      value: string
    ): [boolean, boolean] => {
      if (target === value) {
        return [true, false];
      }

      if (target === Buffer.from(value).toString("base64")) {
        return [true, true];
      }

      return [false, false];
    };

    const packetEvent = events.find((event: any) => {
      if (event.type !== "timeout_packet") {
        return false;
      }
      const sourcePortAttr = event.attributes.find((attr: { key: string }) => {
        return compareStringWithBase64OrPlain(attr.key, "packet_src_port")[0];
      });
      if (!sourcePortAttr) {
        return false;
      }
      const sourceChannelAttr = event.attributes.find(
        (attr: { key: string }) => {
          return compareStringWithBase64OrPlain(
            attr.key,
            "packet_src_channel"
          )[0];
        }
      );
      if (!sourceChannelAttr) {
        return false;
      }
      let isBase64 = false;
      const sequenceAttr = event.attributes.find((attr: { key: string }) => {
        const c = compareStringWithBase64OrPlain(attr.key, "packet_sequence");
        isBase64 = c[1];
        return c[0];
      });
      if (!sequenceAttr) {
        return false;
      }

      if (isBase64) {
        return (
          Buffer.from(sourcePortAttr.value, "base64").toString() ===
            sourcePortId &&
          Buffer.from(sourceChannelAttr.value, "base64").toString() ===
            sourceChannelId &&
          Buffer.from(sequenceAttr.value, "base64").toString() === sequence
        );
      } else {
        return (
          sourcePortAttr.value === sourcePortId &&
          sourceChannelAttr.value === sourceChannelId &&
          sequenceAttr.value === sequence
        );
      }
    });
    if (!packetEvent) {
      return -1;
    }

    return events.indexOf(packetEvent);
  }

  protected getLastIBCTimeoutPacketBeforeIndexFromTx(
    tx: any,
    index: number
  ): number {
    const events = tx.events;
    if (!events) {
      throw new Error("Invalid tx");
    }
    if (!Array.isArray(events)) {
      throw new Error("Invalid tx");
    }
    const reversedIndex = events
      .slice(0, index)
      .reverse()
      .findIndex((event) => {
        if (event.type === "timeout_packet") {
          return true;
        }
      });

    if (reversedIndex >= 0) {
      return index - reversedIndex - 1;
    }
    return -1;
  }

  protected getIBCRecvPacketIndexFromTx(
    tx: any,
    sourcePortId: string,
    sourceChannelId: string,
    sequence: string
  ): number {
    const events = tx.events;
    if (!events) {
      throw new Error("Invalid tx");
    }
    if (!Array.isArray(events)) {
      throw new Error("Invalid tx");
    }

    // In injective, events from tendermint rpc is not encoded as base64.
    // I don't know that this is the difference from tendermint version, or just custom from injective.
    const compareStringWithBase64OrPlain = (
      target: string,
      value: string
    ): [boolean, boolean] => {
      if (target === value) {
        return [true, false];
      }

      if (target === Buffer.from(value).toString("base64")) {
        return [true, true];
      }

      return [false, false];
    };

    const packetEvent = events.find((event: any) => {
      if (event.type !== "recv_packet") {
        return false;
      }
      const sourcePortAttr = event.attributes.find((attr: { key: string }) => {
        return compareStringWithBase64OrPlain(attr.key, "packet_src_port")[0];
      });
      if (!sourcePortAttr) {
        return false;
      }
      const sourceChannelAttr = event.attributes.find(
        (attr: { key: string }) => {
          return compareStringWithBase64OrPlain(
            attr.key,
            "packet_src_channel"
          )[0];
        }
      );
      if (!sourceChannelAttr) {
        return false;
      }
      let isBase64 = false;
      const sequenceAttr = event.attributes.find((attr: { key: string }) => {
        const c = compareStringWithBase64OrPlain(attr.key, "packet_sequence");
        isBase64 = c[1];
        return c[0];
      });
      if (!sequenceAttr) {
        return false;
      }

      if (isBase64) {
        return (
          Buffer.from(sourcePortAttr.value, "base64").toString() ===
            sourcePortId &&
          Buffer.from(sourceChannelAttr.value, "base64").toString() ===
            sourceChannelId &&
          Buffer.from(sequenceAttr.value, "base64").toString() === sequence
        );
      } else {
        return (
          sourcePortAttr.value === sourcePortId &&
          sourceChannelAttr.value === sourceChannelId &&
          sequenceAttr.value === sequence
        );
      }
    });
    if (!packetEvent) {
      return -1;
    }

    return events.indexOf(packetEvent);
  }

  protected getIBCPacketSequenceFromTx(
    tx: any,
    sourcePortId: string,
    sourceChannelId: string,
    startingEventIndex = 0
  ): string {
    let events = tx.events;
    if (!events) {
      throw new Error("Invalid tx");
    }
    if (!Array.isArray(events)) {
      throw new Error("Invalid tx");
    }

    // In injective, events from tendermint rpc is not encoded as base64.
    // I don't know that this is the difference from tendermint version, or just custom from injective.
    const compareStringWithBase64OrPlain = (
      target: string,
      value: string
    ): [boolean, boolean] => {
      if (target === value) {
        return [true, false];
      }

      if (target === Buffer.from(value).toString("base64")) {
        return [true, true];
      }

      return [false, false];
    };

    events = events.slice(startingEventIndex);

    const packetEvent = events.find((event: any) => {
      if (event.type !== "send_packet") {
        return false;
      }
      const sourcePortAttr = event.attributes.find((attr: { key: string }) => {
        return compareStringWithBase64OrPlain(attr.key, "packet_src_port")[0];
      });
      if (!sourcePortAttr) {
        return false;
      }
      let isBase64 = false;
      const sourceChannelAttr = event.attributes.find(
        (attr: { key: string }) => {
          const c = compareStringWithBase64OrPlain(
            attr.key,
            "packet_src_channel"
          );
          isBase64 = c[1];
          return c[0];
        }
      );
      if (!sourceChannelAttr) {
        return false;
      }
      if (isBase64) {
        return (
          sourcePortAttr.value ===
            Buffer.from(sourcePortId).toString("base64") &&
          sourceChannelAttr.value ===
            Buffer.from(sourceChannelId).toString("base64")
        );
      } else {
        return (
          sourcePortAttr.value === sourcePortId &&
          sourceChannelAttr.value === sourceChannelId
        );
      }
    });

    let isBase64 = false;
    if (packetEvent) {
      const sequenceAttr = packetEvent.attributes.find(
        (attr: { key: string }) => {
          const c = compareStringWithBase64OrPlain(attr.key, "packet_sequence");
          isBase64 = c[1];
          return c[0];
        }
      );
      if (!sequenceAttr) {
        throw new Error("Invalid tx");
      }

      if (isBase64) {
        return Buffer.from(sequenceAttr.value, "base64").toString();
      } else {
        return sequenceAttr.value;
      }
    }

    throw new Error("Invalid tx");
  }

  protected getDstChannelIdFromTx(
    tx: any,
    sourcePortId: string,
    sourceChannelId: string,
    startingEventIndex = 0
  ): string {
    let events = tx.events;
    if (!events) {
      throw new Error("Invalid tx");
    }
    if (!Array.isArray(events)) {
      throw new Error("Invalid tx");
    }

    // In injective, events from tendermint rpc is not encoded as base64.
    // I don't know that this is the difference from tendermint version, or just custom from injective.
    const compareStringWithBase64OrPlain = (
      target: string,
      value: string
    ): [boolean, boolean] => {
      if (target === value) {
        return [true, false];
      }

      if (target === Buffer.from(value).toString("base64")) {
        return [true, true];
      }

      return [false, false];
    };

    events = events.slice(startingEventIndex);

    const packetEvent = events.find((event: any) => {
      if (event.type !== "send_packet") {
        return false;
      }
      const sourcePortAttr = event.attributes.find((attr: { key: string }) => {
        return compareStringWithBase64OrPlain(attr.key, "packet_src_port")[0];
      });
      if (!sourcePortAttr) {
        return false;
      }
      let isBase64 = false;
      const sourceChannelAttr = event.attributes.find(
        (attr: { key: string }) => {
          const c = compareStringWithBase64OrPlain(
            attr.key,
            "packet_src_channel"
          );
          isBase64 = c[1];
          return c[0];
        }
      );
      if (!sourceChannelAttr) {
        return false;
      }
      if (isBase64) {
        return (
          sourcePortAttr.value ===
            Buffer.from(sourcePortId).toString("base64") &&
          sourceChannelAttr.value ===
            Buffer.from(sourceChannelId).toString("base64")
        );
      } else {
        return (
          sourcePortAttr.value === sourcePortId &&
          sourceChannelAttr.value === sourceChannelId
        );
      }
    });

    let isBase64 = false;
    if (packetEvent) {
      const dstChannelIdAttr = packetEvent.attributes.find(
        (attr: { key: string }) => {
          const c = compareStringWithBase64OrPlain(
            attr.key,
            "packet_dst_channel"
          );
          isBase64 = c[1];
          return c[0];
        }
      );
      if (!dstChannelIdAttr) {
        throw new Error("Invalid tx");
      }

      if (isBase64) {
        return Buffer.from(dstChannelIdAttr.value, "base64").toString();
      } else {
        return dstChannelIdAttr.value;
      }
    }

    throw new Error("Invalid tx");
  }

  protected readonly onChainRemoved = (chainInfo: ChainInfo) => {
    const chainIdentifier = ChainIdHelper.parse(chainInfo.chainId).identifier;

    runInAction(() => {
      const removingIds: string[] = [];
      for (const history of this.recentIBCHistoryMap.values()) {
        if (
          ChainIdHelper.parse(history.chainId).identifier === chainIdentifier
        ) {
          removingIds.push(history.id);
          continue;
        }

        if (
          ChainIdHelper.parse(history.destinationChainId).identifier ===
          chainIdentifier
        ) {
          removingIds.push(history.id);
          continue;
        }

        if (
          history.ibcHistory.some((history) => {
            return (
              ChainIdHelper.parse(history.counterpartyChainId).identifier ===
              chainIdentifier
            );
          })
        ) {
          removingIds.push(history.id);
          continue;
        }
      }

      for (const id of removingIds) {
        this.recentIBCHistoryMap.delete(id);
      }
    });
  };
}
