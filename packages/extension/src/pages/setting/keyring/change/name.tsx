import React, { FunctionComponent, useState, useEffect, useMemo } from "react";
import { HeaderLayout } from "../../../../layouts";

import { useHistory, useRouteMatch } from "react-router";
import { FormattedMessage, useIntl } from "react-intl";
import { Input } from "../../../../components/form";
import { Button, Form } from "reactstrap";
import useForm from "react-hook-form";
import { useStore } from "../../../../stores";
import { observer } from "mobx-react-lite";

import styleName from "./name.module.scss";

interface FormData {
  name: string;
}

export const ChangeNamePage: FunctionComponent<{
  indexPage?: string;
}> = observer(({ indexPage }) => {
  const history = useHistory();
  const match = useRouteMatch<{ index: string }>();

  const intl = useIntl();

  const [loading, setLoading] = useState(false);

  const { keyRingStore } = useStore();
  const { register, handleSubmit, errors, setError } = useForm<FormData>({
    defaultValues: {
      name: "",
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
    //     id: 'setting.keyring.change.name'
    //   })}
    //   onBackButton={() => {
    //     history.goBack();
    //   }}
    // >

    <>
      <Form
        className={styleName.container}
        onSubmit={handleSubmit(async (data) => {
          setLoading(true);
          try {
            // Make sure that name is changed
            await keyRingStore.updateNameKeyRing(
              parseInt(indexPage || match.params.index),
              data.name
            );
            history.push("/");
          } catch (e) {
            console.log("Fail to decrypt: " + e.message);
            setError(
              "name",
              "invalid",
              intl.formatMessage({
                id: "setting.keyring.change.input.name.error.invalid",
              })
            );
            setLoading(false);
          }
        })}
      >
        <Input
          type="text"
          label={intl.formatMessage({
            id: "setting.keyring.change.previous-name",
          })}
          value={keyStore.meta?.name}
          readOnly={true}
          styleInputGroup={{
            backgroundColor: "rgba(8, 4, 28, 0.12)",
            border: "0.5px solid rgba(8, 4, 28, 0.12)",
          }}
        />
        <Input
          type="text"
          label={intl.formatMessage({
            id: "setting.keyring.change.input.name",
          })}
          styleInputGroup={{
            boxShadow: "0px 2px 4px 1px rgba(8, 4, 28, 0.12)",
          }}
          name="name"
          error={errors.name && errors.name.message}
          ref={register({
            required: intl.formatMessage({
              id: "setting.keyring.change.input.name.error.required",
            }),
          })}
        />
        <div style={{ flex: 1 }} />
        <Button type="submit" color="primary" block data-loading={loading}>
          <FormattedMessage id="setting.keyring.change.name.button.save" />
        </Button>
      </Form>
      {/* </HeaderLayout> */}
    </>
  );
});
