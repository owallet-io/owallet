import React, { FunctionComponent, useMemo } from "react";
import { useInteractionInfo } from "@owallet/hooks";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import style from "./style.module.scss";
import { EmptyLayout } from "../../layouts/empty-layout";
import { FormattedMessage } from "react-intl";
import classnames from "classnames";
import { Button } from "../../components/common/button";
import { Text } from "../../components/common/text";
import colors from "../../theme/colors";

export const AccessPage: FunctionComponent = observer(() => {
  const { chainStore, permissionStore } = useStore();

  const waitingPermission =
    permissionStore.waitingBasicAccessPermissions.length > 0
      ? permissionStore.waitingBasicAccessPermissions[0]
      : undefined;

  console.log(
    "waitingBasicAccessPermissions",
    permissionStore.waitingBasicAccessPermissions
  );

  const ineractionInfo = useInteractionInfo(() => {
    permissionStore.rejectAll();
  });

  const isSecretWasmIncluded = useMemo(() => {
    if (waitingPermission) {
      for (const chainId of waitingPermission.data.chainIds) {
        if (chainStore.hasChain(chainId)) {
          const chainInfo = chainStore.getChain(chainId);
          if (chainInfo.features && chainInfo.features.includes("secretwasm")) {
            return true;
          }
        }
      }
    }
    return false;
  }, [chainStore, waitingPermission]);

  const host = useMemo(() => {
    if (waitingPermission) {
      return waitingPermission.data.origins
        .map((origin) => {
          return new URL(origin).host;
        })
        .join(", ");
    } else {
      return "";
    }
  }, [waitingPermission]);

  const chainIds = useMemo(() => {
    if (!waitingPermission) {
      return "";
    }

    return waitingPermission.data.chainIds.join(", ");
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
            <FormattedMessage id="access.title" />
          </Text>
        </h1>
        <p className={style.paragraph}>
          <Text
            size={16}
            weight={"600"}
            color={colors["primary-surface-default"]}
          >
            <FormattedMessage
              id="access.paragraph"
              values={{
                host,
                chainId: chainIds,
                // eslint-disable-next-line react/display-name
                b: (...chunks: any) => <b>{chunks}</b>,
              }}
            />
          </Text>
        </p>
        <div className={style.permission}>
          <Text size={12} color={colors["neutral-text-body"]}>
            <FormattedMessage id="access.permission.title" />
          </Text>
        </div>
        <ul>
          <li>
            <Text size={12} color={colors["neutral-text-body"]}>
              <FormattedMessage id="access.permission.account" />
            </Text>
          </li>
          <li>
            <Text size={12} color={colors["neutral-text-body"]}>
              <FormattedMessage id="access.permission.tx-request" />
            </Text>
          </li>
          {isSecretWasmIncluded ? (
            <li>
              <Text size={12} color={colors["neutral-text-body"]}>
                <FormattedMessage id="access.permission.secret" />
              </Text>
            </li>
          ) : null}
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
            color={"reject"}
            onClick={async (e) => {
              e.preventDefault();

              if (waitingPermission) {
                await permissionStore.reject(waitingPermission.id);
                if (
                  permissionStore.waitingBasicAccessPermissions.length === 0
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
          >
            <FormattedMessage id="access.button.reject" />
          </Button>
          <Button
            className={classnames(style.button, style.approveBtn)}
            onClick={async (e) => {
              e.preventDefault();

              if (waitingPermission) {
                await permissionStore.approve(waitingPermission.id);
                if (
                  permissionStore.waitingBasicAccessPermissions.length === 0
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
            disabled={!waitingPermission}
            data-loading={permissionStore.isLoading}
          >
            <FormattedMessage id="access.button.approve" />
          </Button>
        </div>
      </div>
    </EmptyLayout>
  );
});
