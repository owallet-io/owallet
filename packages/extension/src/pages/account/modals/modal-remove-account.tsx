import React, { FC, useRef } from "react";
import styles from "../styles/modal-recovery-phrase.module.scss";
import { LayoutWithButtonBottom } from "../../../layouts/button-bottom-layout/layout-with-button-bottom";
import Colors from "../../../theme/colors";
import { HeaderModal } from "../../home/components/header-modal";
import SlidingPane from "react-sliding-pane";
import { Form } from "reactstrap";
import style from "../../lock/style.module.scss";
import { PasswordInput } from "../../../components/form";
import colors from "../../../theme/colors";
import useForm from "react-hook-form";
import { useLoadingIndicator } from "../../../components/loading-indicator";
import { flowResult } from "mobx";
import { useIntl } from "react-intl";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores";
import { useHistory } from "react-router";
import { useParams } from "react-router-dom";
interface FormData {
  password: string;
}
export const ModalRemoveAccount: FC<{
  isOpen: boolean;
  onRequestClose: () => void;
  keyStoreIndex?: number;
}> = observer(({ isOpen, keyStoreIndex, onRequestClose }) => {
  const { register, handleSubmit, setError, errors } = useForm<FormData>({
    defaultValues: {
      password: "",
    },
  });
  const { keyRingStore } = useStore();
  const loading = useLoadingIndicator();
  const passwordRef = useRef<HTMLInputElement | null>();
  const intl = useIntl();
  const history = useHistory();
  const onSubmit = handleSubmit(async (data) => {
    loading.setIsLoading("removeAccount", true);
    try {
      // Make sure that password is valid and keyring is cleared.
      await keyRingStore.deleteKeyRing(keyStoreIndex, data.password);
      if (!keyRingStore.multiKeyStoreInfo.length) {
        localStorage.removeItem("initchain");
        browser.tabs.create({
          url: "/popup.html#/register",
        });
      } else {
        history.goBack();
        onRequestClose();
      }
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
      loading.setIsLoading("removeAccount", false);
    }
  });
  const params: {
    keystoreIndex: string;
  } = useParams();
  const wallet = keyRingStore.multiKeyStoreInfo[params.keystoreIndex];
  const onShowPhrasePage = () => {
    if (wallet?.type === "mnemonic") {
      history.push(`/reveal-recovery-phrase/${params.keystoreIndex}`);
      onRequestClose();
      return;
    }
    if (wallet?.type === "privateKey") {
      history.push(`/reveal-private-key/${params.keystoreIndex}`);
      onRequestClose();
      return;
    }
  };
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
        titleButton={"Confirm Removal"}
        backgroundColor={Colors["neutral-surface-card"]}
        isDisabledHeader={true}
        onClickButtonBottom={onSubmit}
        btnBackgroundColor={Colors["error-surface-default"]}
      >
        <HeaderModal
          title={"Remember to back up your recovery phrase!"}
          onRequestClose={onRequestClose}
        />
        <div className={styles.contentWrap}>
          <div className={styles.alert}>
            <img src={require("assets/svg/ow_error-circle.svg")} />
            <span className={styles.textAlert}>
              Making a backup of your wallet with this phrase is important so
              you can still get to your assets if you delete account. <br />
              There is no way to get back your assets if you lose Recovery
              Phrase.
            </span>
          </div>
          {wallet?.type !== "ledger" && (
            <div onClick={onShowPhrasePage} className={styles.actionReveal}>
              <img src={require("assets/svg/ow_key.svg")} />
              <span className={styles.title}>Reveal Recovery Phrase</span>
            </div>
          )}
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
});
