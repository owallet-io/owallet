import React, { FunctionComponent, useEffect, useRef, useState } from "react";
import { PasswordInput } from "../../components/form";
import { Form } from "reactstrap";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { Banner } from "../../components/banner";
import useForm from "react-hook-form";
import { EmptyLayout } from "../../layouts/empty-layout";
import styles from "./style.module.scss";
import { FormattedMessage, useIntl } from "react-intl";
import { useInteractionInfo } from "@owallet/hooks";
import { useHistory } from "react-router";
import delay from "delay";
import { Card } from "../../components/common/card";
import { Button } from "../../components/common/button";
import colors from "../../theme/colors";
import { Text } from "components/common/text";
import { ICON_OWALLET } from "@owallet/common";
// import { useSyncProviders } from "./hooks/useSyncProviders";

interface FormData {
  password: string;
}

export const SelectWalletDappConnectPage: FunctionComponent = observer(() => {
  const intl = useIntl();
  const history = useHistory();

  const passwordRef = useRef<HTMLInputElement | null>();

  const { register, handleSubmit, setError, errors } = useForm<FormData>({
    defaultValues: {
      password: "",
    },
  });

  const { keyRingStore } = useStore();

  const [loading, setLoading] = useState(false);

  const interactionInfo = useInteractionInfo(() => {
    keyRingStore.rejectAll();
  });

  useEffect(() => {
    if (passwordRef.current) {
      // Focus the password input on enter.
      passwordRef.current.focus();
    }
  }, []);
  const dapps = [
    {
      name: "OWallet",
      icon: ICON_OWALLET,
    },
    {
      name: "Metamask",
      icon: ICON_OWALLET,
    },
    {
      name: "Brave",
      icon: ICON_OWALLET,
    },
  ];
  //   const providers = useSyncProviders();
  //   const onAnnouncement = (event) => {
  //     console.log(event, "event");
  //   };

  //   console.log(providers, "providers");
  return (
    <EmptyLayout style={{ height: "100%" }}>
      <Card type="ink" containerStyle={{ height: "100%" }}>
        <Form
          className={styles.formContainer}
          onSubmit={handleSubmit(async (data) => {
            setLoading(true);
            try {
              await keyRingStore.unlock(data.password, true);
              if (interactionInfo.interaction) {
                if (!interactionInfo.interactionInternal) {
                  // XXX: If the connection doesn't have the permission,
                  //      permission service tries to grant the permission right after unlocking.
                  //      Thus, due to the yet uncertain reason, it requests new interaction for granting permission
                  //      before the `window.close()`. And, it could make the permission page closed right after page changes.
                  //      Unfortunately, I still don't know the exact cause.
                  //      Anyway, for now, to reduce this problem, jsut wait small time, and close the window only if the page is not changed.
                  await delay(100);
                  if (window.location.href.includes("#/unlock")) {
                    window.close();
                  }
                } else {
                  history.replace("/");
                }
              }
            } catch (e) {
              console.log("Fail to decrypt: " + e.message);
              setError(
                "password",
                "invalid",
                intl.formatMessage({
                  id: "lock.input.password.error.invalid",
                })
              );
              setLoading(false);
            }
          })}
        >
          <Text
            containerStyle={{
              textAlign: "center",
            }}
            size={22}
            weight={"700"}
            color={colors["neutral-text-title"]}
          >
            Choose an extension to connect
          </Text>
          <Text
            containerStyle={{
              textAlign: "center",
            }}
            size={13}
            weight="400"
            color={colors["neutral-text-body"]}
          >
            You are connecting to a new DApp that offers multiple installed
            wallets.
          </Text>
          <div className={styles.listExplore}>
            {dapps.map((item, index) => {
              return (
                <div
                  //   onClick={() => window.open(item.url)}
                  key={index}
                  className={styles.itemExplore}
                >
                  <img className={styles.imgIcon} src={item.icon} />
                  <span className={styles.titleItem}>{item.name}</span>
                </div>
              );
            })}
          </div>
        </Form>
      </Card>
    </EmptyLayout>
  );
});
