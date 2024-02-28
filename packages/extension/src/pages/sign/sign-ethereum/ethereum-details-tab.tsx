import React, { FunctionComponent } from "react";

import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores";

import styleDetailsTab from "../details-tab.module.scss";

import { renderAminoMessage } from "../amino";
import { Msg } from "@cosmjs/launchpad";
import { FormattedMessage, useIntl } from "react-intl";
import { FeeButtons, GasInput, MemoInput } from "../../../components/form";
import {
  IFeeConfig,
  IFeeEthereumConfig,
  IGasConfig,
  IMemoConfig,
} from "@owallet/hooks";
import { useLanguage } from "@owallet/common";
import { Badge, Button, Label } from "reactstrap";
import { FeeInput } from "../../../components/form/fee-input";
import { GasEthereumInput } from "../../../components/form/gas-ethereum-input";
import classnames from "classnames";

export const EthereumDetailsTab: FunctionComponent<{
  dataSign: any;
  // signDocHelper: SignDocHelper;
  memoConfig: IMemoConfig;
  feeConfig: IFeeEthereumConfig;
  gasConfig: IGasConfig;
  gasPrice: string;
  decimals: number;

  isInternal: boolean;

  preferNoSetFee: boolean;
  preferNoSetMemo: boolean;
}> = observer(
  ({
    dataSign,
    // signDocHelper,
    memoConfig,
    feeConfig,
    gasConfig,
    gasPrice,
    decimals,
    isInternal,
    preferNoSetFee,
    preferNoSetMemo,
  }) => {
    const { chainStore, priceStore, accountStore } = useStore();
    const intl = useIntl();

    return (
      <div className={styleDetailsTab.container}>
        <Label
          for="signing-messages"
          className="form-control-label"
          style={{ display: "flex" }}
        >
          <FormattedMessage id="sign.list.messages.label" />
          <Badge className={classnames("ml-2", styleDetailsTab.msgsBadge)}>
            {JSON.stringify(dataSign).length}
          </Badge>
        </Label>
        <div
          id="signing-messages"
          style={{
            overflow: "auto",
            height: 80,
          }}
          className={styleDetailsTab.msgContainer}
        >
          {JSON.stringify(dataSign, null, 2)}
        </div>
        {!preferNoSetMemo ? (
          <MemoInput
            memoConfig={memoConfig}
            label={intl.formatMessage({ id: "sign.info.memo" })}
            rows={1}
          />
        ) : (
          <React.Fragment>
            <Label for="memo" className="form-control-label">
              <FormattedMessage id="sign.info.memo" />
            </Label>
            <div id="memo" style={{ marginBottom: "8px" }}>
              <div style={{ color: memoConfig.memo ? undefined : "#AAAAAA" }}>
                {memoConfig.memo
                  ? memoConfig.memo
                  : intl.formatMessage({ id: "sign.info.warning.empty-memo" })}
              </div>
            </div>
          </React.Fragment>
        )}
        <GasEthereumInput
          label={intl.formatMessage({ id: "sign.info.gas" })}
          gasConfig={gasConfig}
          // defaultValue={
          //   parseInt(dataSign?.data?.data?.data?.estimatedGasLimit) || 0
          // }
        />
        <FeeInput
          label={intl.formatMessage({ id: "sign.info.fee" })}
          gasConfig={gasConfig}
          feeConfig={feeConfig}
          gasPrice={gasPrice}
          decimals={decimals}
          denom={chainStore?.current?.stakeCurrency?.coinDenom}
          // defaultValue={
          //   parseInt(dataSign?.data?.data?.data?.estimatedGasLimit, 16) *
          //     parseInt(dataSign?.data?.data?.data?.estimatedGasPrice, 16) || 0
          // }
        />
      </div>
    );
  }
);

export const MsgRender: FunctionComponent<{
  icon?: string;
  title: string;
}> = ({ icon = "fas fa-question", title, children }) => {
  return (
    <div className={styleDetailsTab.msg}>
      <div className={styleDetailsTab.icon}>
        <div style={{ height: "2px" }} />
        <i className={icon} />
        <div style={{ flex: 1 }} />
      </div>
      <div className={styleDetailsTab.contentContainer}>
        <div className={styleDetailsTab.contentTitle}>{title}</div>
        <div className={styleDetailsTab.content}>{children}</div>
      </div>
    </div>
  );
};
