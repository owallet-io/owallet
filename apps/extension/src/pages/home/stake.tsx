import React, {
  FunctionComponent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Tooltip } from "reactstrap";
import { useStore } from "../../stores";
import { observer } from "mobx-react-lite";
import styleStake from "./stake.module.scss";
import classnames from "classnames";
import { Dec } from "@owallet/unit";
import { useHistory } from "react-router";
import { FormattedMessage } from "react-intl";
import { ChainIdEnum } from "@owallet/common";
import { Button } from "components/common/button";
import { Text } from "components/common/text";
import colors from "theme/colors";
import { toast } from "react-toastify";
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

export const StakeView: FunctionComponent = observer(() => {
  const history = useHistory();
  const { chainStore, accountStore, queriesStore, analyticsStore, priceStore } =
    useStore();
  const chainId = chainStore.isAllNetwork
    ? ChainIdEnum.Oraichain
    : chainStore.current.chainId;
  const accountInfo = accountStore.getAccount(chainId);
  const queries = queriesStore.get(chainId);

  const rewards = queries.cosmos.queryRewards.getQueryBech32Address(
    accountInfo.bech32Address
  );
  const stakableReward = rewards.stakableReward;
  const totalStakingReward = priceStore.calculatePrice(stakableReward);
  const queryDelegated = queries.cosmos.queryDelegations.getQueryBech32Address(
    accountInfo.bech32Address
  );
  const delegated = queryDelegated.total;
  const totalPrice = priceStore.calculatePrice(delegated);
  const isRewardExist = rewards.rewards.length > 0;

  const withdrawAllRewards = async () => {
    if (accountInfo.isReadyToSendMsgs) {
      try {
        // When the user delegated too many validators,
        // it can't be sent to withdraw rewards from all validators due to the block gas limit.
        // So, to prevent this problem, just send the msgs up to 8.
        await accountInfo.cosmos.sendWithdrawDelegationRewardMsgs(
          rewards.getDescendingPendingRewardValidatorAddresses(8),
          "",
          undefined,
          undefined,
          {
            onBroadcasted: () => {
              analyticsStore.logEvent("Claim reward tx broadcasted", {
                chainId: chainId,
                chainName: chainStore.current.chainName,
              });
            },
            onFulfill: (tx) => {
              console.log(tx, "TX INFO ON CLAIM PAGE!!!!!!!!!!!!!!!!!!!!!");
            },
          },
          stakableReward.currency.coinMinimalDenom
        );
        history.push("/");

        toast(`Success`, {
          type: "success",
        });
      } catch (e) {
        history.push("/");
        toast(`Fail to withdraw rewards: ${e.message}`, {
          type: "error",
        });
      }
    }
  };

  return (
    <div className={classnames(styleStake.containerStakeCard)}>
      <div className={classnames(styleStake.containerInner, styleStake.reward)}>
        <div className={styleStake.vertical}>
          <p
            className={classnames(
              "h4",
              "my-0",
              "font-weight-normal",
              styleStake.paragraphSub
            )}
          >
            <Text size={14} weight="600">
              <FormattedMessage id="main.stake.message.pending-staking-reward" />
            </Text>
          </p>
          <Text color={colors["success-text-body"]} weight="500" size={28}>
            +
            {totalStakingReward
              ? totalStakingReward.toString()
              : stakableReward.shrink(true).maxDecimals(6).toString()}
          </Text>
          <Text>
            {stakableReward.toDec().gt(new Dec(0.001))
              ? stakableReward
                  .shrink(true)
                  .maxDecimals(6)
                  .trim(true)
                  .upperCase(true)
                  .toString()
              : `< 0.001 ${stakableReward.toCoin().denom.toUpperCase()}`}
            {rewards.isFetching ? (
              <span>
                <i className="fas fa-spinner fa-spin" />
              </span>
            ) : null}
          </Text>
        </div>
        <Button
          containerStyle={{ height: 32 }}
          size="small"
          className={styleStake.button}
          disabled={!isRewardExist || !accountInfo.isReadyToSendMsgs}
          onClick={withdrawAllRewards}
          data-loading={accountInfo.isSendingMsg === "withdrawRewards"}
        >
          <div style={{ paddingLeft: 12, paddingRight: 12 }}>
            <Text
              size={14}
              weight="500"
              color={colors["neutral-text-action-on-dark-bg"]}
            >
              <FormattedMessage id="main.stake.button.claim-rewards" />
            </Text>
          </div>
        </Button>
      </div>
      <div
        style={{
          backgroundColor: colors["primary-surface-subtle"],
          marginTop: 6,
          borderRadius: 16,
          paddingLeft: 12,
          paddingRight: 12,
          paddingTop: 8,
          paddingBottom: 8,
          flexDirection: "row",
          justifyContent: "space-between",
          display: "flex",
        }}
      >
        <Text weight="500" color={colors["neutral-text-action-on-light-bg"]}>
          Staked:{" "}
          {totalPrice
            ? totalPrice.toString()
            : delegated.shrink(true).maxDecimals(6).toString()}
        </Text>
        <Text weight="500" color={colors["neutral-text-action-on-light-bg"]}>
          {delegated
            .shrink(true)
            .maxDecimals(6)
            .trim(true)
            .upperCase(true)
            .toString()}
        </Text>
      </div>
      <LinkStakeView />
    </div>
  );
});

