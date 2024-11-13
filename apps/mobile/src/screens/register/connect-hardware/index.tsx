import React, { FunctionComponent, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { observer } from "mobx-react-lite";
import { Controller, useForm } from "react-hook-form";
// import {Button} from '../../../components/button';
import { useStyle } from "../../../styles";
import { useNavigation } from "@react-navigation/native";
// import {StackNavProp} from '../../../navigation';
import { Bip44PathView, useBIP44PathState } from "../components/bip-path-44";
import { InteractionManager, StyleSheet, Text, View } from "react-native";
import { Gutter } from "../../../components/gutter";
import { Box } from "../../../components/box";
import { App } from "@owallet/ledger-cosmos";
import { RectButton } from "../../../components/rect-button";
import { XAxis } from "../../../components/axis";
// import {ArrowDownFillIcon} from '../../../components/icon/arrow-donw-fill';
// import {SelectItemModal} from '../../../components/modal/select-item-modal';
import { ScrollViewRegisterContainer } from "../components/scroll-view-register-container";
import { VerticalCollapseTransition } from "../../../components/transition";
import { NamePasswordInput } from "../components/name-password-input";
// import {useEffectOnce} from '../../../hooks';
import OWIcon from "@components/ow-icon/ow-icon";
import { SelectItemModal } from "@src/modals/select-item-modal";
import { SCREENS } from "@common/constants";
import { useEffectOnce } from "@hooks/use-effect-once";
import { OWButton } from "@components/button";
import { metrics } from "@src/themes";
import { ScrollView, TouchableOpacity } from "react-native-gesture-handler";
import { PageWithBottom } from "@components/page/page-with-bottom";
import { goBack } from "@src/router/root";
import OWText from "@components/text/ow-text";
import { TextInput } from "@components/input";
import { useTheme } from "@src/themes/theme-provider";

export const ConnectHardwareWalletScreen: FunctionComponent = observer(() => {
  const intl = useIntl();
  const style = useStyle();
  const navigation = useNavigation();

  const bip44PathState = useBIP44PathState(true);
  const [isOpenBip44PathView, setIsOpenBip44PathView] = React.useState(false);
  const [isOpenSelectItemModal, setIsOpenSelectItemModal] = useState(false);

  const supportedApps: {
    key: App;
    title: string;
  }[] = [
    {
      key: "Cosmos",
      title: intl.formatMessage({
        id: "pages.register.name-password-hardware.connect-to-cosmos",
      }),
    },
    {
      key: "Terra",
      title: intl.formatMessage({
        id: "pages.register.name-password-hardware.connect-to-terra",
      }),
    },
    {
      key: "Secret",
      title: intl.formatMessage({
        id: "pages.register.name-password-hardware.connect-to-secret",
      }),
    },
  ];
  const [selectedApp, setSelectedApp] = React.useState<App>("Cosmos");

  const {
    control,
    handleSubmit,
    getValues,
    setFocus,
    formState: { errors },
  } = useForm<{
    name: string;
    password: string;
    confirmPassword: string;
  }>({
    defaultValues: {
      name: "",
      password: "",
      confirmPassword: "",
    },
  });

  useEffectOnce(() => {
    InteractionManager.runAfterInteractions(() => {
      setFocus("name");
    });
  });

  const onSubmit = handleSubmit(async (data) => {
    navigation.navigate(SCREENS.ConnectNewLedger, {
      name: data.name,
      password: data.password,
      stepPrevious: 1,
      stepTotal: 3,
      bip44Path: bip44PathState.getPath(),
      app: selectedApp,
    });
  });
  const styles = useStyles();
  const { colors } = useTheme();
  const renderWalletName = ({ field: { onChange, onBlur, value, ref } }) => {
    return (
      <TextInput
        label=""
        topInInputContainer={
          <View style={{ paddingBottom: 4 }}>
            <OWText>Wallet Name</OWText>
          </View>
        }
        returnKeyType="next"
        inputStyle={{
          width: metrics.screenWidth - 32,
          borderColor: colors["neutral-border-strong"],
        }}
        style={{ fontWeight: "600", paddingLeft: 4, fontSize: 15 }}
        inputLeft={
          <OWIcon
            size={20}
            name="wallet-outline"
            color={colors["primary-text-action"]}
          />
        }
        error={errors.name?.message}
        onBlur={onBlur}
        onChangeText={onChange}
        value={value}
        ref={ref}
      />
    );
  };
  return (
    // <ScrollViewRegisterContainer
    //   paragraph={`${intl.formatMessage({
    //     id: "pages.register.components.header.header-step.title",
    //   })} 1/3`}
    //   bottomButton={{
    //     text: intl.formatMessage({
    //       id: "button.next",
    //     }),
    //     size: "large",
    //     onPress: onSubmit,
    //   }}
    //   paddingX={20}
    // >
    //   <NamePasswordInput
    //     control={control}
    //     errors={errors}
    //     getValues={getValues}
    //     setFocus={setFocus}
    //     onSubmit={onSubmit}
    //   />
    //
    //   <Gutter size={16} />
    //
    //   <Text style={style.flatten(["subtitle3", "color-gray-100"])}>
    //     <FormattedMessage id="pages.register.name-password-hardware.connect-to" />
    //   </Text>
    //
    //   <Gutter size={6} />
    //
    //   <RectButton
    //     style={style.flatten([
    //       "padding-x-16",
    //       "padding-y-16",
    //       "border-width-1",
    //       "border-color-gray-400",
    //       "border-radius-8",
    //     ])}
    //     onPress={() => {
    //       setIsOpenSelectItemModal(true);
    //     }}
    //   >
    //     <XAxis alignY="center">
    //       <Text style={style.flatten(["body2", "color-gray-50", "flex-1"])}>
    //         {supportedApps.find((item) => item.key === selectedApp)?.title}
    //       </Text>
    //
    //       <OWIcon
    //         name={"arrow_down_2"}
    //         size={24}
    //         color={style.get("color-gray-300").color}
    //       />
    //     </XAxis>
    //   </RectButton>
    //
    //   <Gutter size={16} />
    //
    //   <VerticalCollapseTransition collapsed={isOpenBip44PathView}>
    //     <Box alignX="center">
    //       <OWButton
    //         label={intl.formatMessage({ id: "button.advanced" })}
    //         size="small"
    //         // color="secondary"
    //         onPress={() => {
    //           setIsOpenBip44PathView(true);
    //         }}
    //       />
    //     </Box>
    //   </VerticalCollapseTransition>
    //   {
    //     <VerticalCollapseTransition collapsed={!isOpenBip44PathView}>
    //       <Bip44PathView
    //         isLedger={true}
    //         state={bip44PathState}
    //         setIsOpen={setIsOpenBip44PathView}
    //       />
    //     </VerticalCollapseTransition>
    //   }
    //   <Gutter size={16} />
    //
    //   <SelectItemModal
    //     isOpen={isOpenSelectItemModal}
    //     close={() => setIsOpenSelectItemModal(false)}
    //     items={supportedApps.map((item) => ({
    //       key: item.key,
    //       title: item.title,
    //       selected: item.key === selectedApp,
    //       onSelect: () => {
    //         setSelectedApp(item.key);
    //         setIsOpenSelectItemModal(false);
    //       },
    //     }))}
    //   />
    // </ScrollViewRegisterContainer>
    <View style={styles.container}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity onPress={goBack} style={styles.goBack}>
          <OWIcon
            size={16}
            color={colors["neutral-icon-on-light"]}
            name="arrow-left"
          />
        </TouchableOpacity>
        <View style={[styles.aic, styles.title]}>
          <OWText variant="heading" style={{ textAlign: "center" }} typo="bold">
            Import Ledger Nano X
          </OWText>

          <View
            style={{
              paddingHorizontal: 20,
              paddingVertical: 10,
            }}
          />
          <Controller
            control={control}
            rules={{
              required: "Wallet name is required",
            }}
            render={renderWalletName}
            name="name"
            defaultValue={`OWallet-${
              Math.floor(Math.random() * (100 - 1)) + 1
            }`}
          />
          <View
            style={{
              paddingTop: 16,
            }}
          >
            <OWText style={style.flatten(["subtitle3"])}>
              <FormattedMessage id="pages.register.name-password-hardware.connect-to" />
            </OWText>
            <RectButton
              style={{
                padding: 16,
                marginTop: 5,
                borderWidth: 1,
                borderColor: colors["neutral-border-strong"],
              }}
              onPress={() => {
                setIsOpenSelectItemModal(true);
              }}
            >
              <XAxis alignY="center">
                <OWText style={style.flatten(["body2", "flex-1"])}>
                  {
                    supportedApps.find((item) => item.key === selectedApp)
                      ?.title
                  }
                </OWText>

                <OWIcon
                  name={"arrow_down_2"}
                  size={24}
                  color={colors["neutral-text-title"]}
                />
              </XAxis>
            </RectButton>
          </View>
          <SelectItemModal
            isOpen={isOpenSelectItemModal}
            close={() => setIsOpenSelectItemModal(false)}
            items={supportedApps.map((item) => ({
              key: item.key,
              title: item.title,
              selected: item.key === selectedApp,
              onSelect: () => {
                setSelectedApp(item.key);
                setIsOpenSelectItemModal(false);
              },
            }))}
          />
        </View>
      </ScrollView>

      <View style={styles.aic}>
        <View style={styles.signIn}>
          <OWButton
            style={{
              borderRadius: 32,
            }}
            textStyle={{ color: colors["neutral-text-action-on-dark-bg"] }}
            label={"Next"}
            onPress={onSubmit}
          />
        </View>
      </View>
    </View>
  );
});
const useStyles = () => {
  const { colors } = useTheme();
  return StyleSheet.create({
    mnemonicInput: {
      width: metrics.screenWidth - 40,
      paddingLeft: 20,
      paddingRight: 20,
      paddingVertical: 10,
      backgroundColor: "transparent",
    },
    borderInput: {
      borderColor: colors["primary-surface-default"],
      borderWidth: 2,
      backgroundColor: "transparent",
      paddingLeft: 11,
      paddingRight: 11,
      paddingTop: 12,
      paddingBottom: 12,
      borderRadius: 8,
    },

    container: {
      paddingTop: metrics.screenHeight / 14,
      justifyContent: "space-between",
      height: "100%",
      backgroundColor: colors["neutral-surface-card"],
    },
    signIn: {
      width: "100%",
      alignItems: "center",
      borderTopWidth: 1,
      borderTopColor: colors["neutral-border-default"],
      padding: 16,
    },
    aic: {
      paddingBottom: 20,
    },
    rc: {
      flexDirection: "row",
      alignItems: "center",
    },
    title: {
      paddingHorizontal: 16,
      paddingTop: 24,
    },
    goBack: {
      backgroundColor: colors["neutral-surface-action3"],
      borderRadius: 999,
      width: 44,
      height: 44,
      alignItems: "center",
      justifyContent: "center",
      marginLeft: 16,
    },
    paste: {
      paddingHorizontal: 16,
      paddingBottom: 24,
      width: "100%",
    },
    pasteBtn: {
      flexDirection: "row",
      alignItems: "center",
      alignSelf: "flex-end",
    },
  });
};
