import OWText from "@src/components/text/ow-text";
import { useTheme } from "@src/themes/theme-provider";
import { observer } from "mobx-react-lite";
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  Image,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useStore } from "../../../stores";
import { metrics, spacing } from "@src/themes";
import OWIcon from "@src/components/ow-icon/ow-icon";
import { API } from "@src/common/api";
import {
  AprByChain,
  ChainIdEnum,
  COINTYPE_NETWORK,
  fetchRetry,
  getKeyDerivationFromAddressType,
} from "@owallet/common";
import axios from "axios";
import { Popup } from "react-native-popup-confirm-toast";
import { tracking } from "@src/utils/tracking";
import { showToast } from "@src/utils/helper";
import { useBIP44Option } from "@src/screens/register/bip44";
import { OWBox } from "@src/components/card";
import { navigate } from "@src/router/root";
import { SCREENS } from "@common/constants";
import { simpleFetch } from "@owallet/simple-fetch";
import { Dec, IntPretty } from "@owallet/unit";
import { ScrollView } from "react-native-gesture-handler";

const dataOWalletStake = [
  {
    chainId: ChainIdEnum.Oraichain,
    isRecommended: true,
    validator: "oraivaloper1q53ujvvrcd0t543dsh5445lu6ar0qr2zv4yhhp",
  },
  {
    chainId: ChainIdEnum.Osmosis,
    isRecommended: false,
    validator: "osmovaloper1zqevmn000unnjj709akc8p86f9jc4xevf8f8g3",
  },
  {
    chainId: ChainIdEnum.CosmosHub,
    isRecommended: false,
    validator: "cosmosvaloper19qv67gvevp4xw64kmhd6ff6ta2l2ywgfm74xtz",
  },
];
const valVotingPower = 1000;
const daysInYears = 365.2425;

async function getBlockTime(lcdEndpoint, blockHeightDiff = 100) {
  try {
    // Fetch the latest block
    const latestBlockResponse = await fetch(
      `${lcdEndpoint}/cosmos/base/tendermint/v1beta1/blocks/latest`
    );
    const latestBlockData = await latestBlockResponse.json();

    if (!latestBlockResponse.ok || !latestBlockData.block) {
      throw new Error("Failed to fetch latest block.");
    }

    // Get latest block height and timestamp
    const latestBlockHeight = parseInt(latestBlockData.block.header.height);
    const latestBlockTime = new Date(
      latestBlockData.block.header.time
    ).getTime();

    // Fetch a previous block
    const previousBlockHeight = latestBlockHeight - blockHeightDiff;
    const previousBlockResponse = await fetch(
      `${lcdEndpoint}/cosmos/base/tendermint/v1beta1/blocks/${previousBlockHeight}`
    );
    const previousBlockData = await previousBlockResponse.json();

    if (!previousBlockResponse.ok || !previousBlockData.block) {
      throw new Error("Failed to fetch previous block.");
    }

    // Get previous block timestamp
    const previousBlockTime = new Date(
      previousBlockData.block.header.time
    ).getTime();

    // Calculate average block time
    const timeDiff = (latestBlockTime - previousBlockTime) / blockHeightDiff; // Time difference divided by number of blocks
    const averageBlockTimeInSeconds = timeDiff / 1000; // Convert milliseconds to seconds

    return averageBlockTimeInSeconds;
  } catch (error) {
    console.error("Error fetching block time:", error);
    return 0;
  }
}

const fetchValidatorByApr = async () => {
  try {
    const res = await fetchRetry(
      "https://api.scan.orai.io/v1/validators?page_id=1"
    );
    console.log(res, "res");
    if (!res.data) return [];
    return res.data;
  } catch (e) {
    console.log(e, "err for fetch Validator oraichain");
  }
};

