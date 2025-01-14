import React, {
  FunctionComponent,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { observer } from "mobx-react-lite";
import { Box } from "../../../components/box";
import { Image, Keyboard, StyleSheet, Text, View } from "react-native";
import { useStyle } from "../../../styles";
import { FormattedMessage, useIntl } from "react-intl";
import { TextInput } from "../../../components/input";
import { SearchIcon } from "../../../components/icon";
import { Gutter } from "../../../components/gutter";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { RootStackParamList, StackNavProp } from "../../../navigation";
import { useStore } from "../../../stores";
import {
  CoinGeckoPriceStore,
  IChainInfoImpl,
  IQueriesStore,
  WalletStatus,
} from "@owallet/stores";
import { ChainIdHelper } from "@owallet/cosmos";
import {
  ChainInfoWithCoreTypes,
  KeyRingCosmosService,
} from "@owallet/background";
import { CoinPretty, Dec } from "@owallet/unit";
import { ChainInfo } from "@owallet/types";
import { XAxis, YAxis } from "../../../components/axis";
import { RectButton } from "../../../components/rect-button";
import { ViewRegisterContainer } from "../components/view-register-container";
import { VerticalCollapseTransition } from "../../../components/transition";
import { action, autorun, computed, makeObservable, observable } from "mobx";
import { ChainStore } from "../../../stores/chain";
import { ScrollView } from "../../../components/scroll-view/common-scroll-view";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import { BinarySortArray } from "@stores/huge-queries/sort";
import { useEffectOnce } from "@hooks/use-effect-once";
import CheckBox from "react-native-check-box";
import OWText from "@components/text/ow-text";
import { unknownToken } from "@owallet/common";
import { SCREENS } from "@common/constants";
import { resetTo } from "@src/router/root";

class QueryCandidateAddressesSortBalanceChainInfos {
  @observable.ref
  protected candidateAddresses: {
    chainId: string;
    bech32Addresses: {
      coinType: number;
      address: string;
    }[];
  }[] = [];

  protected balanceBinarySort: BinarySortArray<{
    chainId: string;
  }>;

  @observable.ref
  protected preSortChainInfos: IChainInfoImpl<ChainInfoWithCoreTypes>[] = [];

  constructor(
    protected chainStore: ChainStore,
    protected queriesStore: IQueriesStore,
    protected priceStore: CoinGeckoPriceStore,
    candidateAddresses: {
      chainId: string;
      bech32Addresses: {
        coinType: number;
        address: string;
      }[];
    }[]
  ) {
    this.candidateAddresses = candidateAddresses;

    makeObservable(this);

    let disposal: (() => void) | undefined;
    this.balanceBinarySort = new BinarySortArray<{
      chainId: string;
    }>(
      this.sort.bind(this),
      () => {
        disposal = autorun(() => {
          this.update();
        });
      },
      () => {
        if (disposal) {
          disposal();
        }
      }
    );
  }

  get chainIds(): ReadonlyArray<string> {
    return this.balanceBinarySort.arr.map((v) => v.chainId);
  }

  protected update() {
    const keysUsed = new Map<string, boolean>();
    const prevKeyMap = new Map(this.balanceBinarySort.indexForKeyMap());

    for (const preSortChainInfo of this.preSortChainInfos) {
      const key = preSortChainInfo.chainId;
      if (!keysUsed.get(key)) {
        keysUsed.set(key, true);

        prevKeyMap.delete(key);

        this.balanceBinarySort.pushAndSort(key, {
          chainId: preSortChainInfo.chainId,
        });
      }
    }

    for (const removedKey of prevKeyMap.keys()) {
      this.balanceBinarySort.remove(removedKey);
    }
  }

  protected sort(
    aChainId: {
      chainId: string;
    },
    bChainId: {
      chainId: string;
    }
  ): number {
    const a = this.chainStore.getChain(aChainId.chainId);
    const b = this.chainStore.getChain(bChainId.chainId);
    const aBalance = (() => {
      const addresses = this.candidateAddressesMap.get(a.chainIdentifier);
      const chainInfo = this.chainStore.getChain(a.chainId);
      if (addresses && addresses.length > 0) {
        const queryBal = this.queriesStore
          .get(a.chainId)
          .queryBalances.getQueryBech32Address(addresses[0].address)
          .getBalance(chainInfo.stakeCurrency || chainInfo.currencies[0]);
        if (queryBal) {
          return queryBal.balance;
        }
      }

      return new CoinPretty(
        chainInfo.stakeCurrency || chainInfo.currencies[0],
        "0"
      );
    })();
    const bBalance = (() => {
      const addresses = this.candidateAddressesMap.get(b.chainIdentifier);
      const chainInfo = this.chainStore.getChain(b.chainId);
      if (addresses && addresses.length > 0) {
        const queryBal = this.queriesStore
          .get(b.chainId)
          .queryBalances.getQueryBech32Address(addresses[0].address)
          .getBalance(chainInfo.stakeCurrency || chainInfo.currencies[0]);
        if (queryBal) {
          return queryBal.balance;
        }
      }

      return new CoinPretty(
        chainInfo.stakeCurrency || chainInfo.currencies[0],
        "0"
      );
    })();

    const aPrice =
      this.priceStore.calculatePrice(aBalance)?.toDec() ?? new Dec(0);
    const bPrice =
      this.priceStore.calculatePrice(bBalance)?.toDec() ?? new Dec(0);

    if (!aPrice.equals(bPrice)) {
      return aPrice.gt(bPrice) ? -1 : 1;
    }

    // balance의 fiat 기준으로 sort.
    // 같으면 이름 기준으로 sort.
    return a.chainName.localeCompare(b.chainName);
  }

  @computed
  protected get candidateAddressesMap(): Map<
    string,
    {
      coinType: number;
      address: string;
    }[]
  > {
    const map: Map<
      string,
      {
        coinType: number;
        address: string;
      }[]
    > = new Map();
    for (const candidateAddress of this.candidateAddresses) {
      map.set(
        ChainIdHelper.parse(candidateAddress.chainId).identifier,
        candidateAddress.bech32Addresses
      );
    }
    return map;
  }

  @action
  setCandidateAddresses(
    candidateAddresses: {
      chainId: string;
      bech32Addresses: {
        coinType: number;
        address: string;
      }[];
    }[]
  ) {
    this.candidateAddresses = candidateAddresses;
  }

  @action
  setPreSortChainInfos(chainInfos: IChainInfoImpl<ChainInfoWithCoreTypes>[]) {
    this.preSortChainInfos = chainInfos;
  }
}

export const EnableChainsScreen: FunctionComponent = observer(() => {
  const intl = useIntl();
  const style = useStyle();
  const route =
    useRoute<RouteProp<RootStackParamList, "Register.EnableChain">>();

  const navigation = useNavigation<StackNavProp>();

  const { accountStore, chainStore, keyRingStore, priceStore, queriesStore } =
    useStore();

  const {
    vaultId,
    candidateAddresses: propCandidateAddresses,
    isFresh,
    skipWelcome,
    initialSearchValue,
    // fallbackEthereumLedgerApp,
    fallbackBtcLedgerApp,
    stepPrevious,
    stepTotal,
    password,
    hideBackButton = true,
  } = route.params;

  const [candidateAddresses, setCandidateAddresses] = useState<
    {
      chainId: string;
      bech32Addresses: {
        coinType: number;
        address: string;
      }[];
    }[]
  >(propCandidateAddresses ?? []);
  const [queryCandidateAddressesSortBalanceChainInfos] = useState(
    () =>
      new QueryCandidateAddressesSortBalanceChainInfos(
        chainStore,
        queriesStore,
        priceStore,
        candidateAddresses
      )
  );
  queryCandidateAddressesSortBalanceChainInfos.setCandidateAddresses(
    candidateAddresses
  );

  const keyType = useMemo(() => {
    const keyInfo = keyRingStore.keyInfos.find(
      (keyInfo) => keyInfo.id === vaultId
    );
    if (!keyInfo) {
      throw new Error("KeyInfo not found");
    }

    return keyInfo.type;
  }, [keyRingStore.keyInfos, vaultId]);

  const paragraph = isFresh
    ? `${intl.formatMessage({
        id: "pages.register.components.header.header-step.title",
      })} ${(stepPrevious ?? 0) + 1}/${stepTotal}`
    : undefined;

  useLayoutEffect(() => {
    navigation.setParams({
      hideBackButton,
    });
  }, [hideBackButton, isFresh, navigation, stepPrevious, stepTotal]);

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
        for (const chainInfo of chainStore.chainInfos) {
          if (keyRingStore.needKeyCoinTypeFinalize(vaultId, chainInfo)) {
            promises.push(
              (async () => {
                const res = await keyRingStore.computeNotFinalizedKeyAddresses(
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

        await Promise.allSettled(promises);

        setCandidateAddresses(candidateAddresses);
      })();
    }
  });

  // Select derivation scene으로 이동한 후에는 coin type을 여기서 자동으로 finalize 하지 않도록 보장한다.
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

  const [enabledChainIdentifiers, setEnabledChainIdentifiers] = useState(() => {
    const enabledChainIdentifiers: string[] =
      chainStore.enabledChainIdentifiers;

    if (
      candidateAddresses.length > 0 &&
      enabledChainIdentifiers.length === 1 &&
      enabledChainIdentifiers[0] === chainStore.chainInfos[0].chainIdentifier
    ) {
      if (chainStore.chainInfos.find((c) => c.chainIdentifier === "noble")) {
        enabledChainIdentifiers.push("noble");
      }
    }

    for (const candidateAddress of candidateAddresses) {
      const queries = queriesStore.get(candidateAddress.chainId);
      const chainInfo = chainStore.getChain(candidateAddress.chainId);

      // If the chain is already enabled, skip.
      if (chainStore.isEnabledChain(candidateAddress.chainId)) {
        continue;
      }

      // If the chain is not enabled, check that the account exists.
      // If the account exists, turn on the chain.
      for (const bech32Address of candidateAddress.bech32Addresses) {
        // Check that the account has some assets or delegations.
        // If so, enable it by default
        const queryBalance = queries.queryBalances
          .getQueryBech32Address(bech32Address.address)
          .getBalance(chainInfo.stakeCurrency || chainInfo.currencies[0]);

        if (queryBalance?.response?.data) {
          const data = queryBalance.response.data as any;
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
        }

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

    return [...new Set(enabledChainIdentifiers)];
  });

  const enabledChainIdentifierMap = useMemo(() => {
    const map = new Map<string, boolean>();

    for (const enabledChainIdentifier of enabledChainIdentifiers) {
      map.set(enabledChainIdentifier, true);
    }

    return map;
  }, [enabledChainIdentifiers]);

  const [sortPriorityChainIdentifierMap] = useState(enabledChainIdentifierMap);

  const [search, setSearch] = useState<string>(initialSearchValue ?? "");
  useLayoutEffect(() => {
    const value = (() => {
      let chainInfos = chainStore.chainInfos.slice();

      if (keyType === "ledger") {
        chainInfos = chainInfos.filter((chainInfo) => {
          const isBtc = chainInfo.features.includes("btc");
          // const isEthermintLike =
          //     chainInfo.bip44.coinType === 60 ||
          //     !!chainInfo.features?.includes('eth-address-gen') ||
          //     !!chainInfo.features?.includes('eth-key-sign');

          // if (isEthermintLike && !fallbackEthereumLedgerApp) {
          //     return false;
          // }
          if (isBtc && !fallbackBtcLedgerApp) {
            return false;
          }
          // if (fallbackEthereumLedgerApp) {
          //     if (!isEthermintLike) {
          //         return false;
          //     }
          //
          //     try {
          //         KeyRingCosmosService.throwErrorIfEthermintWithLedgerButNotSupported(
          //             chainInfo.chainId,
          //         );
          //         return true;
          //     } catch {
          //         return false;
          //     }
          // }
          if (fallbackBtcLedgerApp) {
            if (!isBtc) {
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
          return true;
        });
      }

      const trimSearch = search.trim();

      if (!trimSearch) {
        return chainInfos;
      } else {
        return chainInfos.filter((chainInfo) => {
          return (
            chainInfo.chainName
              .toLowerCase()
              .includes(trimSearch.toLowerCase()) ||
            (chainInfo.stakeCurrency || chainInfo.currencies[0]).coinDenom
              .toLowerCase()
              .includes(trimSearch.toLowerCase())
          );
        });
      }
    })();

    queryCandidateAddressesSortBalanceChainInfos.setPreSortChainInfos(value);
  }, [
    chainStore.chainInfos,
    // fallbackEthereumLedgerApp,
    fallbackBtcLedgerApp,
    keyType,
    queryCandidateAddressesSortBalanceChainInfos,
    search,
  ]);

  const chainInfos = queryCandidateAddressesSortBalanceChainInfos.chainIds
    .map((chainId) => {
      return chainStore.getChain(chainId);
    })
    .sort((a, b) => {
      const aHasPriority = sortPriorityChainIdentifierMap.has(
        a.chainIdentifier
      );
      const bHasPriority = sortPriorityChainIdentifierMap.has(
        b.chainIdentifier
      );

      if (aHasPriority && !bHasPriority) {
        return -1;
      }

      if (!aHasPriority && bHasPriority) {
        return 1;
      }

      return 0;
    });

  const numSelected = useMemo(() => {
    const chainInfoMap = new Map<string, ChainInfo>();
    for (const chanInfo of chainStore.chainInfos) {
      chainInfoMap.set(chanInfo.chainIdentifier, chanInfo);
    }

    let numSelected = 0;
    for (const enabledChainIdentifier of enabledChainIdentifiers) {
      if (chainInfoMap.has(enabledChainIdentifier)) {
        numSelected++;
      }
    }
    return numSelected;
  }, [chainStore.chainInfos, enabledChainIdentifiers]);

  const replaceToWelcomePage = () => {
    resetTo(SCREENS.STACK.MainTab);
  };

  const enabledChainIdentifiersInPage = useMemo(() => {
    return enabledChainIdentifiers.filter((chainIdentifier) =>
      chainInfos.some(
        (chainInfo) => chainIdentifier === chainInfo.chainIdentifier
      )
    );
  }, [enabledChainIdentifiers, chainInfos]);

  const [preSelectedChainIdentifiers, setPreSelectedChainIdentifiers] =
    useState<string[]>([]);

  const [isKeyboardOpen, setIsKeyboardOpen] = useState(() =>
    Keyboard.isVisible()
  );
  useEffect(() => {
    const keyboardShowListener = Keyboard.addListener(
      "keyboardWillShow",
      () => {
        setIsKeyboardOpen(true);
      }
    );
    const keyboardShowListener2 = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setIsKeyboardOpen(true);
      }
    );
    const keyboardHideListener = Keyboard.addListener(
      "keyboardWillHide",
      () => {
        setIsKeyboardOpen(false);
      }
    );
    const keyboardHideListener2 = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setIsKeyboardOpen(false);
      }
    );

    return () => {
      keyboardShowListener.remove();
      keyboardShowListener2.remove();
      keyboardHideListener.remove();
      keyboardHideListener2.remove();
    };
  }, []);

  const onClickSelectAll = () => {
    if (chainInfos.length === enabledChainIdentifiersInPage.length) {
      if (preSelectedChainIdentifiers.length > 0) {
        setEnabledChainIdentifiers(preSelectedChainIdentifiers);
      } else {
        if (chainInfos.length > 0) {
          setEnabledChainIdentifiers([chainInfos[0].chainIdentifier]);
        }
      }
    } else {
      setPreSelectedChainIdentifiers([...enabledChainIdentifiers]);
      const newEnabledChainIdentifiers: string[] =
        enabledChainIdentifiers.slice();
      for (const chainInfo of chainInfos) {
        if (!newEnabledChainIdentifiers.includes(chainInfo.chainIdentifier)) {
          newEnabledChainIdentifiers.push(chainInfo.chainIdentifier);
        }
      }
      setEnabledChainIdentifiers(newEnabledChainIdentifiers);
    }
  };

  return (
    <ViewRegisterContainer
      paddingLeft={12}
      paddingRight={12}
      contentContainerStyle={{
        flexGrow: 1,
      }}
      bottomButton={{
        text: intl.formatMessage({
          id: "button.save",
        }),
        size: "large",
        onPress: async () => {
          const enables: string[] = [];
          const disables: string[] = [];

          for (const chainInfo of chainStore.chainInfos) {
            const enabled =
              enabledChainIdentifierMap.get(chainInfo.chainIdentifier) || false;

            if (enabled) {
              enables.push(chainInfo.chainIdentifier);
            } else {
              disables.push(chainInfo.chainIdentifier);
            }
          }

          const needFinalizeCoinType: string[] = [];
          for (let i = 0; i < enables.length; i++) {
            const enable = enables[i];
            const chainInfo = chainStore.getChain(enable);
            if (keyRingStore.needKeyCoinTypeFinalize(vaultId, chainInfo)) {
              // Remove enable from enables
              enables.splice(i, 1);
              i--;
              // And push it disables
              disables.push(enable);

              needFinalizeCoinType.push(enable);
            }
          }

          // const ledgerEthereumAppNeeds: string[] = [];
          const ledgerBtcAppNeeds: string[] = [];
          for (let i = 0; i < enables.length; i++) {
            if (!fallbackBtcLedgerApp) {
              break;
            }

            const enable = enables[i];

            const chainInfo = chainStore.getChain(enable);
            const isBtc = chainInfo.features?.includes("btc");
            // const isEthermintLike =
            //     chainInfo.bip44.coinType === 60 ||
            //     !!chainInfo.features?.includes('eth-address-gen') ||
            //     !!chainInfo.features?.includes('eth-key-sign');
            if (isBtc) {
              enables.splice(i, 1);
              i--;
              // And push it disables
              disables.push(enable);

              ledgerBtcAppNeeds.push(enable);
            }
            // if (isEthermintLike) {
            //     // Remove enable from enables
            //     enables.splice(i, 1);
            //     i--;
            //     // And push it disables
            //     disables.push(enable);
            //
            //     ledgerEthereumAppNeeds.push(enable);
            // }
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

          if (needFinalizeCoinType.length > 0) {
            sceneMovedToSelectDerivation.current = true;
            resetTo(SCREENS.STACK.MainTab);
            // navigation.reset({
            //   routes: [
            //     {
            //       name: "Register.SelectDerivationPath",
            //       params: {
            //         vaultId,
            //         chainIds: needFinalizeCoinType,
            //         totalCount: needFinalizeCoinType.length,
            //         password,
            //         skipWelcome,
            //       },
            //     },
            //   ],
            // });
          } else {
            if (keyType === "ledger") {
              if (!fallbackBtcLedgerApp) {
                navigation.navigate("Register.EnableChain", {
                  vaultId,
                  candidateAddresses: [],
                  isFresh: false,
                  skipWelcome,
                  fallbackBtcLedgerApp: true,
                  stepPrevious: stepPrevious,
                  stepTotal: stepTotal,
                });
              } else if (ledgerBtcAppNeeds.length > 0) {
                const keyInfo = keyRingStore.keyInfos.find(
                  (keyInfo) => keyInfo.id === vaultId
                );
                if (!keyInfo) {
                  throw new Error("KeyInfo not found");
                }
                if (keyInfo.insensitive["Bitcoin"]) {
                  await chainStore.enableChainInfoInUI(...ledgerBtcAppNeeds);
                  replaceToWelcomePage();
                } else {
                  const bip44Path = keyInfo.insensitive["bip44Path"];
                  if (!bip44Path) {
                    throw new Error("bip44Path not found");
                  }

                  navigation.push(SCREENS.ConnectNewLedger, {
                    name: "",
                    password: password || "",
                    app: "Bitcoin",
                    bip44Path: bip44Path as {
                      account: number;
                      change: number;
                      addressIndex: number;
                    },

                    appendModeInfo: {
                      vaultId,
                      afterEnableChains: ledgerBtcAppNeeds,
                    },
                    stepPrevious: stepPrevious || 0,
                    stepTotal: stepTotal || 0,
                  });
                }
              } else {
                replaceToWelcomePage();
              }
            } else {
              replaceToWelcomePage();
            }
          }
        },
      }}
    >
      {paragraph ? (
        <React.Fragment>
          <Text
            style={style.flatten(["body2", "text-center", "color-text-low"])}
          >
            {paragraph}
          </Text>
          <Gutter size={18} />
        </React.Fragment>
      ) : null}

      <VerticalCollapseTransition collapsed={isKeyboardOpen}>
        <Text
          style={StyleSheet.flatten([
            style.flatten(["color-text-low", "body1"]),
            { textAlign: "center" },
          ])}
        >
          <FormattedMessage id="pages.register.enable-chains.paragraph" />
        </Text>
      </VerticalCollapseTransition>
      <Gutter size={16} />
      <TextInput
        left={(color) => <SearchIcon size={20} color={color} />}
        value={search}
        onChangeText={(text) => {
          setSearch(text);
        }}
        placeholder={intl.formatMessage({
          id: "pages.register.enable-chains.search-input-placeholder",
        })}
      />

      <Gutter size={16} />

      <XAxis alignY="center">
        <Text style={style.flatten(["subtitle3", "color-text-high", "flex-1"])}>
          <FormattedMessage
            id="pages.register.enable-chains.chain-selected-count"
            values={{ numSelected }}
          />
        </Text>

        <RectButton
          onPress={() => {
            onClickSelectAll();
          }}
        >
          <XAxis alignY="center">
            <Text style={style.flatten(["body2", "color-gray-300"])}>
              <FormattedMessage id="text-button.select-all" />
            </Text>

            <Gutter size={4} />

            <CheckBox
              isChecked={
                chainInfos.length === enabledChainIdentifiersInPage.length
              }
              onClick={() => {
                onClickSelectAll();
              }}
            />
          </XAxis>
        </RectButton>
      </XAxis>

      <Gutter size={16} />
      <View
        style={style.flatten([
          "overflow-hidden",
          "border-radius-6",
          "flex-1",
          "relative",
        ])}
      >
        <ScrollView style={style.flatten(["absolute-fill"])}>
          {chainInfos.map((chainInfo, i) => {
            const account = accountStore.getAccount(chainInfo.chainId);

            const queries = queriesStore.get(chainInfo.chainId);

            const balance = (() => {
              const currency =
                chainInfo.stakeCurrency || chainInfo.currencies[0];
              const queryBal = queries.queryBalances
                .getQueryBech32Address(account.bech32Address)
                .getBalance(currency);
              if (queryBal) {
                return queryBal.balance;
              }
              return new CoinPretty(currency, "0");
            })();

            const enabled =
              enabledChainIdentifierMap.get(chainInfo.chainIdentifier) || false;

            // At least, one chain should be enabled.
            const blockInteraction =
              enabledChainIdentifiers.length <= 1 && enabled;

            return (
              <React.Fragment key={chainInfo.chainId}>
                <ChainItem
                  chainInfo={chainInfo}
                  balance={balance}
                  enabled={enabled}
                  blockInteraction={blockInteraction}
                  isFresh={isFresh || account.bech32Address === ""}
                  onClick={() => {
                    if (
                      enabledChainIdentifierMap.get(chainInfo.chainIdentifier)
                    ) {
                      setEnabledChainIdentifiers(
                        enabledChainIdentifiers.filter(
                          (chainIdentifier) =>
                            chainIdentifier !== chainInfo.chainIdentifier
                        )
                      );
                    } else {
                      setEnabledChainIdentifiers([
                        ...enabledChainIdentifiers,
                        chainInfo.chainIdentifier,
                      ]);
                    }
                  }}
                />
                {i !== chainInfos.length - 1 ? <Divider /> : null}
              </React.Fragment>
            );
          })}

          {/*{!fallbackEthereumLedgerApp &&*/}
          {/*    keyType === 'ledger' &&*/}
          {/*    chainStore.chainInfos*/}
          {/*        .filter(chainInfo => {*/}
          {/*            const trimSearch = search.trim();*/}
          {/*            return (*/}
          {/*                chainInfo.chainName*/}
          {/*                    .toLowerCase()*/}
          {/*                    .includes(trimSearch.toLowerCase()) ||*/}
          {/*                (chainInfo.stakeCurrency || chainInfo.currencies[0]).coinDenom*/}
          {/*                    .toLowerCase()*/}
          {/*                    .includes(trimSearch.toLowerCase())*/}
          {/*            );*/}
          {/*        })*/}
          {/*        .map(chainInfo => {*/}
          {/*            const isEthermintLike =*/}
          {/*                chainInfo.bip44.coinType === 60 ||*/}
          {/*                !!chainInfo.features?.includes('eth-address-gen') ||*/}
          {/*                !!chainInfo.features?.includes('eth-key-sign');*/}

          {/*            const supported = (() => {*/}
          {/*                try {*/}
          {/*                    KeyRingCosmosService.throwErrorIfEthermintWithLedgerButNotSupported(*/}
          {/*                        chainInfo.chainId,*/}
          {/*                    );*/}
          {/*                    return true;*/}
          {/*                } catch {*/}
          {/*                    return false;*/}
          {/*                }*/}
          {/*            })();*/}

          {/*            if (isEthermintLike && supported) {*/}
          {/*                return (*/}
          {/*                    <NextStepEvmChainItem*/}
          {/*                        key={chainInfo.chainId}*/}
          {/*                        chainInfo={chainInfo}*/}
          {/*                    />*/}
          {/*                );*/}
          {/*            }*/}

          {/*            return null;*/}
          {/*        })}*/}
        </ScrollView>
      </View>
      <VerticalCollapseTransition collapsed={isKeyboardOpen}>
        <Gutter size={20} />
      </VerticalCollapseTransition>
    </ViewRegisterContainer>
  );
});

const ChainItem: FunctionComponent<{
  chainInfo: IChainInfoImpl;
  balance: CoinPretty;

  enabled: boolean;
  blockInteraction: boolean;

  onClick: () => void;

  isFresh: boolean;
}> = observer(
  ({ chainInfo, balance, enabled, blockInteraction, onClick, isFresh }) => {
    const style = useStyle();
    const { priceStore } = useStore();
    const price = priceStore.calculatePrice(balance);

    const toggle = () => {
      if (!blockInteraction) {
        onClick();
      }
    };

    return (
      <TouchableWithoutFeedback onPress={toggle}>
        <Box
          paddingX={16}
          paddingY={14}
          backgroundColor={
            enabled
              ? style.get("color-gray-550").color
              : style.get("color-gray-600").color
          }
        >
          <XAxis alignY="center">
            <Image
              style={style.flatten([
                "width-40",
                "height-40",
                "border-radius-40",
              ])}
              source={
                chainInfo.chainSymbolImageUrl
                  ? chainInfo.chainSymbolImageUrl
                  : unknownToken.coinImageUrl
              }
              // contentFit="contain"
            />

            <Gutter size={8} />

            <Text style={style.flatten(["subtitle2", "color-white", "flex-1"])}>
              {(() => {
                // Noble의 경우만 약간 특수하게 표시해줌
                if (chainInfo.chainIdentifier === "noble") {
                  return `${chainInfo.chainName} (USDC)`;
                }

                return chainInfo.chainName;
              })()}
            </Text>
            {isFresh ? null : (
              <YAxis alignX="right">
                <Text style={style.flatten(["subtitle3", "color-gray-10"])}>
                  {balance
                    .maxDecimals(6)
                    .shrink(true)
                    .inequalitySymbol(true)
                    .toString()}
                </Text>

                <Gutter size={4} />

                <Text style={style.flatten(["subtitle3", "color-gray-300"])}>
                  {price ? price.toString() : "-"}
                </Text>
              </YAxis>
            )}

            <Gutter size={16} />

            <CheckBox isChecked={enabled} onClick={toggle} size="large" />
          </XAxis>
        </Box>
      </TouchableWithoutFeedback>
    );
  }
);

const Divider = () => {
  const style = useStyle();

  return <Box height={1} backgroundColor={style.get("color-gray-500").color} />;
};

const NextStepEvmChainItem: FunctionComponent<{
  chainInfo: ChainInfo;
}> = ({ chainInfo }) => {
  const style = useStyle();

  return (
    <Box
      paddingX={16}
      paddingY={14}
      backgroundColor={style.get("color-gray-500").color}
      style={{ opacity: 0.5, flex: 1 }}
    >
      <XAxis alignY="center">
        <Image
          style={style.flatten(["width-40", "height-40", "border-radius-40"])}
          source={
            chainInfo?.chainSymbolImageUrl
              ? chainInfo.chainSymbolImageUrl
              : unknownToken.coinImageUrl
          }
          // contentFit="contain"
        />

        <Gutter size={8} />

        <View style={{ flexDirection: "column", flex: 1 }}>
          <XAxis>
            <Text style={style.flatten(["subtitle2", "color-white"])}>
              {chainInfo.chainName}
            </Text>

            <Gutter size={4} />

            <OWText>EVM</OWText>
          </XAxis>

          <Text
            style={style.flatten(["subtitle3", "color-gray-300", "flex-1"])}
          >
            <FormattedMessage id="pages.register.enable-chains.guide.can-select-evm-next-step" />
          </Text>
        </View>
      </XAxis>
    </Box>
  );
};
