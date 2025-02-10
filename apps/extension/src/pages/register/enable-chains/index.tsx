import React, {
  FunctionComponent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores";
import { RegisterSceneBox } from "../components/register-scene-box";
import { Stack } from "../../../components/stack";
import { useRegisterHeader } from "../components/header";
import {
  useSceneEvents,
  useSceneTransition,
} from "../../../components/transition";
import { ChainIdEVM, ModularChainInfo } from "@owallet/types";
import { CoinPretty, Dec } from "@owallet/unit";
import { Box } from "../../../components/box";
import { Column, Columns } from "../../../components/column";
import { XAxis, YAxis } from "../../../components/axis";
import { Gutter } from "../../../components/gutter";
import { SearchTextInput } from "../../../components/input";
import {
  Body2,
  Body3,
  Subtitle2,
  Subtitle3,
  Subtitle4,
} from "../../../components/typography";
import { Button } from "../../../components/button";
import { ColorPalette } from "../../../styles";
import { useEffectOnce } from "../../../hooks/use-effect-once";
import { useNavigate } from "react-router";
import { ChainImageFallback } from "../../../components/image";
import { Checkbox } from "../../../components/checkbox";
import { KeyRingCosmosService } from "@owallet/background";
import { WalletStatus } from "@owallet/stores";
import { ChainIdHelper } from "@owallet/cosmos";
import { TextButton } from "../../../components/button-text";
import { FormattedMessage, useIntl } from "react-intl";
import { Tag } from "../../../components/tag";
import SimpleBar from "simplebar-react";
import { useTheme } from "styled-components";
import { dispatchGlobalEventExceptSelf } from "../../../utils/global-events";
import { VerticalCollapseTransition } from "../../../components/transition/vertical-collapse";
import { ChainIdEnum } from "@owallet/common";

export const EnableChainsScene: FunctionComponent<{
  vaultId: string;

  candidateAddresses?: {
    chainId: string;
    bech32Addresses: {
      coinType: number;
      address: string;
    }[];
  }[];
  isFresh?: boolean;
  skipWelcome?: boolean;
  initialSearchValue?: string;
  fallbackEthereumLedgerApp?: boolean;
  fallbackStarknetLedgerApp?: boolean;
  fallbackBtcLedgerApp?: boolean;
  fallbackTrxLedgerApp?: boolean;
  stepPrevious: number;
  stepTotal: number;
}> = observer(
  ({
    vaultId,
    candidateAddresses: propCandiateAddresses,
    isFresh,
    fallbackEthereumLedgerApp,
    fallbackStarknetLedgerApp,
    fallbackBtcLedgerApp,
    fallbackTrxLedgerApp,
    stepPrevious,
    stepTotal,
    skipWelcome,
    initialSearchValue,
  }) => {
    const {
      chainStore,
      accountStore,
      tronAccountStore,
      solanaAccountStore,
      queriesStore,
      priceStore,
      keyRingStore,
    } = useStore();

    const intl = useIntl();
    const theme = useTheme();

    const searchRef = useRef<HTMLInputElement | null>(null);

    const header = useRegisterHeader();
    useSceneEvents({
      onWillVisible: () => {
        header.setHeader({
          mode: "step",
          title: intl.formatMessage({
            id: "pages.register.enable-chains.title",
          }),
          paragraphs: [
            intl.formatMessage({
              id: "pages.register.enable-chains.paragraph",
            }),
          ],
          stepCurrent: stepPrevious + 1,
          stepTotal: stepTotal,
        });
      },
      onDidVisible: () => {
        if (searchRef.current) {
          searchRef.current.focus();
        }
      },
    });

    const keyType = useMemo(() => {
      const keyInfo = keyRingStore.keyInfos.find(
        (keyInfo) => keyInfo.id === vaultId
      );
      if (!keyInfo) {
        throw new Error("KeyInfo not found");
      }

      return keyInfo.type;
    }, [keyRingStore.keyInfos, vaultId]);

    const [candidateAddresses, setCandidateAddresses] = useState<
      {
        chainId: string;
        bech32Addresses: {
          coinType: number;
          address: string;
        }[];
      }[]
    >(propCandiateAddresses ?? []);
    useEffectOnce(() => {
      if (candidateAddresses.length === 0) {
        (async () => {
          const candidateAddresses: {
            chainId: string;
            bech32Addresses: {
              coinType: number;
              address: string;
            }[];
          }[] = [];

          const promises: Promise<unknown>[] = [];
          for (const modularChainInfo of chainStore.modularChainInfos) {
            if ("cosmos" in modularChainInfo) {
              const chainInfo = chainStore.getChain(
                modularChainInfo.cosmos.chainId
              );

              if (keyRingStore.needKeyCoinTypeFinalize(vaultId, chainInfo)) {
                promises.push(
                  (async () => {
                    const res =
                      await keyRingStore.computeNotFinalizedKeyAddresses(
                        vaultId,
                        chainInfo.chainId
                      );

                    candidateAddresses.push({
                      chainId: chainInfo.chainId,
                      bech32Addresses: res.map((res) => {
                        return {
                          coinType: res.coinType,
                          address: res.bech32Address,
                        };
                      }),
                    });
                  })()
                );
              } else {
                if (chainInfo.features.includes("tron")) {
                  const accountTron = tronAccountStore.getAccount(
                    chainInfo.chainId
                  );
                  if (accountTron.base58Address) {
                    candidateAddresses.push({
                      chainId: chainInfo.chainId,
                      bech32Addresses: [
                        {
                          coinType: chainInfo.bip44.coinType,
                          address: accountTron.base58Address,
                        },
                      ],
                    });
                  }
                }
                if (chainInfo.features.includes("solana")) {
                  const accountSolana = solanaAccountStore.getAccount(
                    chainInfo.chainId
                  );

                  if (accountSolana.base58Address) {
                    candidateAddresses.push({
                      chainId: chainInfo.chainId,
                      bech32Addresses: [
                        {
                          coinType: chainInfo.bip44.coinType,
                          address: accountSolana.base58Address,
                        },
                      ],
                    });
                  }
                }
                const account = accountStore.getAccount(chainInfo.chainId);
                promises.push(
                  (async () => {
                    if (account.walletStatus !== WalletStatus.Loaded) {
                      await account.init();
                    }

                    if (account.bech32Address) {
                      candidateAddresses.push({
                        chainId: chainInfo.chainId,
                        bech32Addresses: [
                          {
                            coinType: chainInfo.bip44.coinType,
                            address: account.bech32Address,
                          },
                        ],
                      });
                    }
                  })()
                );
              }
            }
          }

          await Promise.allSettled(promises);

          setCandidateAddresses(candidateAddresses);
        })();
      }
    });
    const candidateAddressesMap = useMemo(() => {
      const map: Map<
        string,
        {
          coinType: number;
          address: string;
        }[]
      > = new Map();
      for (const candidateAddress of candidateAddresses) {
        map.set(
          ChainIdHelper.parse(candidateAddress.chainId).identifier,
          candidateAddress.bech32Addresses
        );
      }
      return map;
    }, [candidateAddresses]);

    const sceneMovedToSelectDerivation = useRef(false);

    // Handle coin type selection.
    useEffect(() => {
      if (!isFresh && candidateAddresses.length > 0) {
        for (const candidateAddress of candidateAddresses) {
          const queries = queriesStore.get(candidateAddress.chainId);
          const chainInfo = chainStore.getChain(candidateAddress.chainId);

          if (keyRingStore.needKeyCoinTypeFinalize(vaultId, chainInfo)) {
            if (candidateAddress.bech32Addresses.length === 1) {
              keyRingStore.finalizeKeyCoinType(
                vaultId,
                candidateAddress.chainId,
                candidateAddress.bech32Addresses[0].coinType
              );
            }

            if (candidateAddress.bech32Addresses.length >= 2) {
              (async () => {
                const promises: Promise<unknown>[] = [];

                for (const bech32Address of candidateAddress.bech32Addresses) {
                  const queryAccount =
                    queries.cosmos.queryAccount.getQueryBech32Address(
                      bech32Address.address
                    );

                  promises.push(queryAccount.waitResponse());
                }

                await Promise.allSettled(promises);

                const mainAddress = candidateAddress.bech32Addresses.find(
                  (a) => a.coinType === chainInfo.bip44.coinType
                );
                const otherAddresses = candidateAddress.bech32Addresses.filter(
                  (a) => a.coinType !== chainInfo.bip44.coinType
                );

                let otherIsSelectable = false;
                if (mainAddress && otherAddresses.length > 0) {
                  for (const otherAddress of otherAddresses) {
                    const bech32Address = otherAddress.address;
                    const queryAccount =
                      queries.cosmos.queryAccount.getQueryBech32Address(
                        bech32Address
                      );

                    // Check that the account exist on chain.
                    // With stargate implementation, querying account fails with 404 status if account not exists.
                    // But, if account receives some native tokens, the account would be created and it may deserve to be chosen.
                    if (
                      queryAccount.response?.data &&
                      queryAccount.error == null
                    ) {
                      otherIsSelectable = true;
                      break;
                    }
                  }
                }

                if (
                  !otherIsSelectable &&
                  mainAddress &&
                  !sceneMovedToSelectDerivation.current
                ) {
                  console.log(
                    "Finalize key coin type",
                    vaultId,
                    chainInfo.chainId,
                    mainAddress.coinType
                  );
                  keyRingStore.finalizeKeyCoinType(
                    vaultId,
                    chainInfo.chainId,
                    mainAddress.coinType
                  );
                }
              })();
            }
          }
        }
      }
    }, [
      isFresh,
      candidateAddresses,
      vaultId,
      chainStore,
      queriesStore,
      keyRingStore,
    ]);

    const sceneTransition = useSceneTransition();

    const [enabledChainIdentifiers, setEnabledChainIdentifiers] = useState(
      () => {
        // We assume that the chain store can be already initialized.
        const enabledChainIdentifiers: string[] =
          chainStore.enabledChainIdentifiers;

        if (
          candidateAddresses.length > 0 &&
          enabledChainIdentifiers.length === 1 &&
          enabledChainIdentifiers[0] ===
            chainStore.chainInfos[0].chainIdentifier
        ) {
          if (
            chainStore.chainInfos.find((c) => c.chainIdentifier === "noble")
          ) {
            enabledChainIdentifiers.push("noble");
          }

          if (
            chainStore.chainInfos.find(
              (c) => c.chainIdentifier === ChainIdEVM.TRON
            )
          ) {
            enabledChainIdentifiers.push(ChainIdEVM.TRON);
          }

          if (
            chainStore.chainInfos.find(
              (c) => c.chainIdentifier === ChainIdEnum.Bitcoin
            )
          ) {
            enabledChainIdentifiers.push(ChainIdEnum.Bitcoin);
          }

          if (
            chainStore.chainInfos.find(
              (c) => c.chainIdentifier === ChainIdEnum.Solana
            )
          ) {
            enabledChainIdentifiers.push(ChainIdEnum.Solana);
          }

          if (
            chainStore.chainInfos.find((c) => c.chainIdentifier === "eip155:1")
          ) {
            enabledChainIdentifiers.push("eip155:1");
          }
        }

        for (const candidateAddress of candidateAddresses) {
          const queries = queriesStore.get(candidateAddress.chainId);
          const chainInfo = chainStore.getChain(candidateAddress.chainId);
          const mainCurrency =
            chainInfo.stakeCurrency || chainInfo.currencies[0];
          const account = accountStore.getAccount(chainInfo.chainId);

          if (!chainStore.isInChainInfosInListUI(chainInfo.chainId)) {
            continue;
          }

          // If the chain is already enabled, skip.
          if (chainStore.isEnabledChain(candidateAddress.chainId)) {
            continue;
          }

          // If the chain is not enabled, check that the account exists.
          // If the account exists, turn on the chain.
          for (const bech32Address of candidateAddress.bech32Addresses) {
            // Check that the account has some assets or delegations.
            // If so, enable it by default
            const isEVMOnlyChain = chainStore.isEvmOnlyChain(chainInfo.chainId);
            const queryBalance = isEVMOnlyChain
              ? queries.queryBalances.getQueryEthereumHexAddress(
                  account.ethereumHexAddress
                )
              : queries.queryBalances.getQueryBech32Address(
                  account.bech32Address
                );
            const balance = queryBalance.getBalance(mainCurrency);

            if (balance?.response?.data) {
              // A bit tricky. The stake coin is currently only native, and in this case,
              // we can check whether the asset exists or not by checking the response.
              const data = balance.response.data as any;
              if (
                data.balances &&
                Array.isArray(data.balances) &&
                data.balances.length > 0 &&
                data.balances.find((bal: any) => {
                  return (
                    bal.amount &&
                    typeof bal.amount === "string" &&
                    bal.amount !== "0"
                  );
                })
              ) {
                enabledChainIdentifiers.push(chainInfo.chainIdentifier);
                break;
              }

              if (isEVMOnlyChain && balance.balance.toDec().gt(new Dec(0))) {
                enabledChainIdentifiers.push(chainInfo.chainIdentifier);
                break;
              }
            }

            if (!isEVMOnlyChain) {
              const queryDelegations =
                queries.cosmos.queryDelegations.getQueryBech32Address(
                  bech32Address.address
                );
              if (queryDelegations.delegationBalances.length > 0) {
                enabledChainIdentifiers.push(chainInfo.chainIdentifier);
                break;
              }
            }
          }
        }

        return [...new Set(enabledChainIdentifiers)];
      }
    );

    const enabledChainIdentifierMap = useMemo(() => {
      const map = new Map<string, boolean>();

      for (const enabledChainIdentifier of enabledChainIdentifiers) {
        map.set(enabledChainIdentifier, true);
      }

      return map;
    }, [enabledChainIdentifiers]);

    const [sortPriorityChainIdentifierMap] = useState(
      enabledChainIdentifierMap
    );

    const [search, setSearch] = useState<string>(initialSearchValue ?? "");

    const preSortModularChainInfos = useMemo(() => {
      let modularChainInfos = chainStore.modularChainInfosInListUI.slice();

      if (keyType === "ledger") {
        modularChainInfos = modularChainInfos.filter((modularChainInfo) => {
          if ("cosmos" in modularChainInfo) {
            const chainInfo = chainStore.getChain(
              modularChainInfo.cosmos.chainId
            );
            const isEthermintLike =
              chainInfo.bip44.coinType === 60 ||
              !!chainInfo.features?.includes("eth-address-gen") ||
              !!chainInfo.features?.includes("eth-key-sign");

            if (isEthermintLike && !fallbackEthereumLedgerApp) {
              return false;
            }

            if (fallbackEthereumLedgerApp) {
              if (!isEthermintLike) {
                return false;
              }

              try {
                KeyRingCosmosService.throwErrorIfEthermintWithLedgerButNotSupported(
                  chainInfo.chainId
                );
                return true;
              } catch {
                return false;
              }
            }

            if (fallbackBtcLedgerApp) {
              try {
                KeyRingCosmosService.throwErrorIfEthermintWithLedgerButNotSupported(
                  chainInfo.chainId
                );
                return true;
              } catch {
                return false;
              }
            }

            if (fallbackTrxLedgerApp) {
              try {
                KeyRingCosmosService.throwErrorIfEthermintWithLedgerButNotSupported(
                  chainInfo.chainId
                );
                return true;
              } catch {
                return false;
              }
            }

            if (fallbackStarknetLedgerApp) {
              return false;
            }

            return true;
          }
          // else if ("starknet" in modularChainInfo) {
          //   return fallbackStarknetLedgerApp;
          // }
          else {
            return false;
          }
        });
      }

      const trimSearch = search.trim().toLowerCase();
      if (!trimSearch) {
        return modularChainInfos;
      } else {
        return modularChainInfos.filter((modularChainInfo) => {
          if (modularChainInfo.chainName.toLowerCase().includes(trimSearch)) {
            return true;
          }

          if ("cosmos" in modularChainInfo) {
            const chainInfo = chainStore.getChain(
              modularChainInfo.cosmos.chainId
            );
            return (
              chainInfo.stakeCurrency || chainInfo.currencies[0]
            ).coinDenom.includes(trimSearch);
          }
        });
      }
    }, [
      chainStore,
      fallbackEthereumLedgerApp,
      fallbackStarknetLedgerApp,
      keyType,
      search,
    ]);

    const modularChainInfos = preSortModularChainInfos.sort(
      (aModularChainInfo, bModularChainInfo) => {
        const aChainIdentifier = ChainIdHelper.parse(
          aModularChainInfo.chainId
        ).identifier;
        const bChainIdentifier = ChainIdHelper.parse(
          bModularChainInfo.chainId
        ).identifier;
        const aHasPriority =
          sortPriorityChainIdentifierMap.has(aChainIdentifier);
        const bHasPriority =
          sortPriorityChainIdentifierMap.has(bChainIdentifier);

        if (aHasPriority && !bHasPriority) {
          return -1;
        }

        if (!aHasPriority && bHasPriority) {
          return 1;
        }

        const aBalance = (() => {
          if ("cosmos" in aModularChainInfo) {
            const addresses = candidateAddressesMap.get(aChainIdentifier);
            const chainInfo = chainStore.getChain(aModularChainInfo.chainId);
            const queries = queriesStore.get(aModularChainInfo.chainId);

            const mainCurrency =
              chainInfo.stakeCurrency || chainInfo.currencies[0];
            const account = accountStore.getAccount(chainInfo.chainId);

            if (addresses && addresses.length > 0) {
              const queryBalance = chainStore.isEvmOnlyChain(chainInfo.chainId)
                ? queries.queryBalances.getQueryEthereumHexAddress(
                    account.ethereumHexAddress
                  )
                : queries.queryBalances.getQueryBech32Address(
                    addresses[0].address
                  );
              const balance = queryBalance.getBalance(mainCurrency)?.balance;

              if (balance) {
                return balance;
              }
            }

            return new CoinPretty(mainCurrency, "0");
          }
        })();
        const bBalance = (() => {
          if ("cosmos" in bModularChainInfo) {
            const addresses = candidateAddressesMap.get(bChainIdentifier);
            const chainInfo = chainStore.getChain(bModularChainInfo.chainId);
            const queries = queriesStore.get(bModularChainInfo.chainId);

            const mainCurrency =
              chainInfo.stakeCurrency || chainInfo.currencies[0];
            const account = accountStore.getAccount(chainInfo.chainId);

            if (addresses && addresses.length > 0) {
              const queryBalance = chainStore.isEvmOnlyChain(chainInfo.chainId)
                ? queries.queryBalances.getQueryEthereumHexAddress(
                    account.ethereumHexAddress
                  )
                : queries.queryBalances.getQueryBech32Address(
                    addresses[0].address
                  );
              const balance = queryBalance.getBalance(mainCurrency)?.balance;

              if (balance) {
                return balance;
              }
            }

            return new CoinPretty(mainCurrency, "0");
          }
        })();

        const aPrice = aBalance
          ? priceStore.calculatePrice(aBalance)?.toDec() ?? new Dec(0)
          : new Dec(0);
        const bPrice = bBalance
          ? priceStore.calculatePrice(bBalance)?.toDec() ?? new Dec(0)
          : new Dec(0);

        if (!aPrice.equals(bPrice)) {
          return aPrice.gt(bPrice) ? -1 : 1;
        }

        return aModularChainInfo.chainName.localeCompare(
          bModularChainInfo.chainName
        );
      }
    );

    const numSelected = useMemo(() => {
      const modularChainInfoMap = new Map<string, ModularChainInfo>();
      for (const modularChainInfo of chainStore.modularChainInfos) {
        modularChainInfoMap.set(
          ChainIdHelper.parse(modularChainInfo.chainId).identifier,
          modularChainInfo
        );
      }

      let numSelected = 0;
      for (const enabledChainIdentifier of enabledChainIdentifiers) {
        const enabledModularChainInfo = modularChainInfoMap.get(
          enabledChainIdentifier
        );
        if (enabledModularChainInfo) {
          if (keyType === "ledger") {
            const isEthereumAppNeed =
              "cosmos" in enabledModularChainInfo &&
              (enabledModularChainInfo.cosmos.bip44.coinType === 60 ||
                !!enabledModularChainInfo.cosmos.features?.includes(
                  "eth-address-gen"
                ) ||
                !!enabledModularChainInfo.cosmos.features?.includes(
                  "eth-key-sign"
                ));

            if (fallbackEthereumLedgerApp) {
              if (isEthereumAppNeed) {
                numSelected++;
              }
            } else {
              if (!isEthereumAppNeed) {
                numSelected++;
              }
            }
          } else {
            numSelected++;
          }
        }
      }
      return numSelected;
    }, [
      chainStore.modularChainInfos,
      enabledChainIdentifiers,
      fallbackEthereumLedgerApp,
      fallbackStarknetLedgerApp,
      keyType,
    ]);

    const replaceToWelcomePage = () => {
      window.close();
      // if (skipWelcome) {
      //   window.close();
      // } else {
      //   navigate("/welcome", {
      //     replace: true,
      //   });
      // }
    };

    const enabledChainIdentifiersInPage = useMemo(() => {
      return enabledChainIdentifiers.filter((chainIdentifier) =>
        modularChainInfos.some(
          (modularChainInfo) =>
            chainIdentifier ===
            ChainIdHelper.parse(modularChainInfo.chainId).identifier
        )
      );
    }, [enabledChainIdentifiers, modularChainInfos]);

    const [preSelectedChainIdentifiers, setPreSelectedChainIdentifiers] =
      useState<string[]>([]);

    return (
      <RegisterSceneBox>
        <SearchTextInput
          ref={searchRef}
          placeholder={intl.formatMessage({
            id: "pages.register.enable-chains.search-input-placeholder",
          })}
          value={search}
          onChange={(e) => {
            e.preventDefault();

            setSearch(e.target.value);
          }}
        />
        <Gutter size="0.75rem" />
        <Subtitle3
          color={
            theme.mode === "light"
              ? ColorPalette["gray-600"]
              : ColorPalette.white
          }
          style={{
            textAlign: "center",
          }}
        >
          <FormattedMessage
            id="pages.register.enable-chains.chain-selected-count"
            values={{ numSelected }}
          />
        </Subtitle3>
        <Gutter size="0.75rem" />
        <SimpleBar
          style={{
            display: "flex",
            flexDirection: "column",
            height: "25.5rem",
            overflowY: "auto",
          }}
        >
          <Stack gutter="0.5rem">
            {modularChainInfos.map((modularChainInfo) => {
              const account = accountStore.getAccount(modularChainInfo.chainId);
              const balance = (() => {
                if ("cosmos" in modularChainInfo) {
                  const chainInfo = chainStore.getChain(
                    modularChainInfo.cosmos.chainId
                  );
                  const queries = queriesStore.get(modularChainInfo.chainId);
                  const mainCurrency =
                    chainInfo.stakeCurrency || chainInfo.currencies[0];

                  const queryBalance = chainStore.isEvmOnlyChain(
                    chainInfo.chainId
                  )
                    ? queries.queryBalances.getQueryEthereumHexAddress(
                        account.ethereumHexAddress
                      )
                    : queries.queryBalances.getQueryBech32Address(
                        account.bech32Address
                      );
                  const balance = queryBalance.getBalance(mainCurrency);

                  if (balance) {
                    return balance.balance;
                  }

                  return new CoinPretty(mainCurrency, "0");
                }
              })();
              const chainIdentifier = ChainIdHelper.parse(
                modularChainInfo.chainId
              ).identifier;

              const enabled =
                enabledChainIdentifierMap.get(chainIdentifier) || false;

              // At least, one chain should be enabled.
              const blockInteraction =
                enabledChainIdentifiers.length <= 1 && enabled;

              const isForcedSelected =
                modularChainInfo.chainId === ChainIdEnum.Bitcoin ||
                modularChainInfo.chainId === ChainIdEVM.TRON ||
                modularChainInfo.chainId.includes("solana");

              return (
                <ChainItem
                  key={chainIdentifier}
                  modularChainInfo={modularChainInfo}
                  balance={balance}
                  enabled={enabled}
                  blockInteraction={blockInteraction}
                  isFresh={isFresh ?? false}
                  onClick={() => {
                    if (isForcedSelected) {
                      return;
                    }
                    if (enabledChainIdentifierMap.get(chainIdentifier)) {
                      setEnabledChainIdentifiers(
                        enabledChainIdentifiers.filter(
                          (ci) => ci !== chainIdentifier
                        )
                      );
                    } else {
                      setEnabledChainIdentifiers([
                        ...enabledChainIdentifiers,
                        chainIdentifier,
                      ]);
                    }
                  }}
                />
              );
            })}
            {!fallbackStarknetLedgerApp &&
              !fallbackEthereumLedgerApp &&
              keyType === "ledger" &&
              chainStore.modularChainInfos
                .filter((modularChainInfo) => {
                  const trimSearch = search.trim();
                  const trimSearchLowerCase = trimSearch.toLowerCase();

                  const isChainNameSearch = modularChainInfo.chainName
                    .toLowerCase()
                    .includes(trimSearchLowerCase);
                  const isCoinDenomSearch = (() => {
                    if ("cosmos" in modularChainInfo) {
                      const chainInfo = chainStore.getChain(
                        modularChainInfo.cosmos.chainId
                      );
                      return (
                        chainInfo.stakeCurrency || chainInfo.currencies[0]
                      ).coinDenom
                        .toLowerCase()
                        .includes(trimSearchLowerCase);
                    }

                    return false;
                  })();

                  return isChainNameSearch || isCoinDenomSearch;
                })
                .map((modularChainInfo) => {
                  if ("cosmos" in modularChainInfo) {
                    const chainInfo = chainStore.getChain(
                      modularChainInfo.chainId
                    );
                    const isEthermintLike =
                      chainInfo.bip44.coinType === 60 ||
                      !!chainInfo.features?.includes("eth-address-gen") ||
                      !!chainInfo.features?.includes("eth-key-sign");

                    const isLedgerSupported = (() => {
                      try {
                        KeyRingCosmosService.throwErrorIfEthermintWithLedgerButNotSupported(
                          chainInfo.chainId
                        );
                        return true;
                      } catch {
                        return false;
                      }
                    })();

                    if (isEthermintLike && isLedgerSupported) {
                      return (
                        <NextStepChainItem
                          key={modularChainInfo.chainId}
                          modularChainInfo={modularChainInfo}
                          tagText="EVM"
                        />
                      );
                    }
                  } else if ("starknet" in modularChainInfo) {
                    return (
                      <NextStepChainItem
                        key={modularChainInfo.chainId}
                        modularChainInfo={modularChainInfo}
                        tagText="Starknet"
                      />
                    );
                  }

                  return null;
                })}
          </Stack>
        </SimpleBar>
        <React.Fragment>
          <Gutter size="1.25rem" />

          <YAxis alignX="center">
            <Box
              alignX="center"
              cursor="pointer"
              onClick={(e) => {
                e.preventDefault();

                if (
                  modularChainInfos.length ===
                  enabledChainIdentifiersInPage.length
                ) {
                  if (preSelectedChainIdentifiers.length > 0) {
                    setEnabledChainIdentifiers(preSelectedChainIdentifiers);
                  } else {
                    if (modularChainInfos.length > 0) {
                      setEnabledChainIdentifiers([
                        ChainIdHelper.parse(modularChainInfos[0].chainId)
                          .identifier,
                      ]);
                    }
                  }
                } else {
                  setPreSelectedChainIdentifiers([...enabledChainIdentifiers]);
                  const newEnabledChainIdentifiers: string[] =
                    enabledChainIdentifiers.slice();
                  for (const modularChainInfo of modularChainInfos) {
                    const chainIdentifier = ChainIdHelper.parse(
                      modularChainInfo.chainId
                    ).identifier;
                    if (!newEnabledChainIdentifiers.includes(chainIdentifier)) {
                      newEnabledChainIdentifiers.push(chainIdentifier);
                    }
                  }
                  setEnabledChainIdentifiers(newEnabledChainIdentifiers);
                }
              }}
            >
              <XAxis alignY="center">
                <Body2
                  color={
                    theme.mode === "light"
                      ? ColorPalette["gray-200"]
                      : ColorPalette["gray-300"]
                  }
                >
                  <FormattedMessage id="text-button.select-all" />
                </Body2>

                <Gutter size="0.25rem" />

                <Checkbox
                  size="small"
                  checked={
                    modularChainInfos.length ===
                    enabledChainIdentifiersInPage.length
                  }
                  onChange={() => {}}
                />
              </XAxis>
            </Box>
          </YAxis>
        </React.Fragment>

        <VerticalCollapseTransition
          collapsed={(() => {
            for (const chainIdentifier of enabledChainIdentifiersInPage) {
              const modularChainInfo =
                chainStore.getModularChain(chainIdentifier);
              if ("starknet" in modularChainInfo) {
                return false;
              }
            }
            return true;
          })()}
        >
          <Gutter size="1.25rem" />
          <Box
            backgroundColor={
              theme.mode === "light"
                ? ColorPalette["gray-50"]
                : ColorPalette["gray-500"]
            }
            borderRadius="0.5rem"
            padding="1.125rem"
          >
            <XAxis alignY="center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                fill="none"
                stroke="none"
                viewBox="0 0 20 20"
              >
                <path
                  fill={
                    theme.mode === "light"
                      ? ColorPalette["gray-500"]
                      : ColorPalette["gray-100"]
                  }
                  d="M10 1.667A8.336 8.336 0 001.667 10c0 4.6 3.733 8.333 8.333 8.333S18.333 14.6 18.333 10 14.6 1.667 10 1.667zm.833 12.5H9.166v-5h1.667v5zm0-6.667H9.166V5.833h1.667V7.5z"
                />
              </svg>
              <Gutter size="0.5rem" />
              <Subtitle4
                color={
                  theme.mode === "light"
                    ? ColorPalette["gray-500"]
                    : ColorPalette["gray-100"]
                }
              >
                <FormattedMessage id="pages.register.enable-chains.guide.starknet.title" />
              </Subtitle4>
            </XAxis>
            <Gutter size="0.35rem" />
            <Body3
              color={
                theme.mode === "light"
                  ? ColorPalette["gray-300"]
                  : ColorPalette["gray-200"]
              }
            >
              <FormattedMessage id="pages.register.enable-chains.guide.starknet.paragraph" />
            </Body3>
          </Box>
        </VerticalCollapseTransition>

        <Gutter size="1.25rem" />
        <Box width="22.5rem" marginX="auto">
          <Button
            text={intl.formatMessage({
              id: "button.save",
            })}
            size="large"
            onClick={async () => {
              const enables: string[] = [];
              const disables: string[] = [];

              for (const modularChainInfo of chainStore.modularChainInfos) {
                const chainIdentifier = ChainIdHelper.parse(
                  modularChainInfo.chainId
                ).identifier;
                const enabled =
                  enabledChainIdentifierMap.get(chainIdentifier) || false;

                if (enabled) {
                  enables.push(chainIdentifier);
                } else {
                  disables.push(chainIdentifier);
                }
              }

              const needFinalizeCoinType: string[] = [];
              for (let i = 0; i < enables.length; i++) {
                const enable = enables[i];
                const modularChainInfo = chainStore.getModularChain(enable);
                if ("cosmos" in modularChainInfo) {
                  const chainInfo = chainStore.getChain(enable);
                  if (
                    keyRingStore.needKeyCoinTypeFinalize(vaultId, chainInfo)
                  ) {
                    // Remove enable from enables
                    enables.splice(i, 1);
                    i--;
                    // And push it disables
                    disables.push(enable);

                    needFinalizeCoinType.push(enable);
                  }
                }
              }

              const ledgerEthereumAppNeeds: string[] = [];
              for (let i = 0; i < enables.length; i++) {
                if (!fallbackEthereumLedgerApp) {
                  break;
                }

                const enable = enables[i];
                const modularChainInfo = chainStore.getModularChain(enable);

                if ("cosmos" in modularChainInfo) {
                  const chainInfo = chainStore.getChain(enable);
                  const isEthermintLike =
                    chainInfo.bip44.coinType === 60 ||
                    !!chainInfo.features?.includes("eth-address-gen") ||
                    !!chainInfo.features?.includes("eth-key-sign");

                  if (isEthermintLike) {
                    // Remove enable from enables
                    enables.splice(i, 1);
                    i--;
                    // And push it disables
                    disables.push(enable);

                    ledgerEthereumAppNeeds.push(enable);
                  }
                }
              }

              const ledgerStarknetAppNeeds: string[] = [];
              for (let i = 0; i < enables.length; i++) {
                if (!fallbackStarknetLedgerApp) {
                  break;
                }

                const enable = enables[i];
                const modularChainInfo = chainStore.getModularChain(enable);

                if ("starknet" in modularChainInfo) {
                  // Remove enable from enables
                  enables.splice(i, 1);
                  i--;
                  // And push it disables
                  disables.push(enable);

                  ledgerStarknetAppNeeds.push(enable);
                }
              }

              const ledgerBtcAppNeeds: string[] = [];
              for (let i = 0; i < enables.length; i++) {
                if (!fallbackBtcLedgerApp) {
                  break;
                }

                const enable = enables[i];

                const chainInfo = chainStore.getChain(enable);
                const isBtc = chainInfo.features?.includes("btc");

                if (isBtc) {
                  enables.splice(i, 1);
                  i--;
                  // And push it disables
                  disables.push(enable);

                  ledgerBtcAppNeeds.push(enable);
                }
              }

              const ledgerTrxAppNeeds: string[] = [];
              for (let i = 0; i < enables.length; i++) {
                if (!fallbackTrxLedgerApp) {
                  break;
                }

                const enable = enables[i];

                const chainInfo = chainStore.getChain(enable);
                const isTron = chainInfo.features?.includes("tron");

                if (isTron) {
                  enables.splice(i, 1);
                  i--;
                  // And push it disables
                  disables.push(enable);

                  ledgerTrxAppNeeds.push(enable);
                }
              }

              await Promise.all([
                (async () => {
                  if (enables.length > 0) {
                    await chainStore.enableChainInfoInUIWithVaultId(
                      vaultId,
                      ...enables
                    );
                  }
                })(),
                (async () => {
                  if (disables.length > 0) {
                    await chainStore.disableChainInfoInUIWithVaultId(
                      vaultId,
                      ...disables
                    );
                  }
                })(),
              ]);

              dispatchGlobalEventExceptSelf(
                "owallet_enabled_chain_changed",
                vaultId
              );

              if (needFinalizeCoinType.length > 0) {
                sceneMovedToSelectDerivation.current = true;
                sceneTransition.replace("select-derivation-path", {
                  vaultId,
                  chainIds: needFinalizeCoinType,

                  totalCount: needFinalizeCoinType.length,

                  skipWelcome,
                });
              } else {
                if (keyType === "ledger") {
                  if (fallbackEthereumLedgerApp) {
                    if (ledgerEthereumAppNeeds.length > 0) {
                      const keyInfo = keyRingStore.keyInfos.find(
                        (keyInfo) => keyInfo.id === vaultId
                      );
                      if (!keyInfo) {
                        throw new Error("KeyInfo not found");
                      }
                      if (keyInfo.insensitive["Ethereum"]) {
                        await chainStore.enableChainInfoInUI(
                          ...ledgerEthereumAppNeeds
                        );
                        dispatchGlobalEventExceptSelf(
                          "owallet_enabled_chain_changed",
                          keyInfo.id
                        );

                        const bip44Path = keyInfo.insensitive["bip44Path"];
                        if (!bip44Path) {
                          throw new Error("bip44Path not found");
                        }
                        sceneTransition.push("connect-ledger", {
                          name: "",
                          password: "",
                          app: "Bitcoin",
                          bip44Path,

                          appendModeInfo: {
                            vaultId,
                            afterEnableChains: ledgerBtcAppNeeds,
                          },
                          stepPrevious: stepPrevious,
                          stepTotal: stepTotal,
                        });

                        // sceneTransition.push("enable-chains", {
                        //   vaultId,
                        //   keyType,
                        //   candidateAddresses: [],
                        //   isFresh: false,
                        //   skipWelcome,
                        //   fallbackBtcLedgerApp: true,
                        //   stepPrevious: stepPrevious + 1,
                        //   stepTotal: stepTotal,
                        // });
                      } else {
                        const bip44Path = keyInfo.insensitive["bip44Path"];
                        if (!bip44Path) {
                          throw new Error("bip44Path not found");
                        }
                        sceneTransition.push("connect-ledger", {
                          name: "",
                          password: "",
                          app: "Ethereum",
                          bip44Path,

                          appendModeInfo: {
                            vaultId,
                            afterEnableChains: ledgerEthereumAppNeeds,
                          },
                          stepPrevious: stepPrevious,
                          stepTotal: stepTotal,
                        });
                      }
                    } else {
                      sceneTransition.push("enable-chains", {
                        vaultId,
                        keyType,
                        candidateAddresses: [],
                        isFresh: false,
                        skipWelcome,
                        fallbackStarknetLedgerApp: false,
                        stepPrevious: stepPrevious + 1,
                        stepTotal: stepTotal,
                      });
                    }
                  } else if (fallbackBtcLedgerApp) {
                    if (ledgerBtcAppNeeds.length > 0) {
                      const keyInfo = keyRingStore.keyInfos.find(
                        (keyInfo) => keyInfo.id === vaultId
                      );
                      if (!keyInfo) {
                        throw new Error("KeyInfo not found");
                      }
                      if (keyInfo.insensitive["Bitcoin"]) {
                        await chainStore.enableChainInfoInUI(
                          ...ledgerBtcAppNeeds
                        );
                        dispatchGlobalEventExceptSelf(
                          "owallet_enabled_chain_changed",
                          keyInfo.id
                        );

                        const bip44Path = keyInfo.insensitive["bip44Path"];
                        if (!bip44Path) {
                          throw new Error("bip44Path not found");
                        }
                        sceneTransition.push("connect-ledger", {
                          name: "",
                          password: "",
                          app: "Tron",
                          bip44Path,
                          appendModeInfo: {
                            vaultId,
                            afterEnableChains: ledgerTrxAppNeeds,
                          },
                          stepPrevious: stepPrevious,
                          stepTotal: stepTotal,
                        });

                        // sceneTransition.push("enable-chains", {
                        //   vaultId,
                        //   keyType,
                        //   candidateAddresses: [],
                        //   isFresh: false,
                        //   skipWelcome,
                        //   fallbackStarknetLedgerApp: false,
                        //   stepPrevious: stepPrevious + 1,
                        //   stepTotal: stepTotal,
                        // });
                      } else {
                        const bip44Path = keyInfo.insensitive["bip44Path"];
                        if (!bip44Path) {
                          throw new Error("bip44Path not found");
                        }
                        sceneTransition.push("connect-ledger", {
                          name: "",
                          password: "",
                          app: "Bitcoin",
                          bip44Path,

                          appendModeInfo: {
                            vaultId,
                            afterEnableChains: ledgerBtcAppNeeds,
                          },
                          stepPrevious: stepPrevious,
                          stepTotal: stepTotal,
                        });
                      }
                    } else {
                      sceneTransition.push("enable-chains", {
                        vaultId,
                        keyType,
                        candidateAddresses: [],
                        isFresh: false,
                        skipWelcome,
                        fallbackTrxLedgerApp: true,
                        stepPrevious: stepPrevious + 1,
                        stepTotal: stepTotal,
                      });
                    }
                  } else if (fallbackTrxLedgerApp) {
                    if (ledgerTrxAppNeeds.length > 0) {
                      const keyInfo = keyRingStore.keyInfos.find(
                        (keyInfo) => keyInfo.id === vaultId
                      );
                      if (!keyInfo) {
                        throw new Error("KeyInfo not found");
                      }
                      if (keyInfo.insensitive["Tron"]) {
                        await chainStore.enableChainInfoInUI(
                          ...ledgerTrxAppNeeds
                        );
                        dispatchGlobalEventExceptSelf(
                          "owallet_enabled_chain_changed",
                          keyInfo.id
                        );
                        // sceneTransition.push("enable-chains", {
                        //   vaultId,
                        //   keyType,
                        //   candidateAddresses: [],
                        //   isFresh: false,
                        //   skipWelcome,
                        //   fallbackStarknetLedgerApp: false,
                        //   stepPrevious: stepPrevious + 1,
                        //   stepTotal: stepTotal,
                        // });
                      } else {
                        const bip44Path = keyInfo.insensitive["bip44Path"];
                        if (!bip44Path) {
                          throw new Error("bip44Path not found");
                        }
                        sceneTransition.push("connect-ledger", {
                          name: "",
                          password: "",
                          app: "Tron",
                          bip44Path,
                          appendModeInfo: {
                            vaultId,
                            afterEnableChains: ledgerTrxAppNeeds,
                          },
                          stepPrevious: stepPrevious,
                          stepTotal: stepTotal,
                        });
                      }
                    } else {
                      sceneTransition.push("enable-chains", {
                        vaultId,
                        keyType,
                        candidateAddresses: [],
                        isFresh: false,
                        skipWelcome,
                        fallbackStarknetLedgerApp: false,
                        stepPrevious: stepPrevious + 1,
                        stepTotal: stepTotal,
                      });
                    }
                  } else {
                    sceneTransition.push("enable-chains", {
                      vaultId,
                      keyType,
                      candidateAddresses: [],
                      isFresh: false,
                      skipWelcome,
                      fallbackEthereumLedgerApp: true,
                      stepPrevious: stepPrevious + 1,
                      stepTotal: stepTotal,
                    });
                  }
                } else {
                  replaceToWelcomePage();
                }
              }

              try {
                const vaultId = keyRingStore.selectedKeyInfo.id;
                const chainIdentifier =
                  ChainIdHelper.parse("bitcoin").identifier;
                const chainIdentifierSolana = ChainIdHelper.parse(
                  "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp"
                ).identifier;
                await chainStore.enableChainInfoInUIWithVaultId(
                  vaultId,
                  ...[chainIdentifier, chainIdentifierSolana]
                );
              } catch (err) {
                console.log("err enabled", err);
              }
            }}
          />
          <React.Fragment>
            <Gutter size="0.75rem" />
            <TextButton
              text={intl.formatMessage({
                id: "pages.register.enable-chains.skip-button",
              })}
              onClick={() => replaceToWelcomePage()}
            />
          </React.Fragment>
        </Box>
      </RegisterSceneBox>
    );
  }
);

const ChainItem: FunctionComponent<{
  modularChainInfo: ModularChainInfo;
  balance?: CoinPretty;

  enabled: boolean;
  blockInteraction: boolean;

  onClick: () => void;

  isFresh: boolean;
}> = observer(
  ({
    modularChainInfo,
    balance,
    enabled,
    blockInteraction,
    onClick,
    isFresh,
  }) => {
    const { priceStore } = useStore();
    const theme = useTheme();

    const price = balance ? priceStore.calculatePrice(balance) : undefined;

    const chainIdentifier = ChainIdHelper.parse(
      modularChainInfo.chainId
    ).identifier;

    return (
      <Box
        borderRadius="0.375rem"
        paddingX="1rem"
        paddingY="0.75rem"
        backgroundColor={
          enabled
            ? theme.mode === "light"
              ? ColorPalette["gray-10"]
              : ColorPalette["gray-500"]
            : theme.mode === "light"
            ? ColorPalette.white
            : ColorPalette["gray-600"]
        }
        cursor={blockInteraction ? "not-allowed" : "pointer"}
        onClick={() => {
          if (!blockInteraction) {
            onClick();
          }
        }}
      >
        <Columns sum={1}>
          <XAxis alignY="center">
            <ChainImageFallback chainInfo={modularChainInfo} size="3rem" />

            <Gutter size="0.5rem" />

            <YAxis>
              <Subtitle2>
                {(() => {
                  if (chainIdentifier === "noble") {
                    return `${modularChainInfo.chainName} (USDC)`;
                  }

                  return modularChainInfo.chainName;
                })()}
              </Subtitle2>
            </YAxis>
          </XAxis>
          <Column weight={1} />
          <XAxis alignY="center">
            {isFresh || balance == null ? null : (
              <YAxis alignX="right">
                <Subtitle3
                  color={
                    theme.mode === "light"
                      ? ColorPalette["gray-600"]
                      : ColorPalette.white
                  }
                >
                  {balance
                    .maxDecimals(6)
                    .shrink(true)
                    .inequalitySymbol(true)
                    .toString()}
                </Subtitle3>
                <Gutter size="0.25rem" />
                <Subtitle3 color={ColorPalette["gray-300"]}>
                  {price ? price.toString() : "-"}
                </Subtitle3>
              </YAxis>
            )}

            <Gutter size="1rem" />
            <Checkbox
              checked={enabled}
              onChange={() => {
                if (!blockInteraction) {
                  onClick();
                }
              }}
            />
          </XAxis>
        </Columns>
      </Box>
    );
  }
);

const NextStepChainItem: FunctionComponent<{
  modularChainInfo: ModularChainInfo;
  tagText: string;
}> = ({ modularChainInfo, tagText }) => {
  return (
    <Box
      paddingX="1rem"
      paddingY="0.75rem"
      cursor="not-allowed"
      style={{ opacity: 0.5 }}
    >
      <Columns sum={1}>
        <XAxis alignY="center">
          <ChainImageFallback chainInfo={modularChainInfo} size="3rem" />

          <Gutter size="0.5rem" />

          <YAxis>
            <XAxis alignY="center">
              <Subtitle2>{modularChainInfo.chainName}</Subtitle2>

              <Gutter size="0.375rem" />

              <Tag text={tagText} />
            </XAxis>

            <Gutter size="0.25rem" />

            <Subtitle4 color={ColorPalette["gray-300"]}>
              {"starknet" in modularChainInfo ? (
                <FormattedMessage id="pages.register.enable-chains.guide.can-select-starknet-later-step" />
              ) : (
                <FormattedMessage id="pages.register.enable-chains.guide.can-select-evm-next-step" />
              )}
            </Subtitle4>
          </YAxis>
        </XAxis>
      </Columns>
    </Box>
  );
};