async function fetchChainData(chainInfo, validatorAddress) {
  try {
    const [
      totalSupplyResponse,
      paramsResponse,
      inflationResponse,
      validatorInfoResponse,
      blockTimeResponse,
    ] = await Promise.all([
      axios.get(
        `${chainInfo.rest}/cosmos/bank/v1beta1/supply${
          chainInfo.stakeCurrency.coinMinimalDenom === "orai"
            ? ""
            : `/by_denom?denom=${chainInfo.stakeCurrency.coinMinimalDenom}`
        }`
      ),
      axios.get(`${chainInfo.rest}/cosmos/distribution/v1beta1/params`),
      axios.get(`${chainInfo.rest}/cosmos/mint/v1beta1/inflation`),
      API.getValidatorInfo(chainInfo.rest, validatorAddress),
      getBlockTime(chainInfo.rest),
    ]);

    const totalSupply =
      chainInfo.stakeCurrency.coinMinimalDenom === "orai"
        ? totalSupplyResponse.data.supply?.find((s) => s.denom === "orai")
            ?.amount
        : totalSupplyResponse.data?.amount?.amount;

    return {
      totalSupply,
      params: paramsResponse.data?.params,
      inflationRate: inflationResponse.data?.inflation,
      validator: validatorInfoResponse.validator,
      blockTime: blockTimeResponse,
    };
  } catch (error) {
    console.error("Error fetching chain data:", error);
    throw error;
  }
}

export interface AprItemInner {
  apr?: number;
}

