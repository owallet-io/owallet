import React, { FunctionComponent } from "react";
import { RegisterConfig } from "@owallet/hooks";
import { FormattedMessage, useIntl } from "react-intl";
import { Form } from "reactstrap";
import useForm from "react-hook-form";
import style from "../style.module.scss";
import { Input, PasswordInput } from "../../../components/form";
import { AdvancedBIP44Option, useBIP44Option } from "../advanced-bip44";
import { BackButton } from "../index";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores";
import { Button } from "../../../components/common/button";

export const TypeImportLedger = "import-ledger";

interface FormData {
  name: string;
  password: string;
  confirmPassword: string;
}

export const ImportLedgerIntro: FunctionComponent<{
  registerConfig: RegisterConfig;
}> = observer(({ registerConfig }) => {
  const { analyticsStore } = useStore();

  return (
    <Button
      color="secondary"
      onClick={(e) => {
        e.preventDefault();

        registerConfig.setType(TypeImportLedger);
        analyticsStore.logEvent("Import account started", {
          registerType: "ledger",
        });
      }}
      text={<FormattedMessage id="register.ledger.title" />}
    />
  );
});

export const ImportLedgerPage: FunctionComponent<{
  registerConfig: RegisterConfig;
}> = observer(({ registerConfig }) => {
  const intl = useIntl();
  const { analyticsStore } = useStore();
  const bip44Option = useBIP44Option(118);

  const { register, handleSubmit, getValues, errors, setValue } =
    useForm<FormData>({
      defaultValues: {
        name: "",
        password: "",
        confirmPassword: "",
      },
    });

  return (
    <div>
      <Form
        className={style.formContainer}
        onSubmit={handleSubmit(async (data: FormData) => {
          try {
            const result = await registerConfig.createLedger(
              data.name,
              data.password,
              bip44Option.bip44HDPath
            );

            analyticsStore.setUserProperties({
              registerType: "ledger",
              accountType: "ledger",
            });
          } catch (e) {
            console.log("ERROR ON HANDLE SUBMIT CREATE LEDGER", e);
            alert(e.message ? e.message : e.toString());
            registerConfig.clear();
          }
        })}
      >
        <Input
          label={intl.formatMessage({
            id: "register.name",
          })}
          styleInputGroup={{
            marginBottom: 15,
          }}
          onAction={() => {
            setValue("name", "");
          }}
          leftIcon={<img src={require("assets/icon/wallet.svg")} alt="" />}
          rightIcon={<img src={require("assets/icon/circle-del.svg")} alt="" />}
          type="text"
          name="name"
          ref={register({
            required: intl.formatMessage({
              id: "register.name.error.required",
            }),
          })}
          error={errors.name && errors.name.message}
        />
        {registerConfig.mode === "create" ? (
          <React.Fragment>
            <PasswordInput
              placeHolder={intl.formatMessage({
                id: "register.create.input.password",
              })}
              styleInputGroup={{
                marginBottom: 15,
              }}
              name="password"
              ref={register({
                required: intl.formatMessage({
                  id: "register.create.input.password.error.required",
                }),
                validate: (password: string): string | undefined => {
                  if (password.length < 8) {
                    return intl.formatMessage({
                      id: "register.create.input.password.error.too-short",
                    });
                  }
                },
              })}
              error={errors.password && errors.password.message}
            />
            <PasswordInput
              placeHolder={intl.formatMessage({
                id: "register.create.input.confirm-password",
              })}
              styleInputGroup={{
                marginBottom: 15,
              }}
              style={{ position: "relative" }}
              name="confirmPassword"
              ref={register({
                required: intl.formatMessage({
                  id: "register.create.input.confirm-password.error.required",
                }),
                validate: (confirmPassword: string): string | undefined => {
                  if (confirmPassword !== getValues()["password"]) {
                    return intl.formatMessage({
                      id: "register.create.input.confirm-password.error.unmatched",
                    });
                  }
                },
              })}
              error={errors.confirmPassword && errors.confirmPassword.message}
            />
          </React.Fragment>
        ) : null}
        {/* <AdvancedBIP44Option bip44Option={bip44Option} /> */}
        <Button data-loading={registerConfig.isLoading}>
          <FormattedMessage id="register.create.button.next" />
        </Button>
      </Form>
      <BackButton
        onClick={() => {
          registerConfig.clear();
        }}
      />
    </div>
  );
});
