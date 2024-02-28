import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
} from "react";
import { HeaderLayout } from "../../../layouts";

import { useHistory, useLocation, useRouteMatch } from "react-router";
import { FormattedMessage, useIntl } from "react-intl";
import { PasswordInput } from "../../../components/form";
import { Button, Form } from "reactstrap";
import useForm from "react-hook-form";
import { WarningView } from "./warning-view";

import classnames from "classnames";
import queryString from "query-string";

import style from "./style.module.scss";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores";
import { flowResult } from "mobx";

interface FormData {
  password: string;
}

export const ExportPage: FunctionComponent<{
  indexExport?: string;
  keyStore?: string;
}> = observer(({ indexExport, keyStore }) => {
  const history = useHistory();
  const location = useLocation();
  const match = useRouteMatch<{ index: string; type?: string }>();

  const intl = useIntl();

  const { keyRingStore } = useStore();

  const query = queryString.parse(location.search);

  const type = (keyStore || query.type) ?? "mnemonic";

  const [loading, setLoading] = useState(false);
  const [keyRing, setKeyRing] = useState("");
  const [showPass, setShowPass] = useState(false);
  const { register, handleSubmit, setError, errors } = useForm<FormData>({
    defaultValues: {
      password: "",
    },
  });

  useEffect(() => {
    if (
      parseInt(indexExport || match.params.index).toString() !==
      (indexExport || match.params.index)
    ) {
      throw new Error("Invalid index");
    }
  }, [match?.params?.index, indexExport]);

  return (
    // <HeaderLayout
    //   showChainName={false}
    //   canChangeChainInfo={false}
    //   alternativeTitle={intl.formatMessage({
    //     id:
    //       type === 'mnemonic' ? 'setting.export' : 'setting.export.private-key'
    //   })}
    //   onBackButton={useCallback(() => {
    //     history.goBack();
    //   }, [history])}
    // >
    <>
      <div className={style.container}>
        {keyRing ? (
          <div
            className={classnames(style.mnemonic, {
              [style.altHex]: type !== "mnemonic",
            })}
          >
            {keyRing}
          </div>
        ) : (
          <React.Fragment>
            <WarningView />
            <Form
              onSubmit={handleSubmit(async (data) => {
                setLoading(true);
                try {
                  setKeyRing(
                    await flowResult(
                      keyRingStore.showKeyRing(
                        parseInt(indexExport || match.params.index),
                        data.password
                      )
                    )
                  );
                } catch (e) {
                  console.log("Fail to decrypt: " + e.message);
                  setError(
                    "password",
                    "invalid",
                    intl.formatMessage({
                      id: "setting.export.input.password.error.invalid",
                    })
                  );
                } finally {
                  setLoading(false);
                }
              })}
            >
              <PasswordInput
                label={intl.formatMessage({
                  id: "setting.export.input.password",
                })}
                typeInput={!showPass ? "password" : "text"}
                styleInputGroup={{
                  boxShadow: "0px 2px 4px 1px rgba(8, 4, 28, 0.12)",
                }}
                style={{
                  boxShadow: "none !important",
                }}
                placeholder="Enter your password"
                name="password"
                error={errors.password && errors.password.message}
                ref={register({
                  required: intl.formatMessage({
                    id: "setting.export.input.password.error.required",
                  }),
                })}
                append={
                  <Button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    outline={true}
                    disabled={false}
                    style={{ boxShadow: "none !important" }}
                  >
                    <img
                      src={require("../../../public/assets/svg/eyes.svg")}
                      alt="logo"
                    />
                  </Button>
                }
              />
              <Button
                type="submit"
                color=""
                block
                data-loading={loading}
                className={style.confirmBtn}
              >
                <FormattedMessage id="setting.export.button.confirm" />
              </Button>
            </Form>
          </React.Fragment>
        )}
      </div>
      {/* </HeaderLayout> */}
    </>
  );
});
