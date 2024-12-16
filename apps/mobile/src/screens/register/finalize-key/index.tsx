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
import { Image, InteractionManager, StyleSheet, View } from "react-native";
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
import { resetTo, RootStackParamList } from "@src/router/root";
import { metrics } from "@src/themes";
import { PageWithView } from "@components/page";
import { useTheme } from "@src/themes/theme-provider";
import { Text } from "@components/text";
import { SCREENS } from "@common/constants";

const SimpleProgressBar: FunctionComponent<{
  progress: number;
}> = ({ progress }) => {
  const style = useStyle();

  const animProgress = useSharedValue(progress);

  useEffect(() => {
    animProgress.value = withSpring(progress, defaultSpringConfig);
  }, [animProgress, progress]);
  const { colors } = useTheme();
  const barColor = colors["primary-surface-pressed"];
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
  const { colors } = useTheme();

  const styles = styling(colors);
  const [count, setCount] = useState(0);
  const unmounted = useRef(false);
  useEffect(() => {
    return () => {
      unmounted.current = true;
    };
  }, []);
  useEffect(() => {
    const interval = setInterval(() => {
      setCount((prevCount) => {
        if (prevCount === 3) {
          return 1; // Reset to 1
        } else {
          return prevCount + 1; // Increment count
        }
      });
    }, 600); // Interval in milliseconds

    return () => {
      clearInterval(interval); // Clean up interval on component unmount
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
      (async () => {
        const chainsEnable = chainStore.chainInfos.map(
          (chainInfo, index) => chainInfo.chainIdentifier
        );
        await chainStore.enableChainInfoInUIWithVaultId(
          vaultId,
          ...chainsEnable
        );
        resetTo(SCREENS.STACK.MainTab);
      })();
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
    <PageWithView
      disableSafeArea
      style={{
        backgroundColor: colors["neutral-surface-card"],
        justifyContent: "space-between",
      }}
    >
      <View
        style={{
          display: "flex",
          alignItems: "center",
        }}
      >
        <View>
          <View style={styles.container}>
            <Image
              style={{
                width: metrics.screenWidth,
                height: metrics.screenWidth,
              }}
              source={require("@assets/image/img-bg.png")}
              resizeMode="contain"
              fadeDuration={0}
            />
          </View>
          <View style={styles.containerCheck}>
            <Image
              style={styles.img}
              source={require("@assets/image/logo_group.png")}
              resizeMode="contain"
              fadeDuration={0}
            />
            <Text size={28} weight={"700"} style={styles.text}>
              {"CREATING"}
            </Text>
            <Text size={28} weight={"700"} style={styles.text}>
              YOUR WALLET
              {Array.from({ length: count }, (_, index) => ".").map((d) => {
                return (
                  <Text size={28} weight={"700"} style={styles.text}>
                    {d}
                  </Text>
                );
              })}
            </Text>
            <Box marginTop={21} marginBottom={12} paddingX={28} width="100%">
              <SimpleProgressBar progress={queryProgress} />
            </Box>
            <Text
              style={{
                ...style.flatten(["body2", "color-text-low", "text-center"]),
                color: colors["neutral-text-title"],
              }}
            >
              ({(queryProgress * 100).toFixed(0)}%/ 100%)
            </Text>
          </View>
        </View>
      </View>
    </PageWithView>
  );
});
const styling = (colors) =>
  StyleSheet.create({
    btnDone: {
      width: "100%",
      alignItems: "center",
      padding: 16,
      marginBottom: 42,
    },
    container: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      position: "absolute",
      top: 0,
    },
    containerCheck: {
      alignItems: "center",
      justifyContent: "center",
      width: metrics.screenWidth,
      height: metrics.screenHeight,
    },
    text: {
      color: colors["neutral-text-title"],
      lineHeight: 34,
    },
    img: {
      width: metrics.screenWidth / 1.6,
      height: metrics.screenWidth / 1.6,
      marginBottom: 32,
    },
  });
