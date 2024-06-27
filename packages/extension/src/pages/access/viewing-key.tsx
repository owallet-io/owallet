import React, { FunctionComponent, useEffect, useMemo } from "react";
import { useInteractionInfo } from "@owallet/hooks";
import { ChainIdHelper } from "@owallet/cosmos";
import classnames from "classnames";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import style from "./style.module.scss";
import { EmptyLayout } from "../../layouts/empty-layout";
import { FormattedMessage } from "react-intl";
import { Text } from "../../components/common/text";
import colors from "../../theme/colors";
import { Button } from "../../components/common/button";

export const Secret20ViewingKeyAccessPage: FunctionComponent = observer(() => {
  const { chainStore, permissionStore } = useStore();

  const waitingPermission =
    permissionStore.waitingSecret20ViewingKeyAccessPermissions.length > 0
      ? permissionStore.waitingSecret20ViewingKeyAccessPermissions[0]
      : undefined;

  const ineractionInfo = useInteractionInfo(() => {
    permissionStore.rejectAll();
  });

  useEffect(() => {
    if (waitingPermission) {
      // XXX: You can only one chain id per the request.
      //      This limit exists on the background service.
      chainStore.selectChain(waitingPermission.data.chainIds[0]);
    }
  }, [chainStore, waitingPermission]);

  const host = useMemo(() => {
    if (waitingPermission) {
      return waitingPermission.data.origins
        .map((origin) => {
          return new URL(origin).host;
        })
        .join(",");
    } else {
      return "";
    }
  }, [waitingPermission]);

  return (
    <EmptyLayout style={{ height: "100%", paddingTop: "80px" }}>
      <div className={style.container}>
        <img
          src={require("assets/images/img_owallet.png")}
          alt="logo"
          style={{ height: "92px", maxWidth: 92, margin: "0 auto" }}
        />
        <h1 className={style.header}>
          <Text size={22} weight={"600"} color={colors["neutral-text-title"]}>
            <FormattedMessage id="access.viewing-key.title" />
          </Text>
        </h1>
        <p className={style.paragraph}>
          <Text
            size={16}
            weight={"600"}
            color={colors["primary-surface-default"]}
          >
            <FormattedMessage
              id="access.viewing-key.paragraph"
              values={{
                host,
                contractAddress: waitingPermission
                  ? waitingPermission.data.contractAddress
                  : "loading...",
                // eslint-disable-next-line react/display-name
                b: (...chunks: any) => <b>{chunks}</b>,
              }}
            />
          </Text>
        </p>
        <div className={style.permission}>
          <FormattedMessage id="access.viewing-key.permission.title" />
        </div>
        <ul>
          <li>
            <FormattedMessage id="access.viewing-key.permission.secret" />
          </li>
        </ul>
        <div style={{ flex: 1 }} />
        <div
          style={{
            flexDirection: "row",
            display: "flex",
            padding: 16,
            paddingTop: 0,
          }}
        >
          <Button
            containerStyle={{ marginRight: 8 }}
            className={classnames(style.button, style.rejectBtn)}
            color={"danger"}
            onClick={async (e) => {
              e.preventDefault();

              if (waitingPermission) {
                await permissionStore.reject(waitingPermission.id);
                if (
                  permissionStore.waitingSecret20ViewingKeyAccessPermissions
                    .length === 0
                ) {
                  if (
                    ineractionInfo.interaction &&
                    !ineractionInfo.interactionInternal
                  ) {
                    window.close();
                  }
                }
              }
            }}
            data-loading={permissionStore.isLoading}
          >
            <FormattedMessage id="access.viewing-key.button.reject" />
          </Button>
          <Button
            className={classnames(style.button, style.approveBtn)}
            onClick={async (e) => {
              e.preventDefault();

              if (waitingPermission) {
                await permissionStore.approve(waitingPermission.id);
                if (
                  permissionStore.waitingSecret20ViewingKeyAccessPermissions
                    .length === 0
                ) {
                  if (
                    ineractionInfo.interaction &&
                    !ineractionInfo.interactionInternal
                  ) {
                    window.close();
                  }
                }
              }
            }}
            disabled={
              !waitingPermission ||
              ChainIdHelper.parse(chainStore.current.chainId).identifier !==
                ChainIdHelper.parse(waitingPermission.data.chainIds[0])
                  .identifier
            }
            data-loading={permissionStore.isLoading}
          >
            <FormattedMessage id="access.viewing-key.button.approve" />
          </Button>
        </div>
      </div>
    </EmptyLayout>
  );
});