export const LinkStakeView: FunctionComponent = observer(() => {
  const { chainStore, accountStore, queriesStore } = useStore();
  const chainId = chainStore.isAllNetwork
    ? ChainIdEnum.Oraichain
    : chainStore.current.chainId;
  const queries = queriesStore.get(chainId);
  const chainInfo = chainStore.getChain(chainId);
  const accountInfo = accountStore.getAccount(chainId);
  const inflation = queries.cosmos.queryInflation;
  const stakable = queries.queryBalances.getQueryBech32Address(
    accountInfo.bech32Address
  ).stakable;
  const stakeBtnRef = useRef<HTMLButtonElement>(null);
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const toggleTooltip = () => setTooltipOpen((value) => !value);
  const isStakableExist = useMemo(() => {
    return stakable?.balance.toDec().gt(new Dec(0));
  }, [stakable?.balance]);

  const [owalletOraichain, setOwalletOraichain] = useState("0");
  const [owalletOsmosis, setOwalletOsmosis] = useState("0");

  const calculateAPRByChain = async (chainInfo, validatorAddress) => {
    try {
      const totalSupply = await getTotalSupply(chainInfo);
      const { community_tax, base_proposer_reward, bonus_proposer_reward } =
        await getParamsFromLcd(chainInfo.rest);
      const inflationRate = await getInflationRate(chainInfo.rest);
      const res = await axios.get(
        `${chainInfo.rest}/cosmos/staking/v1beta1/validators/${validatorAddress}`
      );
      const validator = res?.data.validator;

      const blockTime = await getBlockTime(chainInfo.rest);

      const blocksPerYear = (60 * 60 * 24 * 365) / blockTime;

      let votingPower = valVotingPower;
      const totalDelegatedTokens = parseFloat(validator.tokens);

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

      const delegatorsRewardPerBlock =
        valRewardPerBlock * (1 - validator.commission.commission_rates.rate);
      const numBlocksPerDay = blockTime > 0 ? (60 / blockTime) * 60 * 24 : 0;

      const delegatorsRewardPerDay = delegatorsRewardPerBlock * numBlocksPerDay;
      const apr = (delegatorsRewardPerDay * daysInYears) / totalDelegatedTokens;

      return apr;
    } catch (err) {
      console.log("error calculateAPRByChain", err);
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
        "Error fgetOWalletOsmosisAPR:",
        `https://www.datalenses.zone/numia/osmosis/lenses/apr?start_date=${pastDate.format(
          "YYYY-MM-DD"
        )}&end_date=${moment().format("YYYY-MM-DD")}`,
        error
      );
    }
  };

  useEffect(() => {
    if (chainStore.current.chainId === ChainIdEnum.Oraichain) {
      getOWalletOraichainAPR();
    }

    if (chainStore.current.chainId === ChainIdEnum.Osmosis) {
      getOWalletOsmosisAPR();
    }
  }, [chainStore.current.chainId]);

  const renderAPR = () => {
    if (
      chainStore.current.chainId === ChainIdEnum.Oraichain ||
      chainStore.current.chainId === ChainIdEnum.Osmosis
    ) {
      return (
        <p
          className={classnames(
            "h4",
            "my-0",
            "font-weight-normal",
            styleStake.paragraphSub
          )}
        >
          <Text>
            <FormattedMessage
              id="main.stake.message.earning"
              values={{
                apr: (
                  <React.Fragment>
                    {chainStore.current.chainId === ChainIdEnum.Oraichain
                      ? owalletOraichain
                      : owalletOsmosis}
                    {inflation.isFetching ? (
                      <span>
                        <i className="fas fa-spinner fa-spin" />
                      </span>
                    ) : null}
                  </React.Fragment>
                ),
              }}
            />
          </Text>
        </p>
      );
    }
  };

  return (
    <div
      style={{
        flexDirection: "row",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        paddingTop: 8,
      }}
    >
      <div className={styleStake.vertical}>{renderAPR()}</div>
      <div style={{ flex: 1 }} />
      <div
        onClick={(e) => {
          if (chainId === ChainIdEnum.Oraichain) {
            window.open(
              "https://scanium.io/Oraichain/staking/oraivaloper1q53ujvvrcd0t543dsh5445lu6ar0qr2zv4yhhp"
            );
          } else if (chainId === ChainIdEnum.Osmosis) {
            window.open(
              "https://www.mintscan.io/osmosis/validators/osmovaloper1zqevmn000unnjj709akc8p86f9jc4xevf8f8g3"
            );
          } else {
            const pttrn = /^(https?:\/\/)?(www\.)?([^\/]+)/gm;
            const urlInfo = pttrn.exec(chainInfo.raw.txExplorer.txUrl);
            window.open(
              urlInfo && urlInfo[0] ? urlInfo[0] : "https://scanium.io//"
            );
          }
        }}
      >
        <span
          aria-disabled={!isStakableExist}
          ref={stakeBtnRef}
          style={{
            cursor: "pointer",
            textDecoration: "underline",
            fontSize: 14,
            fontWeight: 500,
            color: colors["primary-surface-pressed"],
          }}
        >
          <FormattedMessage id="main.stake.button.link-stake" />
        </span>
        {!isStakableExist ? (
          <Tooltip
            placement="bottom"
            isOpen={tooltipOpen}
            target={stakeBtnRef}
            toggle={toggleTooltip}
            fade
          >
            <FormattedMessage id="main.stake.tooltip.no-asset" />
          </Tooltip>
        ) : null}
      </div>
    </div>
  );
});
