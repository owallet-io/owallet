import React, {
  FunctionComponent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import style from "../style.module.scss";
import { observer } from "mobx-react-lite";
import classnames from "classnames";
import { FormattedMessage, useIntl } from "react-intl";
import { Button } from "reactstrap";
import { useStore } from "../../../stores";
import { BtcDataTab } from "./btc-data-tab";
import { BtcDetailsTab } from "./btc-details-tab";
import { useInteractionInfo } from "@owallet/hooks";
import { useHistory } from "react-router";

enum Tab {
  Details,
  Data,
}

export const SignBtcPage: FunctionComponent = observer(() => {
  const intl = useIntl();
  const [tab, setTab] = useState<Tab>(Tab.Details);
  const {
    chainStore,
    keyRingStore,
    signInteractionStore,
    accountStore,
    queriesStore,
  } = useStore();
  const history = useHistory();
  const interactionInfo = useInteractionInfo(() => {
    signInteractionStore.rejectAll();
  });
  const [dataSign, setDataSign] = useState(null);

  useEffect(() => {
    if (dataSign) return;

    if (signInteractionStore.waitingBitcoinData) {
      setDataSign(signInteractionStore.waitingBitcoinData);
    }
  }, [signInteractionStore.waitingBitcoinData]);

  return (
    <div
      style={{
        padding: 20,
        backgroundColor: "#FFFFFF",
        height: "100%",
        overflowX: "auto",
      }}
    >
      {
        <div className={style.container}>
          <div
            style={{
              color: "#353945",
              fontSize: 24,
              fontWeight: 500,
              textAlign: "center",
              paddingBottom: 24,
            }}
          >
            Bitcoin Network
          </div>
          <div className={classnames(style.tabs)}>
            <ul>
              <li className={classnames({ activeTabs: tab === Tab.Details })}>
                <a
                  className={classnames(style.tab, {
                    activeText: tab === Tab.Details,
                  })}
                  onClick={() => {
                    setTab(Tab.Details);
                  }}
                >
                  {intl.formatMessage({
                    id: "sign.tab.details",
                  })}
                </a>
              </li>
              <li className={classnames({ activeTabs: tab === Tab.Data })}>
                <a
                  className={classnames(style.tab, {
                    activeText: tab === Tab.Data,
                  })}
                  onClick={() => {
                    setTab(Tab.Data);
                  }}
                >
                  {intl.formatMessage({
                    id: "sign.tab.data",
                  })}
                </a>
              </li>
            </ul>
          </div>
          <div
            className={classnames(style.tabContainer, {
              [style.dataTab]: tab === Tab.Data,
            })}
          >
            {tab === Tab.Data && <BtcDataTab data={dataSign} />}
            {tab === Tab.Details && (
              <BtcDetailsTab intl={intl} dataSign={dataSign} />
            )}
          </div>
          <div style={{ flex: 1 }} />
          <div className={style.buttons}>
            {keyRingStore.keyRingType === "ledger" &&
            signInteractionStore.isLoading ? (
              <Button className={style.button} disabled={true} outline>
                <FormattedMessage id="sign.button.confirm-ledger" />{" "}
                <i className="fa fa-spinner fa-spin fa-fw" />
              </Button>
            ) : (
              <>
                <Button
                  className={classnames(style.button, style.rejectBtn)}
                  color=""
                  onClick={async (e) => {
                    e.preventDefault();

                    await signInteractionStore.reject();
                    if (
                      interactionInfo.interaction &&
                      !interactionInfo.interactionInternal
                    ) {
                      window.close();
                    }
                    history.goBack();
                  }}
                  outline
                >
                  {intl.formatMessage({
                    id: "sign.button.reject",
                  })}
                </Button>
                <Button
                  className={classnames(style.button, style.approveBtn)}
                  color=""
                  disabled={false}
                  data-loading={signInteractionStore.isLoading}
                  onClick={async (e) => {
                    e.preventDefault();

                    //@ts-ignore
                    await signInteractionStore.approveBitcoinAndWaitEnd();

                    if (
                      interactionInfo.interaction &&
                      !interactionInfo.interactionInternal
                    ) {
                      window.close();
                    }
                    history.goBack();
                  }}
                >
                  {intl.formatMessage({
                    id: "sign.button.approve",
                  })}
                </Button>
              </>
            )}
          </div>
        </div>
      }
    </div>
  );
});
