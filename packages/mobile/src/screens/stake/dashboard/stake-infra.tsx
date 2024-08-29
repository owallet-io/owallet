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
import { ChainIdEnum } from "@owallet/common";
import axios from "axios";
import moment from "moment";

const owalletOraichainAddress =
  "oraivaloper1q53ujvvrcd0t543dsh5445lu6ar0qr2zv4yhhp";
const owalletOsmosisAddress =
  "osmovaloper1zqevmn000unnjj709akc8p86f9jc4xevf8f8g3";

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

async function getParamsFromLcd(lcdEndpoint) {
  try {
    const params = await axios.get(
      `${lcdEndpoint}/cosmos/distribution/v1beta1/params`
    );
    return params?.data?.params;
  } catch (error) {
    console.error(
      "Error fetching validator getParamsFromLcd:",
      `${lcdEndpoint}/cosmos/distribution/v1beta1/params`,
      error
    );
    return {};
  }
}

async function getTotalSupply(chainInfo) {
  try {
    if (chainInfo.stakeCurrency.coinMinimalDenom === "orai") {
      const totalSupply = await axios.get(
        `${chainInfo.rest}/cosmos/bank/v1beta1/supply`
      );
      const supply = totalSupply.data.supply?.find((s) => s.denom === "orai");

      return supply?.amount;
    } else {
      const totalSupply = await axios.get(
        `${chainInfo.rest}/cosmos/bank/v1beta1/supply/by_denom?denom=${chainInfo.stakeCurrency.coinMinimalDenom}`
      );

      return totalSupply?.data?.amount.amount;
    }
  } catch (error) {
    console.error(
      "Error fetching validator getTotalSupply:",
      `${chainInfo.rest}/cosmos/bank/v1beta1/supply`,
      error
    );
    return 0;
  }
}

async function getInflationRate(lcdEndpoint) {
  try {
    const inflation = await axios.get(
      `${lcdEndpoint}/cosmos/mint/v1beta1/inflation`
    );

    return inflation?.data?.inflation;
  } catch (error) {
    console.error(
      "Error fetching validator getInflationRate:",
      `${lcdEndpoint}/cosmos/mint/v1beta1/inflation`,
      error
    );
    return 0;
  }
}

