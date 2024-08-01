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
import { useSyncProviders } from "./hooks/useSyncProviders";

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

  const { keyRingStore, chainStore } = useStore();

  const [loading, setLoading] = useState(false);
  const [providers, setProviders] = useState<any>([]);
  const interactionInfo = useInteractionInfo(() => {
    keyRingStore.rejectAll();
  });

  useEffect(() => {
    if (passwordRef.current) {
      passwordRef.current.focus();
    }
  }, []);
  useEffect(() => {
    // Kiểm tra nếu API của Chrome có sẵn
    if (typeof chrome !== "undefined" && chrome.storage) {
      chrome.storage.local.get("walletData", function (result) {
        console.log(result, "result");
        if (result.walletData) {
          setProviders(Object.values(result.walletData));
          // setEthereumData(result.ethereumData);
          console.log("Ethereum Data:", result.walletData);
        }
      });
    } else {
      console.error("Chrome storage API is not available.");
    }
  }, []);

  //   const providers = useSyncProviders();
  console.log(providers, "providers select");
  return (
    <EmptyLayout style={{ height: "100%" }}>
      <Card type="ink" containerStyle={{ height: "100%" }}>
        <Form className={styles.formContainer}>
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
            {providers.map((item, index) => {
              return (
                <div
                  onClick={() => {
                    // chrome.runtime.sendMessage({ walletId: item.rdns });
                    // chainStore.test(item.rdns);
                    console.log(
                      { walletId: item.rdns },
                      "{ walletId: item.rdns }"
                    );
                    // window.close();
                  }}
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
