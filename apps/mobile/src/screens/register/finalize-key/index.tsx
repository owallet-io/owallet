import React, { FunctionComponent, useEffect, useRef, useState } from "react";
import { observer } from "mobx-react-lite";
import { Box } from "../../../components/box";
import LottieView from "lottie-react-native";
import { useStore } from "../../../stores";
import { WalletStatus } from "@owallet/stores";
import {
  RouteProp,
  useFocusEffect,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
// import {RootStackParamList, StackNavProp} from '../../../navigation';
import { InteractionManager, Text, View } from "react-native";
import Reanimated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useStyle } from "../../../styles";
import { defaultSpringConfig } from "../../../styles/spring";
import { ViewRegisterContainer } from "../components/view-register-container";
import { Buffer } from "buffer/";
import { FormattedMessage } from "react-intl";
import { RootStackParamList } from "@src/router/root";

const SimpleProgressBar: FunctionComponent<{
  progress: number;
}> = ({ progress }) => {
  const style = useStyle();

  const animProgress = useSharedValue(progress);

  useEffect(() => {
    animProgress.value = withSpring(progress, defaultSpringConfig);
  }, [animProgress, progress]);

  const barColor = style.get("color-blue-400").color;
  const animatedStyle = useAnimatedStyle(() => {
    return {
      height: 8,
      borderRadius: 9999,
      backgroundColor: barColor,
      width: `${animProgress.value * 100}%`,
    };
  });

  return (
    <View
      style={{
        height: 8,
        borderRadius: 9999,
        backgroundColor: style.get("color-gray-500").color,
      }}
    >
      <Reanimated.View style={animatedStyle} />
    </View>
  );
};

