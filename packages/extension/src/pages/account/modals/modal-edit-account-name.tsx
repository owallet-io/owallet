import React, { FC } from "react";
import SlidingPane from "react-sliding-pane";
import styles from "../styles/modal-recovery-phrase.module.scss";
import { LayoutWithButtonBottom } from "../../../layouts/button-bottom-layout/layout-with-button-bottom";
import { HeaderModal } from "../../home/components/header-modal";
import { observer } from "mobx-react-lite";
import Colors from "../../../theme/colors";
import { Input } from "../../../components/form";
import useForm from "react-hook-form";
import style from "../../register/style.module.scss";
import { Form } from "reactstrap";
import { useIntl } from "react-intl";
import { useLoadingIndicator } from "../../../components/loading-indicator";
import { useStore } from "../../../stores";
import { useHistory } from "react-router";

interface FormData {
  name: string;
}

export const ModalEditAccountNamePage: FC<{
  isOpen: boolean;
  onRequestClose: () => void;
  keyStoreIndex?: number;
}> = observer(({ isOpen, onRequestClose, keyStoreIndex }) => {
  const { keyRingStore } = useStore();
  const keyStore = keyRingStore.multiKeyStoreInfo[keyStoreIndex];
  const { register, handleSubmit, getValues, setError, errors, setValue } =
    useForm<FormData>({});
  const intl = useIntl();
  const history = useHistory();
  const loading = useLoadingIndicator();

  const submitForm = handleSubmit(async (data: FormData) => {
    loading.setIsLoading("changeName", true);
    try {
      // Make sure that name is changed
      await keyRingStore.updateNameKeyRing(keyStoreIndex, data.name);
      // history.push("/");
      onRequestClose();
    } catch (e) {
      console.log("Fail to decrypt: " + e.message);
      setError(
        "name",
        "invalid",
        intl.formatMessage({
          id: "setting.keyring.change.input.name.error.invalid",
        })
      );
    } finally {
      loading.setIsLoading("changeName", false);
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
        titleButton={"Save"}
        backgroundColor={Colors["neutral-surface-card"]}
        isDisabledHeader={true}
        onClickButtonBottom={submitForm}
      >
        <HeaderModal
          title={"set account name"}
          onRequestClose={onRequestClose}
        />
        <div className={styles.contentWrap}>
          {/*<div className={styles.containerInput}>*/}
          <Form className={style.formContainer} onSubmit={submitForm}>
            <Input
              label={intl.formatMessage({
                id: "register.name",
              })}
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
              onAction={() => {
                setValue("name", "");
              }}
              styleInputGroup={{}}
              type="text"
              name="name"
              ref={register({
                required: intl.formatMessage({
                  id: "register.name.error.required",
                }),
              })}
              defaultValue={keyStore?.meta?.name || ""}
              error={errors.name && errors.name.message}
              onSubmit={submitForm}
            />
          </Form>
          {/*<span className={styles.label}>Name:</span>*/}
          {/*<input*/}
          {/*  className={styles.inputPass}*/}
          {/*  type="text"*/}
          {/*  defaultValue={"Wallet 1"}*/}
          {/*  placeholder={"Please enter your account name"}*/}
          {/*  name={"account_name"}*/}
          {/*/>*/}
          {/*</div>*/}
        </div>
      </LayoutWithButtonBottom>
    </SlidingPane>
  );
});
