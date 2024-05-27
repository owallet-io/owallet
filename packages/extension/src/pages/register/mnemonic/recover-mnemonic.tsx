import React, { FunctionComponent } from "react";

import { Form } from "reactstrap";

import { FormattedMessage, useIntl } from "react-intl";
import style from "../style.module.scss";
import { BackButton } from "../index";
import { Input, PasswordInput, TextArea } from "../../../components/form";
import useForm from "react-hook-form";
import { observer } from "mobx-react-lite";
import { RegisterConfig } from "@owallet/hooks";
import { AdvancedBIP44Option, useBIP44Option } from "../advanced-bip44";

import { Buffer } from "buffer";
import { useStore } from "../../../stores";
import { Button } from "../../../components/common/button";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const bip39 = require("bip39");

const isPrivateKey = (str: string): boolean =>
  /(?:0x)?[0-9a-fA-F]{64}/.test(str);

function trimWordsStr(str: string): string {
  str = str.trim();
  // Split on the whitespace or new line.
  const splited = str.split(/\s+/);
  const words = splited
    .map((word) => word.trim())
    .filter((word) => word.trim().length > 0);
  return words.join(" ");
}

interface FormData {
  name: string;
  words: string;
  password: string;
  confirmPassword: string;
}

export const TypeRecoverMnemonic = "recover-mnemonic";

export const RecoverMnemonicIntro: FunctionComponent<{
  registerConfig: RegisterConfig;
}> = observer(({ registerConfig }) => {
  const { analyticsStore } = useStore();

  return (
    <Button
      color="secondary"
      onClick={(e) => {
        e.preventDefault();

        registerConfig.setType(TypeRecoverMnemonic);
        analyticsStore.logEvent("Import account started", {
          registerType: "seed",
        });
      }}
      text={
        <FormattedMessage id="register.intro.button.import-account.title" />
      }
    />
  );
});

export const RecoverMnemonicPage: FunctionComponent<{
  registerConfig: RegisterConfig;
}> = observer(({ registerConfig }) => {
  const intl = useIntl();

  const bip44Option = useBIP44Option();

  const { analyticsStore } = useStore();

  const { register, handleSubmit, getValues, errors } = useForm<FormData>({
    defaultValues: {
      name: "",
      words: "",
      password: "",
      confirmPassword: "",
    },
  });

  return (
    <React.Fragment>
      <div>
        {/* <div className={style.title}>
          {intl.formatMessage({
            id: "register.recover.title"
          })}
        </div> */}
        <Form
          className={style.formContainer}
          onSubmit={handleSubmit(async (data: FormData) => {
            try {
              if (!isPrivateKey(data.words)) {
                await registerConfig.createMnemonic(
                  data.name,
                  trimWordsStr(data.words),
                  data.password,
                  bip44Option.bip44HDPath
                );
                analyticsStore.setUserProperties({
                  registerType: "seed",
                  accountType: "mnemonic",
                });
              } else {
                const privateKey = Buffer.from(
                  data.words.trim().replace("0x", ""),
                  "hex"
                );
                await registerConfig.createPrivateKey(
                  data.name,
                  privateKey,
                  data.password
                );
                analyticsStore.setUserProperties({
                  registerType: "seed",
                  accountType: "privateKey",
                });
              }
            } catch (e) {
              alert(e.message ? e.message : e.toString());
              registerConfig.clear();
            }
          })}
        >
          <TextArea
            className={style.mnemonic}
            placeholder={intl.formatMessage({
              id: "register.create.textarea.mnemonic.place-holder",
            })}
            style={{
              border: "1px solid rgba(8, 4, 28, 0.12)",
            }}
            name="words"
            rows={3}
            ref={register({
              required: "Mnemonic is required",
              validate: (value: string): string | undefined => {
                if (!isPrivateKey(value)) {
                  value = trimWordsStr(value);
                  if (value.split(" ").length < 8) {
                    return intl.formatMessage({
                      id: "register.create.textarea.mnemonic.error.too-short",
                    });
                  }

                  if (!bip39.validateMnemonic(value)) {
                    return intl.formatMessage({
                      id: "register.create.textarea.mnemonic.error.invalid",
                    });
                  }
                } else {
                  value = value.replace("0x", "");
                  if (value.length !== 64) {
                    return intl.formatMessage({
                      id: "register.import.textarea.private-key.error.invalid-length",
                    });
                  }

                  try {
                    if (
                      Buffer.from(value, "hex")
                        .toString("hex")
                        .toLowerCase() !== value.toLowerCase()
                    ) {
                      return intl.formatMessage({
                        id: "register.import.textarea.private-key.error.invalid",
                      });
                    }
                  } catch {
                    return intl.formatMessage({
                      id: "register.import.textarea.private-key.error.invalid",
                    });
                  }
                }
              },
            })}
            error={errors.words && errors.words.message}
          />
          <Input
            label={intl.formatMessage({
              id: "register.name",
            })}
            styleInputGroup={{
              marginBottom: 15,
            }}
            leftIcon={
              <img
                src={require("../../../public/assets/icon/wallet.svg")}
                alt=""
              />
            }
            rightIcon={
              <img
                src={require("../../../public/assets/icon/circle-del.svg")}
                alt=""
              />
            }
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
          <Button color="primary" data-loading={registerConfig.isLoading}>
            <FormattedMessage id="register.create.button.next" />
          </Button>
        </Form>
        <BackButton
          onClick={() => {
            registerConfig.clear();
          }}
        />
      </div>
    </React.Fragment>
  );
});
