import React, { FunctionComponent, useMemo, useRef, useState } from "react";
import { Tooltip } from "reactstrap";
import { useStore } from "../../stores";
import { observer } from "mobx-react-lite";
import styleStake from "./stake.module.scss";
import classnames from "classnames";
import { Dec } from "@owallet/unit";
import { useNotification } from "../../components/notification";
import { useHistory } from "react-router";
import { FormattedMessage } from "react-intl";
import { ChainIdEnum } from "@owallet/common";
import { Button } from "components/common/button";
import { Text } from "components/common/text";
import colors from "theme/colors";

export const StakeView: FunctionComponent = observer(() => {
  const history = useHistory();
  const { chainStore, accountStore, queriesStore, analyticsStore } = useStore();
  const chainId = chainStore.isAllNetwork
    ? ChainIdEnum.Oraichain
    : chainStore.current.chainId;
  const accountInfo = accountStore.getAccount(chainId);
  const queries = queriesStore.get(chainId);

  const notification = useNotification();

  const rewards = queries.cosmos.queryRewards.getQueryBech32Address(
    accountInfo.bech32Address
  );
  const stakableReward = rewards.stakableReward;

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
        notification.push({
          type: "success",
          placement: "top-center",
          duration: 5,
          content: `Success`,
          canDelete: true,
          transition: {
            duration: 0.25,
          },
        });
      } catch (e) {
        history.push("/");
        notification.push({
          type: "warning",
          placement: "top-center",
          duration: 5,
          content: `Fail to withdraw rewards: ${e.message}`,
          canDelete: true,
          transition: {
            duration: 0.25,
          },
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
          <p
            className={classnames(
              "h2",
              "my-0",
              "font-weight-normal",
              styleStake.paragraphMain
            )}
          >
            {stakableReward?.shrink(true).maxDecimals(6).toString()}
            {rewards.isFetching ? (
              <span>
                <i className="fas fa-spinner fa-spin" />
              </span>
            ) : null}
          </p>
        </div>
        <div style={{ flex: 1 }} />
        <Button
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
      <div className={styleStake.vertical}>
        {inflation.inflation.toDec().equals(new Dec(0)) ? null : (
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
                      {inflation.inflation.trim(true).maxDecimals(2).toString()}
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
        )}
      </div>
      <div style={{ flex: 1 }} />
      <div
        onClick={(e) => {
          const pttrn = /^(https?:\/\/)?(www\.)?([^\/]+)/gm;
          const urlInfo = pttrn.exec(chainInfo.raw.txExplorer.txUrl);
          window.open(
            urlInfo && urlInfo[0] ? urlInfo[0] : "https://scan.orai.io/"
          );
          // if (!isStakableExist) {
          //   e.preventDefault();
          // } else {
          //   // history.push('/stake/validator-list');
          //   // analyticsStore.logEvent('Stake button clicked', {
          //   //   chainId: chainId,
          //   //   chainName: chainStore.current.chainName
          //   // });
          //   const pttrn = /^(https?:\/\/)?(www\.)?([^\/]+)/gm;
          //   const urlInfo = pttrn.exec(chainInfo.raw.txExplorer.txUrl);
          //   window.open(
          //     urlInfo && urlInfo[0] ? urlInfo[0] : 'https://scan.orai.io/'
          //   );
          // }
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