export const FinalizeKeyScreen: FunctionComponent = observer(() => {
  const { chainStore, accountStore, queriesStore, keyRingStore, priceStore } =
    useStore();
  const route =
    useRoute<RouteProp<RootStackParamList, "Register.FinalizeKey">>();
  const {
    mnemonic,
    privateKey,
    ledger,
    name,
    password,
    stepPrevious,
    stepTotal,
  } = route.params;
  const navigation = useNavigation();
  const style = useStyle();

  const [isScreenTransitionEnded, setIsScreenTransitionEnded] = useState(false);
  useFocusEffect(
    React.useCallback(() => {
      const task = InteractionManager.runAfterInteractions(() => {
        setIsScreenTransitionEnded(true);
      });

      return () => task.cancel();
    }, [])
  );

  // Effects depends on below state and these should be called once if length > 0.
  // Thus, you should set below state only once.
  const [candidateAddresses, setCandidateAddresses] = useState<
    {
      chainId: string;
      bech32Addresses: {
        coinType: number;
        address: string;
      }[];
    }[]
  >([]);
  const [vaultId, setVaultId] = useState("");

  const [queryRoughlyDone, setQueryRoughlyDone] = useState(false);
  const [queryProgress, setQueryProgress] = useState(0);
  const unmounted = useRef(false);
  useEffect(() => {
    return () => {
      unmounted.current = true;
    };
  }, []);

  useEffect(() => {
    if (!isScreenTransitionEnded) {
      return;
    }

    (async () => {
      // Chain store should be initialized before creating the key.
      await chainStore.waitUntilInitialized();
      await chainStore.updateChainInfosFromBackground();

      let vaultId: unknown;

      if (mnemonic) {
        vaultId = await keyRingStore.newMnemonicKey(
          mnemonic.value,
          mnemonic.bip44Path,
          name,
          password
        );
      } else if (privateKey) {
        vaultId = await keyRingStore.newPrivateKeyKey(
          Buffer.from(privateKey.hexValue, "hex"),
          privateKey.meta,
          name,
          password
        );
      } else if (ledger) {
        if (ledger?.app44 && ledger?.pubKey44) {
          vaultId = await keyRingStore.newLedgerKey(
            ledger.pubKey44,
            ledger.app44,
            ledger.bip44Path,
            name,
            password
          );
        }
        vaultId = await keyRingStore.newLedgerKey(
          ledger.pubKey,
          ledger.app,
          ledger.bip44Path,
          name,
          password
        );
      } else {
        throw new Error("Invalid props");
      }

      if (typeof vaultId !== "string") {
        throw new Error("Unknown error");
      }

      await chainStore.waitSyncedEnabledChains();

      let promises: Promise<unknown>[] = [];

      for (const chainInfo of chainStore.chainInfos) {
        // If mnemonic is fresh, there is no way that additional coin type account has value to select.
        if (mnemonic) {
          if (
            keyRingStore.needKeyCoinTypeFinalize(vaultId, chainInfo) &&
            mnemonic?.isFresh
          ) {
            promises.push(
              (async () => {
                await keyRingStore.finalizeKeyCoinType(
                  vaultId,
                  chainInfo.chainId,
                  chainInfo.bip44.coinType
                );
              })()
            );
          }
        }
      }

      await Promise.allSettled(promises);

      const candidateAddresses: {
        chainId: string;
        bech32Addresses: {
          coinType: number;
          address: string;
        }[];
      }[] = [];

      promises = [];
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

      setVaultId(vaultId);
      setCandidateAddresses(candidateAddresses);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isScreenTransitionEnded]);

  useEffect(() => {
    if (candidateAddresses.length > 0) {
      // Should call once.
      (async () => {
        const promises: Promise<unknown>[] = [];

        for (const candidateAddress of candidateAddresses) {
          const queries = queriesStore.get(candidateAddress.chainId);
          for (const bech32Address of candidateAddress.bech32Addresses) {
            // Prepare queries state to avoid UI flicker on next scene.
            promises.push(
              queries.cosmos.queryAccount
                .getQueryBech32Address(bech32Address.address)
                .waitFreshResponse()
            );
            promises.push(
              (async () => {
                const chainInfo = chainStore.getChain(candidateAddress.chainId);
                const bal = queries.queryBalances
                  .getQueryBech32Address(bech32Address.address)
                  .getBalance(
                    chainInfo.stakeCurrency || chainInfo.currencies[0]
                  );

                if (bal) {
                  await bal.waitFreshResponse();
                }
              })()
            );
            promises.push(
              queries.cosmos.queryDelegations
                .getQueryBech32Address(bech32Address.address)
                .waitFreshResponse()
            );
          }

          const chainInfo = chainStore.getChain(candidateAddress.chainId);
          const targetCurrency =
            chainInfo.stakeCurrency || chainInfo.currencies[0];
          if (targetCurrency.coinGeckoId) {
            priceStore.getPrice(targetCurrency.coinGeckoId);
          }
        }

        // Try to make sure that prices are fresh.
        promises.push(priceStore.waitFreshResponse());

        if (promises.length >= 10) {
          let once = false;
          setTimeout(() => {
            if (!once) {
              once = true;
              if (!unmounted.current) {
                setQueryRoughlyDone(true);
              }
            }
          }, 15000);

          let len = promises.length;
          let i = 0;
          for (const p of promises) {
            p.then(() => {
              i++;
              const progress = i / len;
              setQueryProgress(progress);
              if (progress >= 0.8 && !once) {
                once = true;
                setTimeout(() => {
                  if (!unmounted.current) {
                    setQueryRoughlyDone(true);
                  }
                }, 3000);
              }
            });
          }
        } else {
          setTimeout(() => {
            if (!unmounted.current) {
              setQueryRoughlyDone(true);
            }
          }, 3000);
        }
      })();
    }
    // Make sure to this effect called once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candidateAddresses]);

  const onceRef = useRef<boolean>(false);
  useEffect(() => {
    if (
      !onceRef.current &&
      candidateAddresses.length > 0 &&
      vaultId &&
      queryRoughlyDone
    ) {
      onceRef.current = true;

      navigation.reset({
        routes: [
          {
            name: "Register.EnableChain",
            params: {
              vaultId,
              candidateAddresses,
              isFresh: mnemonic?.isFresh ?? false,
              stepPrevious: stepPrevious,
              stepTotal: stepTotal,
              password: password,
            },
          },
        ],
      });
    }
  }, [
    candidateAddresses,
    mnemonic?.isFresh,
    navigation,
    password,
    stepPrevious,
    stepTotal,
    vaultId,
    queryRoughlyDone,
  ]);

  return (
    <ViewRegisterContainer
      forceEnableTopSafeArea={true}
      contentContainerStyle={{
        flexGrow: 1,
        alignItems: "center",
      }}
    >
      <View style={{ flex: 1 }} />
      <LottieView
        source={require("@assets/animations/loading_owallet.json")}
        loop={true}
        autoPlay={true}
        style={{ width: "80%", aspectRatio: 1 }}
      />
      <View
        style={{
          flex: 2,
        }}
      />
      <Text style={style.flatten(["subtitle3", "color-text-low"])}>
        <FormattedMessage id="pages.register.finalize-key.loading.text" />
      </Text>
      <Box marginTop={21} marginBottom={12} paddingX={28} width="100%">
        <SimpleProgressBar progress={queryProgress} />
      </Box>
      <Text style={style.flatten(["body2", "color-text-low", "text-center"])}>
        ({(queryProgress * 100).toFixed(0)}%/ 100%)
      </Text>
      <View
        style={{
          flex: 1,
        }}
      />
    </ViewRegisterContainer>
  );
});
