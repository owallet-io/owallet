import React, { FunctionComponent } from "react";

import { observer } from "mobx-react-lite";

import styleDetailsTab from "../details-tab.module.scss";
import { FormattedMessage } from "react-intl";
import { Badge, Label } from "reactstrap";
import classnames from "classnames";
import { MsgRender } from "../details-tab";
import { Bech32Address } from "@owallet/cosmos";
import { formatBalance } from "@owallet/bitcoin";
import { FeeButtons } from "../../../components/form";
import { CoinGeckoPriceStore } from "@owallet/stores";
import { FeeConfig, GasConfig } from "@owallet/hooks";

export const BtcDetailsTab: FunctionComponent<{
  dataSign;
  priceStore: CoinGeckoPriceStore;
  feeConfig: FeeConfig;
  gasConfig: GasConfig;
  intl;
  isNoSetFee: boolean;
}> = observer(
  ({ dataSign, intl, feeConfig, isNoSetFee, gasConfig, priceStore }) => {
    const msgs = dataSign?.data?.data?.msgs;

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
        <div id="signing-messages" className={styleDetailsTab.msgContainer}>
          <MsgRender
            icon={"fas fa-paper-plane"}
            title={intl.formatMessage({
              id: "sign.list.message.cosmos-sdk/MsgSend.title",
            })}
          >
            Send{" "}
            <b>
              {formatBalance({
                balance: Number(msgs?.amount),
                cryptoUnit: "BTC",
                coin: msgs?.selectedCrypto,
              }) || "0 BTC"}
            </b>{" "}
            to{" "}
            <b>
              {msgs?.address && Bech32Address.shortenAddress(msgs?.address, 20)}
            </b>{" "}
            on <b>{msgs?.selectedCrypto}</b>
          </MsgRender>

          <hr />
        </div>
        <React.Fragment>
          <Label for="fee-price" className="form-control-label">
            <FormattedMessage id="sign.info.fee" />
          </Label>
          <div id="fee-price">
            <div className={styleDetailsTab.feePrice}>
              {`≈ ${
                formatBalance({
                  balance: Number(msgs?.totalFee),
                  cryptoUnit: "BTC",
                  coin: msgs?.selectedCrypto,
                }) || "0 BTC"
              }`}
            </div>
          </div>
        </React.Fragment>

        <React.Fragment>
          <Label for="memo" className="form-control-label">
            Message
          </Label>
          <div
            id="memo"
            style={{
              marginBottom: "8px",
              color: msgs?.message ? "#353945" : "#AAAAAA",
              fontSize: 12,
            }}
          >
            <div>
              {msgs?.message
                ? msgs?.message
                : intl.formatMessage({ id: "sign.info.warning.empty-memo" })}
            </div>
          </div>
          {!isNoSetFee && (
            <FeeButtons
              feeConfig={feeConfig}
              gasConfig={gasConfig}
              priceStore={priceStore}
              label={intl.formatMessage({ id: "send.input.fee" })}
              feeSelectLabels={{
                low: intl.formatMessage({ id: "fee-buttons.select.slow" }),
                average: intl.formatMessage({
                  id: "fee-buttons.select.average",
                }),
                high: intl.formatMessage({ id: "fee-buttons.select.fast" }),
              }}
              isGasInput={false}
              gasLabel={intl.formatMessage({ id: "send.input.gas" })}
            />
          )}
        </React.Fragment>
      </div>
    );
  }
);
