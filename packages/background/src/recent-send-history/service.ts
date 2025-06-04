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
import { IBCHistory, RecentSendHistory } from "./types";
import { Buffer } from "buffer/";
import { AppCurrency, ChainInfo } from "@owallet/types";
import { CoinPretty } from "@owallet/unit";
import { simpleFetch } from "@owallet/simple-fetch";

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
    isSkipTrack: boolean = false
  ): Promise<Uint8Array> {
    const sourceChainInfo =
      this.chainsService.getChainInfoOrThrow(sourceChainId);
    Bech32Address.validate(
      sender,
      sourceChainInfo.bech32Config?.bech32PrefixAccAddr
    );

    const destinationChainInfo =
      this.chainsService.getChainInfoOrThrow(destinationChainId);
    Bech32Address.validate(
      recipient,
      destinationChainInfo.bech32Config?.bech32PrefixAccAddr
    );

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
            if (isSkipTrack) {
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
    isSkipTrack: boolean = false
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
            if (isSkipTrack) {
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
