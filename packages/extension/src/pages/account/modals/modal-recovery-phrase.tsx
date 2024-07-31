import React, { FC, useCallback, useRef, useState } from "react";
import SlidingPane from "react-sliding-pane";
import styles from "../styles/modal-recovery-phrase.module.scss";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores";

import { useIntl } from "react-intl";
import { HeaderModal } from "../../home/components/header-modal";
import { LayoutWithButtonBottom } from "../../../layouts/button-bottom-layout/layout-with-button-bottom";
import { useHistory } from "react-router";
import Colors from "../../../theme/colors";
import { PasswordInput } from "../../../components/form";
import colors from "../../../theme/colors";
import style from "../../lock/style.module.scss";
import delay from "delay";
import { Form } from "reactstrap";
import useForm from "react-hook-form";
import { flowResult } from "mobx";
import { useLoadingIndicator } from "../../../components/loading-indicator";

interface FormData {
  password: string;
}

export const ModalRecoveryPhrase: FC<{
  isOpen: boolean;
  onRequestClose: () => void;
  keyStoreIndex?: number;
  onKeyring: (value: string) => void;
  isShowPrivKey: boolean;
}> = observer(
  ({ isOpen, onKeyring, onRequestClose, keyStoreIndex, isShowPrivKey }) => {
    const { keyRingStore, chainStore } = useStore();

    const intl = useIntl();
    const passwordRef = useRef<HTMLInputElement | null>();

    const { register, handleSubmit, setError, errors } = useForm<FormData>({
      defaultValues: {
        password: "",
      },
    });
    const loading = useLoadingIndicator();
    const onSubmit = handleSubmit(async (data) => {
      loading.setIsLoading("showkeyring", true);
      try {
        const keyring = await flowResult(
          keyRingStore.showKeyRing(
            keyStoreIndex,
            data.password,
            chainStore.current.chainId,
            isShowPrivKey
          )
        );
        if (!keyring) return;
        onKeyring(keyring);
        console.log(keyring, "keyring");
        return;
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
        loading.setIsLoading("showkeyring", false);
      }
    });
    return (
      <SlidingPane
        isOpen={isOpen}
        from="bottom"
        width="100vw"
        onRequestClose={onRequestClose}
        hideHeader={true}
        className={styles.modalContainer}
      >
        <LayoutWithButtonBottom
          titleButton={"Confirm"}
          backgroundColor={Colors["neutral-surface-card"]}
          isDisabledHeader={true}
          onClickButtonBottom={onSubmit}
        >
          <HeaderModal title={""} onRequestClose={onRequestClose} />
          <div className={styles.contentWrap}>
            <img
              src={require("assets/images/img_key.png")}
              alt="logo"
              className={styles.logo}
            />
            <span className={styles.title}>
              You are revealing recovery phrase
            </span>
            <span className={styles.subTitle}>
              Just be ready to write it down and{" "}
              <span className={styles.warning}>DO NOT SHARE </span> it with
              anyone.
            </span>
            <Form className={style.formContainer} onSubmit={onSubmit}>
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
            </Form>
          </div>
        </LayoutWithButtonBottom>
      </SlidingPane>
    );
  }
);
