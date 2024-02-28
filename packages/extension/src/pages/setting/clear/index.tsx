import React, {
  FunctionComponent,
  useCallback,
  useState,
  useEffect,
  useMemo,
} from "react";
import { HeaderLayout } from "../../../layouts";

import { useHistory, useRouteMatch } from "react-router";
import { FormattedMessage, useIntl } from "react-intl";
import { PasswordInput } from "../../../components/form";
import { Button, Form } from "reactstrap";
import useForm from "react-hook-form";
import { useStore } from "../../../stores";
import { observer } from "mobx-react-lite";

import style from "./style.module.scss";
import { WarningView } from "./warning-view";

interface FormData {
  password: string;
}

export const ClearPage: FunctionComponent<{
  indexPage?: string;
}> = observer(({ indexPage }) => {
  const history = useHistory();
  const match = useRouteMatch<{ index: string }>();

  const intl = useIntl();

  const [loading, setLoading] = useState(false);

  const { keyRingStore, analyticsStore } = useStore();
  const { register, handleSubmit, setError, errors } = useForm<FormData>({
    defaultValues: {
      password: "",
    },
  });

  useEffect(() => {
    if (
      parseInt(indexPage || match.params.index).toString() !==
      (indexPage || match.params.index)
    ) {
      throw new Error("Invalid index");
    }
  }, [match.params.index, indexPage]);

  const keyStore = useMemo(() => {
    return keyRingStore.multiKeyStoreInfo[
      parseInt(indexPage || match.params.index)
    ];
  }, [keyRingStore.multiKeyStoreInfo, indexPage, match.params.index]);

  return (
    // <HeaderLayout
    //   showChainName={false}
    //   canChangeChainInfo={false}
    //   alternativeTitle={intl.formatMessage({
    //     id: 'setting.clear'
    //   })}
    //   onBackButton={useCallback(() => {
    //     history.goBack();
    //   }, [history])}
    // >
    <>
      <div className={style.container}>
        {keyStore ? (
          <WarningView
            index={parseInt(match.params.index)}
            keyStore={keyStore}
          />
        ) : null}
        <Form
          onSubmit={handleSubmit(async (data) => {
            setLoading(true);
            try {
              // Make sure that password is valid and keyring is cleared.
              await keyRingStore.deleteKeyRing(
                parseInt(indexPage || match.params.index),
                data.password
              );
              if (!keyRingStore.multiKeyStoreInfo.length) {
                localStorage.removeItem("initchain");
                browser.tabs.create({
                  url: "/popup.html#/register",
                });
              } else {
                history.push("/");
              }
              analyticsStore.logEvent("Account removed");
            } catch (e) {
              console.log("Fail to decrypt: " + e.message);
              setError(
                "password",
                "invalid",
                intl.formatMessage({
                  id: "setting.clear.input.password.error.invalid",
                })
              );
              setLoading(false);
            }
          })}
        >
          <PasswordInput
            label={intl.formatMessage({
              id: "setting.clear.input.password",
            })}
            placeholder={"Enter your password"}
            name="password"
            styleInputGroup={{
              boxShadow: "0px 2px 4px 1px rgba(8, 4, 28, 0.12)",
            }}
            error={errors.password && errors.password.message}
            ref={register({
              required: intl.formatMessage({
                id: "setting.clear.input.password.error.required",
              }),
            })}
          />
          <Button type="submit" color="primary" block data-loading={loading}>
            <FormattedMessage id="setting.clear.button.confirm" />
          </Button>
        </Form>
      </div>
      {/* </HeaderLayout> */}
    </>
  );
});