export const StakingInfraScreen: FunctionComponent = observer(() => {
  const { chainStore } = useStore();
  const { colors } = useTheme();
  const styles = styling(colors);
  const [search, setSearch] = useState("");
  const [owalletOraichain, setOwalletOraichain] = useState("0");
  const [owalletOsmosis, setOwalletOsmosis] = useState("0");
  const [listAprByChain, setListApr] = useState([]);

  const calculateAPRByChain = async (chainInfo, validatorAddress) => {
    try {
      const totalSupply = await getTotalSupply(chainInfo);
      const { community_tax, base_proposer_reward, bonus_proposer_reward } =
        await getParamsFromLcd(chainInfo.rest);
      const inflationRate = await getInflationRate(chainInfo.rest);
      const res = await API.getValidatorInfo(chainInfo.rest, validatorAddress);
      const validator = res.validator;

      const blockTime = await getBlockTime(chainInfo.rest);

      const blocksPerYear = (60 * 60 * 24 * 365) / blockTime;
      //   console.log("validator", validator);
      //   console.log("blockTime", blockTime);
      //   console.log("blocksPerYear", blocksPerYear);
      //   console.log("inflationRate", parseFloat(inflationRate));
      //   console.log(
      //     "community_tax - base_proposer_reward - bonus_proposer_reward",
      //     community_tax,
      //     base_proposer_reward,
      //     bonus_proposer_reward
      //   );

      let votingPower = valVotingPower;
      const totalDelegatedTokens = parseFloat(validator.tokens);
      //   console.log("totalDelegatedTokens", totalDelegatedTokens);

      if (totalDelegatedTokens > 0) {
        votingPower = totalDelegatedTokens;
      }

      const blockProvision =
        (parseFloat(inflationRate) * totalSupply) / blocksPerYear;
      const voteMultiplier =
        1 - community_tax - base_proposer_reward - bonus_proposer_reward;
      const valRewardPerBlock =
        votingPower > 0
          ? ((blockProvision * votingPower) / votingPower) * voteMultiplier
          : 0;

      //   console.log("valRewardPerBlock", valRewardPerBlock);

      const delegatorsRewardPerBlock =
        valRewardPerBlock * (1 - validator.commission.commission_rates.rate);
      const numBlocksPerDay = blockTime > 0 ? (60 / blockTime) * 60 * 24 : 0;

      //   console.log("numBlocksPerDay", numBlocksPerDay);

      const delegatorsRewardPerDay = delegatorsRewardPerBlock * numBlocksPerDay;
      const apr = (delegatorsRewardPerDay * daysInYears) / totalDelegatedTokens;

      //   console.log("apr", chainInfo.chainName, apr);

      return apr;
    } catch (err) {
      console.log("error getOWalletOraichain", err);
      return 0;
    }
  };

  const getOWalletOraichainAPR = async () => {
    const chainInfo = chainStore.getChain(ChainIdEnum.Oraichain);
    const apr = await calculateAPRByChain(chainInfo, owalletOraichainAddress);
    setOwalletOraichain(apr.toFixed(2));
  };

  const getOWalletOsmosisAPR = async () => {
    const currentDate = moment();
    // Subtract 10 days from the current date
    const pastDate = currentDate.subtract(10, "days");

    try {
      const params = await axios.get(
        `https://www.datalenses.zone/numia/osmosis/lenses/apr?start_date=${pastDate.format(
          "YYYY-MM-DD"
        )}&end_date=${moment().format("YYYY-MM-DD")}`
      );

      if (params?.data?.length > 0) {
        setOwalletOsmosis(params.data[0].total?.toFixed(2));
      }
    } catch (error) {
      console.error(
        "Error fetching validator getParamsFromLcd:",
        `https://www.datalenses.zone/numia/osmosis/lenses/apr?start_date=${pastDate.format(
          "YYYY-MM-DD"
        )}&end_date=${moment().format("YYYY-MM-DD")}`,
        error
      );
    }
  };

  async function processListAPR() {
    const stakeableChainsInfo = chainStore.chainInfos.filter((chain) => {
      if (
        chain.networkType === "cosmos" &&
        !chain.chainName.toLowerCase().includes("test") &&
        !chain.chainName.toLowerCase().includes("bridge")
      )
        return chain;
    });

    const results = await Promise.all(
      stakeableChainsInfo.map(async (chain) => {
        if (
          chain.chainId !== ChainIdEnum.Oraichain &&
          chain.chainId !== ChainIdEnum.Osmosis
        ) {
          const firstValidator = await API.getFirstValidator(chain.rest);
          if (firstValidator) {
            const apr = await calculateAPRByChain(
              chain,
              firstValidator.operator_address
            );
            return {
              chainId: chain.chainId,
              apr: apr,
            };
          }
        }
      })
    );

    return results;
  }

  const getListAPR = async () => {
    const listAPR = await processListAPR();
    setListApr(listAPR);
  };

  useEffect(() => {
    getOWalletOraichainAPR();
    getOWalletOsmosisAPR();
    getListAPR();
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
          <View
            style={{
              paddingTop: 16,
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <TouchableOpacity
              style={{
                backgroundColor: colors["neutral-surface-card-brutal"],
                borderRadius: 16,
                borderWidth: 2,
                borderColor: colors["neutral-border-brutal"],
                width: metrics.screenWidth / 2.25,
              }}
            >
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
              <View style={{ padding: 16 }}>
                <Image
                  style={{
                    width: 32,
                    height: 32,
                  }}
                  source={require("../../../assets/logo/oraichain.png")}
                />
                <OWText
                  style={{ marginTop: 12, marginBottom: 8 }}
                  weight={"500"}
                >
                  Stake ORAI
                </OWText>

                <OWText
                  color={colors["success-text-body"]}
                  size={16}
                  weight="500"
                >
                  APR: {owalletOraichain ?? "0"}%
                </OWText>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                backgroundColor: colors["neutral-surface-card-brutal"],
                borderRadius: 16,
                borderWidth: 2,
                borderColor: colors["neutral-border-brutal"],
                width: metrics.screenWidth / 2.25,
              }}
            >
              <View style={{ padding: 16 }}>
                <Image
                  style={{
                    width: 32,
                    height: 32,
                  }}
                  source={require("../../../assets/logo/osmosis.png")}
                />
                <OWText
                  style={{ marginTop: 12, marginBottom: 8 }}
                  weight={"500"}
                >
                  Stake OSMO
                </OWText>

                <OWText
                  color={colors["success-text-body"]}
                  size={16}
                  weight="500"
                >
                  APR: {owalletOsmosis ?? "0"}%
                </OWText>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const renderNetworkItem = useCallback(
    (chain) => {
      if (chain) {
        let chainAPR;

        if (chain.chainId === ChainIdEnum.Oraichain)
          chainAPR = owalletOraichain;
        if (chain.chainId === ChainIdEnum.Osmosis) chainAPR = owalletOsmosis;

        return (
          <TouchableOpacity style={styles.networkItem}>
            <View style={[styles.row, styles.aic]}>
              <View style={[styles.row, styles.aic]}>
                <View style={styles.chainIcon}>
                  <Image
                    style={styles.icon}
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
                {/* {chainAPR && Number(chainAPR) > 0 ? chainAPR + "%" : ""} */}
              </OWText>
            </View>
            <View style={styles.borderBottom} />
          </TouchableOpacity>
        );
      }
    },
    [listAprByChain]
  );

  const renderNetworks = () => {
    const stakeableChainsInfo = chainStore.chainInfos.filter((chain) => {
      if (
        chain.networkType === "cosmos" &&
        !chain.chainName.toLowerCase().includes("test") &&
        !chain.chainName.toLowerCase().includes("bridge") &&
        chain.chainName.toLowerCase().includes(search.toLowerCase())
      )
        return chain;
    });

    return (
      <View>
        <View style={styles.container}>
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
          {/* <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              width: "100%",
              marginTop: 16
            }}
          >
            <TouchableOpacity onPress={() => {}}>
              <OWText color={colors["neutral-text-body3"]} weight="600">
                {"Network"}
              </OWText>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => {}}>
              <OWText color={colors["neutral-text-body3"]} weight="600">
                {"Max APR"}
              </OWText>
            </TouchableOpacity>
          </View> */}
          <View style={{ marginTop: 22 }}>
            {stakeableChainsInfo.map((chain) => {
              return renderNetworkItem(chain);
            })}
          </View>
        </View>
      </View>
    );
  };

  console.log("search", typeof search, search);

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
      backgroundColor: colors["neutral-surface-card"],
      marginTop: spacing["16"],
      borderRadius: 16,
      padding: 16,
      justifyContent: "center",
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
    },
    borderBottom: {
      backgroundColor: colors["neutral-border-default"],
      width: "100%",
      height: 1,
      marginTop: 16,
    },
  });
