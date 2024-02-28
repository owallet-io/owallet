import React, { FunctionComponent } from "react";

import { observer } from "mobx-react-lite";

import styleDetailsTab from "../details-tab.module.scss";
import { FormattedMessage } from "react-intl";
import { Badge, Label } from "reactstrap";
import classnames from "classnames";
export const TronDetailsTab: FunctionComponent<{ dataSign; intl }> = observer(
  ({ dataSign, intl }) => {
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
          <React.Fragment>
            {dataSign?.data?.currency && (
              <MsgRender
                icon={"fas fa-paper-plane"}
                title={intl.formatMessage({
                  id: "sign.list.message.cosmos-sdk/MsgSend.title",
                })}
              >
                <FormattedMessage
                  id="sign.list.message.cosmos-sdk/MsgSend.content"
                  values={{
                    b: (...chunks: any[]) => <b>{chunks}</b>,
                    recipient: dataSign?.data?.recipient,
                    amount:
                      dataSign?.data?.amount +
                      " " +
                      dataSign?.data?.currency?.coinDenom,
                  }}
                />
              </MsgRender>
            )}
            {!dataSign?.data?.currency && (
              <div style={{ width: 375 }}>{JSON.stringify(dataSign, null)}</div>
            )}

            <hr />
          </React.Fragment>
        </div>
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