export const StakingInfraScreen: FunctionComponent = observer(() => {
  const { chainStore, keyRingStore, appInitStore, modalStore, accountStore } =
    useStore();
  const { colors } = useTheme();
  const styles = styling(colors);
  const [search, setSearch] = useState("");

  const [listAprByChain, setListApr] = useState([
    {
      chainId: ChainIdEnum.Stargaze,
      apr: "13.65",
    },
  ]);

  const fetchAllApr = async () => {
    for (const chainInfo of chainStore.chainInfosInUI.filter(
      (item) =>
        !item.chainName.toLowerCase().includes("test") &&
        item?.networkType === "cosmos"
    )) {
      if (chainInfo.chainId === ChainIdEnum.Oraichain) continue;
      try {
        const response = await simpleFetch<AprItemInner>(
          `${AprByChain}/apr/${chainInfo.chainId}`
        );
        if (!response.data?.apr) continue;
        setListApr((prev) => [
          ...prev,
          {
            chainId: chainInfo.chainId,
            apr: new IntPretty(new Dec(response.data.apr))
              .moveDecimalPointRight(2)
              .maxDecimals(2)
              .toString(),
          },
        ]);
      } catch (error) {
        console.log(error, `error fetch apr for ${chainInfo?.chainId}`);
      }
    }
  };
  const bip44Option = useBIP44Option();
  const account = accountStore.getAccount(chainStore.current.chainId);
  // const calculateAPRByChain = async (chainInfo, validatorAddress) => {
  //   try {
  //     const start = new Date();
  //
  //     const {
  //       totalSupply,
  //       params: { community_tax, base_proposer_reward, bonus_proposer_reward },
  //       inflationRate,
  //       validator,
  //       blockTime
  //     } = await fetchChainData(chainInfo, validatorAddress);
  //
  //     const blocksPerYear = (60 * 60 * 24 * 365) / blockTime;
  //     const totalDelegatedTokens = parseFloat(validator.tokens);
  //     const votingPower = Math.max(valVotingPower, totalDelegatedTokens);
  //
  //     const blockProvision = (parseFloat(inflationRate) * totalSupply) / blocksPerYear;
  //     const voteMultiplier = 1 - community_tax - base_proposer_reward - bonus_proposer_reward;
  //     const valRewardPerBlock = votingPower > 0 ? ((blockProvision * votingPower) / votingPower) * voteMultiplier : 0;
  //
  //     const delegatorsRewardPerBlock = valRewardPerBlock * (1 - validator.commission.commission_rates.rate);
  //     const numBlocksPerDay = blockTime > 0 ? (60 / blockTime) * 60 * 24 : 0;
  //
  //     const delegatorsRewardPerDay = delegatorsRewardPerBlock * numBlocksPerDay;
  //     const apr = (delegatorsRewardPerDay * daysInYears) / totalDelegatedTokens;
  //
  //     const end = new Date() - start;
  //     console.log(end, "end time");
  //     return apr;
  //   } catch (err) {
  //     console.log("error calculateAPRByChain", err);
  //     return 0;
  //   }
  // };
  const getOWalletOraichainAPR = async () => {
    const validators = await fetchValidatorByApr();
    const totalAPR = validators.reduce(
      (sum, validator) => sum + validator.apr,
      0
    );
    const averageAPR = totalAPR / validators.length;
    setListApr((prevApr) => [
      ...prevApr,
      {
        chainId: ChainIdEnum.Oraichain,
        apr: (averageAPR || 0).toFixed(2),
      },
    ]);
  };
  useEffect(() => {
    getOWalletOraichainAPR();
    fetchAllApr();
  }, []);

  const renderOWalletValidators = () => {
    return (
      <View
        style={{
          justifyContent: "center",
          padding: 16,
        }}
      >
        <View>
          <OWText size={15} weight={"600"}>
            {`Native Staking with OWALLET`}
          </OWText>
          <ScrollView
            showsHorizontalScrollIndicator={false}
            horizontal
            contentContainerStyle={{
              flexDirection: "row",
              gap: 16,
            }}
            style={{
              paddingTop: 16,
            }}
          >
            {dataOWalletStake.map((item, index) => {
              const chainInfo = chainStore.getChain(item.chainId);
              const chainAPR =
                listAprByChain.find(
                  (aprItem) => aprItem.chainId === item.chainId
                )?.apr ?? "0.00";
              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    handlePressStake(chainInfo, item.validator);
                  }}
                  style={{
                    backgroundColor: colors["neutral-surface-card"],
                    borderRadius: 16,
                    borderWidth: 2,
                    borderColor: colors["neutral-border-brutal"],
                    width: metrics.screenWidth / 2.25,
                  }}
                >
                  {item.isRecommended && (
                    <View
                      style={{
                        position: "absolute",
                        right: 0,
                        backgroundColor: colors["primary-surface-default"],
                        paddingHorizontal: 15,
                        paddingVertical: 5,
                        borderTopRightRadius: 16,
                        borderBottomLeftRadius: 16,
                      }}
                    >
                      <OWText
                        color={colors["neutral-text-action-on-dark-bg"]}
                        size={10}
                        weight={"500"}
                      >
                        {`Recommended`.toUpperCase()}
                      </OWText>
                    </View>
                  )}
                  <View style={{ padding: 16 }}>
                    <OWIcon
                      type={"images"}
                      size={32}
                      style={{
                        borderRadius: 999,
                        tintColor:
                          item.chainId === ChainIdEnum.Oraichain
                            ? colors["neutral-text-title"]
                            : null,
                      }}
                      source={{
                        uri: chainInfo.stakeCurrency.coinImageUrl,
                      }}
                    />
                    <OWText
                      style={{ marginTop: 12, marginBottom: 8 }}
                      weight={"500"}
                    >
                      Stake {chainInfo.stakeCurrency.coinDenom}
                    </OWText>

                    <OWText
                      color={colors["success-text-body"]}
                      size={16}
                      weight="500"
                    >
                      APR: {chainAPR ?? "0.00"}%
                    </OWText>
                  </View>
                </TouchableOpacity>
              );
            })}

            {/*<TouchableOpacity*/}
            {/*  onPress={() => {*/}
            {/*    const chainInfo = chainStore.getChain(ChainIdEnum.Osmosis);*/}
            {/*    handlePressStake(chainInfo, owalletOsmosisAddress);*/}
            {/*  }}*/}
            {/*  style={{*/}
            {/*    backgroundColor: colors["neutral-surface-card-brutal"],*/}
            {/*    borderRadius: 16,*/}
            {/*    borderWidth: 2,*/}
            {/*    borderColor: colors["neutral-border-brutal"],*/}
            {/*    width: metrics.screenWidth / 2.25,*/}
            {/*  }}*/}
            {/*>*/}
            {/*  <View style={{ padding: 16 }}>*/}
            {/*    <Image*/}
            {/*      style={{*/}
            {/*        width: 32,*/}
            {/*        height: 32,*/}
            {/*      }}*/}
            {/*      source={require("../../../assets/logo/osmosis.png")}*/}
            {/*    />*/}
            {/*    <OWText*/}
            {/*      style={{ marginTop: 12, marginBottom: 8 }}*/}
            {/*      weight={"500"}*/}
            {/*    >*/}
            {/*      Stake OSMO*/}
            {/*    </OWText>*/}

            {/*    <OWText*/}
            {/*      color={colors["success-text-body"]}*/}
            {/*      size={16}*/}
            {/*      weight="500"*/}
            {/*    >*/}
            {/*      APR: {owalletOsmosis ?? "0.00"}%*/}
            {/*    </OWText>*/}
            {/*  </View>*/}
            {/*</TouchableOpacity>*/}
          </ScrollView>
        </View>
      </View>
    );
  };

  const onConfirm = async (item: any) => {
    const { networkType } = chainStore.getChain(item?.chainId);
    const keyDerivation = (() => {
      const keyMain = getKeyDerivationFromAddressType(account.addressType);
      if (networkType === "bitcoin") {
        return keyMain;
      }
      return "44";
    })();
    chainStore.selectChain(item?.chainId);
    await chainStore.saveLastViewChainId();
    appInitStore.selectAllNetworks(false);
    modalStore.close();
    Popup.hide();

    await keyRingStore.setKeyStoreLedgerAddress(
      `${keyDerivation}'/${item.bip44.coinType ?? item.coinType}'/${
        bip44Option.bip44HDPath.account
      }'/${bip44Option.bip44HDPath.change}/${
        bip44Option.bip44HDPath.addressIndex
      }`,
      item?.chainId
    );
  };

  const handleSwitchNetwork = useCallback(async (item) => {
    try {
      if (account.isNanoLedger) {
        if (!item.isAll) {
          Popup.show({
            type: "confirm",
            title: "Switch network!",
            textBody: `You are switching to ${
              COINTYPE_NETWORK[item.bip44.coinType]
            } network. Please confirm that you have ${
              COINTYPE_NETWORK[item.bip44.coinType]
            } App opened before switch network`,
            buttonText: `I have switched ${
              COINTYPE_NETWORK[item.bip44.coinType]
            } App`,
            confirmText: "Cancel",
            okButtonStyle: {
              backgroundColor: colors["orange-800"],
            },
            callback: () => onConfirm(item),
            cancelCallback: () => {
              Popup.hide();
            },
            bounciness: 0,
            duration: 10,
          });
          return;
        } else {
          appInitStore.selectAllNetworks(true);
        }
      } else {
        modalStore.close();
        if (!item.isAll) {
          tracking(`Select ${item?.chainName} Network`);
          chainStore.selectChain(item?.chainId);
          await chainStore.saveLastViewChainId();
          appInitStore.selectAllNetworks(false);
          modalStore.close();
        } else {
          tracking("Select All Network");
          appInitStore.selectAllNetworks(true);
        }
      }
    } catch (error) {
      showToast({
        type: "danger",
        message: JSON.stringify(error),
      });
    }
  }, []);

  const handlePressStake = useCallback(
    (chain, validatorAddress) => {
      handleSwitchNetwork(chain);
      navigate(SCREENS.Delegate, {
        validatorAddress,
      });
    },
    [handleSwitchNetwork]
  );

  const renderNetworkItem = useCallback(
    (chain) => {
      if (chain) {
        const chainAPR =
          listAprByChain.find((item) => item.chainId === chain.chainId)?.apr ??
          "0.00";
        return (
          <TouchableOpacity
            key={chain.chainId}
            onPress={() => {
              handleSwitchNetwork(chain);
            }}
            style={styles.networkItem}
          >
            <View style={[styles.row, styles.aic]}>
              <View style={[styles.row, styles.aic]}>
                <View style={styles.chainIcon}>
                  <Image
                    style={styles.icon}
                    tintColor={
                      chain.stakeCurrency?.coinDenom === "ORAI"
                        ? colors["neutral-text-title"]
                        : null
                    }
                    source={{ uri: chain.stakeCurrency.coinImageUrl }}
                  />
                </View>
                <OWText size={16} weight="600">
                  {chain.chainName}
                </OWText>
              </View>
              <OWText
                size={16}
                weight="500"
                color={colors["success-text-body"]}
              >
                {chainAPR + "%"}
              </OWText>
            </View>
            <View style={styles.borderBottom} />
          </TouchableOpacity>
        );
      }
    },
    [handleSwitchNetwork, colors, listAprByChain]
  );

  const renderNetworks = () => {
    const stakeableChainsInfo = chainStore.chainInfos.filter((chain) => {
      if (
        chain.networkType === "cosmos" &&
        !chain.chainName.toLowerCase().includes("test") &&
        !chain.chainName.toLowerCase().includes("bridge") &&
        !chain.chainName.toLowerCase().includes("kawai") &&
        chain.chainName.toLowerCase().includes(search.toLowerCase())
      )
        return chain;
    });

    return (
      <View>
        <OWBox style={styles.container}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                backgroundColor: colors["neutral-surface-action"],
                height: 40,
                borderRadius: 999,
                width: metrics.screenWidth - 32,
                alignItems: "center",
                paddingHorizontal: 12,
              }}
            >
              <View style={{ paddingRight: 4 }}>
                <OWIcon
                  color={colors["neutral-icon-on-light"]}
                  name="tdesign_search"
                  size={16}
                />
              </View>
              <TextInput
                style={{
                  fontFamily: "SpaceGrotesk-Regular",
                  width: "100%",
                  color: colors["neutral-text-body"],
                }}
                value={search}
                placeholderTextColor={colors["neutral-text-body"]}
                placeholder="Search for a chain"
                onChangeText={(t) => setSearch(t)}
              />
            </View>
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              width: "100%",
              marginTop: 16,
            }}
          >
            <TouchableOpacity onPress={() => {}}>
              <OWText color={colors["neutral-text-body3"]} weight="600">
                {"Network"}
              </OWText>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => {}}>
              <OWText color={colors["neutral-text-body3"]} weight="600">
                {"Est. APR"}
              </OWText>
            </TouchableOpacity>
          </View>
          <View style={{ marginTop: 22 }}>
            {stakeableChainsInfo.map((chain) => {
              return renderNetworkItem(chain);
            })}
          </View>
        </OWBox>
      </View>
    );
  };

  return (
    <View>
      <View
        style={{
          position: "relative",
        }}
      >
        <Image
          style={{
            width: metrics.screenWidth,
            height: metrics.screenHeight / 3,
            position: "absolute",
            top: 0,
          }}
          source={require("../../../assets/image/img-bg.png")}
        />
      </View>
      {renderOWalletValidators()}
      {renderNetworks()}
    </View>
  );
});

const styling = (colors) =>
  StyleSheet.create({
    container: {
      marginTop: spacing["16"],
      borderRadius: 16,
      padding: 16,
      backgroundColor: colors["neutral-surface-card"],
    },
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    aic: {
      alignItems: "center",
    },
    networkItem: {
      marginBottom: 16,
    },
    chainIcon: {
      padding: 8,
      borderRadius: 999,
      backgroundColor: colors["neutral-surface-action"],
      marginRight: 16,
    },
    icon: {
      width: 28,
      height: 28,
      borderRadius: 999,
    },
    borderBottom: {
      backgroundColor: colors["neutral-border-default"],
      width: "100%",
      height: 1,
      marginTop: 16,
    },
  });
