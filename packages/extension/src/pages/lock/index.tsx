import React, { FunctionComponent, useEffect, useRef, useState } from "react";
import { PasswordInput } from "../../components/form";
import { Form } from "reactstrap";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { Banner } from "../../components/banner";
import useForm from "react-hook-form";
import { EmptyLayout } from "../../layouts/empty-layout";
import style from "./style.module.scss";
import { FormattedMessage, useIntl } from "react-intl";
import { useInteractionInfo } from "@owallet/hooks";
import { useHistory } from "react-router";
import delay from "delay";
import { Card } from "../../components/common/card";
import { Button } from "../../components/common/button";
import colors from "../../theme/colors";

interface FormData {
  password: string;
}

export const LockPage: FunctionComponent = observer(() => {
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

  return (
    <EmptyLayout style={{ height: "100%" }}>
      <Card type="ink" containerStyle={{ height: "100%" }}>
        <Form
          className={style.formContainer}
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
          <Banner
            icon={require("assets/images/img_owallet.png")}
            logo={require("assets/orai_wallet_logo.png")}
            subtitle={`UNIVERSAL`}
            subtitle2={`WEB3 GATEWAY`}
          />
          <PasswordInput
            styleInputGroup={{
              borderColor: colors["primary-surface-default"],
              borderWidth: 2,
            }}
            name="password"
            error={errors.password && errors.password.message}
            ref={(ref) => {
              passwordRef.current = ref;
              register({
                required: intl.formatMessage({
                  id: "lock.input.password.error.required",
                }),
              })(ref);
            }}
            placeholder="Enter your account password"
          />
          <Button
            containerStyle={{ marginTop: 50 }}
            color="primary"
            data-loading={loading}
            loading={loading}
          >
            <FormattedMessage id="lock.button.unlock" />
          </Button>
        </Form>
      </Card>
    </EmptyLayout>
  );
});
