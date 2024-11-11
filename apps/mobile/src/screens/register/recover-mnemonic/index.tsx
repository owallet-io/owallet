import React, { FunctionComponent, useState } from "react";
import { observer } from "mobx-react-lite";
import { FormattedMessage, useIntl } from "react-intl";
import {
  Clipboard,
  Keyboard,
  Platform,
  StyleSheet,
  Text,
  TextInput as NativeTextInput,
  View,
} from "react-native";

import { Controller, useForm } from "react-hook-form";
import { useNavigation } from "@react-navigation/native";
import { Bip44PathView, useBIP44PathState } from "../components/bip-path-44";
import { useStore } from "../../../stores";

import { OWButton } from "@components/button";
import { metrics, typography } from "@src/themes";
import { useTheme } from "@src/themes/theme-provider";
import { ScrollView, TouchableOpacity } from "react-native-gesture-handler";
import OWIcon from "@components/ow-icon/ow-icon";
import OWText from "@components/text/ow-text";
import { TextInput } from "@components/input";
import { goBack, navigate } from "@src/router/root";
import { Buffer } from "buffer";
import { SCREENS } from "@common/constants";

const bip39 = require("bip39");

function trimWordsStr(str: string): string {
  str = str.trim();
  // Split on the whitespace or new line.
  const splited = str.split(/\s+/);
  const words = splited
    .map((word) => word.toLowerCase().trim())
    .filter((word) => word.trim().length > 0);
  return words.join(" ");
}
const validateMnemonic = (value: string) => {
  value = trimWordsStr(value);
  if (!isPrivateKey(value)) {
    if (value.split(" ").length < 8) {
      return "Too short mnemonic";
    }

    if (!bip39.validateMnemonic(value)) {
      return "Invalid mnemonic";
    }
  } else {
    value = value.replace("0x", "");
    if (value.length !== 64) {
      return "Invalid length of private key";
    }

    try {
      if (
        Buffer.from(value, "hex").toString("hex").toLowerCase() !==
        value.toLowerCase()
      ) {
        return "Invalid private key";
      }
    } catch {
      return "Invalid private key";
    }
  }
};
export function isPrivateKey(str: string): boolean {
  if (str.startsWith("0x")) {
    return true;
  }

  if (str.length === 64) {
    try {
      return Buffer.from(str, "hex").length === 32;
    } catch {
      return false;
    }
  }
  return false;
}

export const RecoverMnemonicScreen: FunctionComponent = observer(() => {
  const { keyRingStore } = useStore();

  const intl = useIntl();
  const style = useStyle();
  const navigation = useNavigation<StackNavProp>();

  const bip44PathState = useBIP44PathState();
  const [isOpenBip44PathView, setIsOpenBip44PathView] = React.useState(false);

  const {
    control,
    handleSubmit,
    setFocus,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<{
    name: string;
    password: string;
    confirmPassword: string;
    recoveryPhrase: string;
  }>({
    mode: "onChange",
    defaultValues: {
      name: "",
      password: "",
      confirmPassword: "",
      recoveryPhrase: "",
    },
  });
  const onPaste = async () => {
    const text = await Clipboard.getString();
    if (text) {
      setValue("recoveryPhrase", text, {
        shouldValidate: true,
      });
    }
  };
  const renderMnemonic = ({ field: { onChange, onBlur, value, ref } }) => {
    return (
      <TextInput
        label=""
        returnKeyType="next"
        multiline={true}
        numberOfLines={4}
        placeholder={"Enter your recovery phrase or private key..."}
        inputContainerStyle={styles.mnemonicInput}
        bottomInInputContainer={<View />}
        style={{
          minHeight: 20 * 4,
          textAlignVertical: "top",
          ...typography["h6"],
          color: colors["neutral-text-body"],
        }}
        onSubmitEditing={() => {
          Keyboard.dismiss();
        }}
        blurOnSubmit={true}
        inputStyle={{
          ...styles.borderInput,
        }}
        error={errors.recoveryPhrase?.message}
        onBlur={onBlur}
        onChangeText={(txt) => {
          onChange(txt.toLocaleLowerCase());
        }}
        value={value}
        ref={ref}
      />
    );
  };
  const needPassword = keyRingStore.keyInfos.length === 0;
  const onSubmit = handleSubmit((data) => {
    const recoveryPhrase = trimWordsStr(data.recoveryPhrase);

    if (isPrivateKey(recoveryPhrase)) {
      const privateKey = Buffer.from(
        recoveryPhrase.trim().replace("0x", ""),
        "hex"
      );
      if (needPassword) {
        navigate(SCREENS.RegisterNewPincode, {
          walletName: data.name,
          words: recoveryPhrase,
          stepTotal: 3,
          stepPrevious: 1,
        });
        return;
      }
      navigation.reset({
        routes: [
          {
            name: "Register.FinalizeKey",
            params: {
              name: data.name,
              password: data.password,
              stepPrevious: 1,
              stepTotal: 3,
              privateKey: {
                hexValue: privateKey.toString("hex"),
                meta: {},
              },
            },
          },
        ],
      });
    } else {
      if (needPassword) {
        navigate(SCREENS.RegisterNewPincode, {
          walletName: data.name,
          words: recoveryPhrase,
          stepTotal: 3,
          stepPrevious: 1,
        });
        return;
      }
      navigation.reset({
        routes: [
          {
            name: "Register.FinalizeKey",
            params: {
              name: data.name,
              password: data.password,
              stepPrevious: 1,
              stepTotal: 3,
              mnemonic: {
                value: recoveryPhrase,
                bip44Path: bip44PathState.getPath(),
              },
            },
          },
        ],
      });
    }
  });
  const { colors } = useTheme();
  const styles = useStyle();
  const [isCreating, setIsCreating] = useState(false);
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
    //   <Gutter size={12} />
    //   <Box paddingX={8}>
    //     <XAxis>
    //       <Text
    //         style={style.flatten(["body1", "color-text-low", "margin-right-4"])}
    //       >
    //         •
    //       </Text>
    //       <Text style={style.flatten(["body1", "color-text-low"])}>
    //         <FormattedMessage id="pages.register.recover-mnemonic.paragraph-1" />
    //       </Text>
    //     </XAxis>
    //     <Gutter size={8} />
    //     <XAxis>
    //       <Text
    //         style={style.flatten(["body1", "color-text-low", "margin-right-4"])}
    //       >
    //         •
    //       </Text>
    //       <Text style={style.flatten(["body1", "color-text-low"])}>
    //         <FormattedMessage id="pages.register.recover-mnemonic.paragraph-2" />
    //       </Text>
    //     </XAxis>
    //   </Box>
    //
    //   <Gutter size={20} />
    //
    //   <Text style={style.flatten(["subtitle3", "color-label-default"])}>
    //     <FormattedMessage id="pages.register.intro-existing-user.recovery-title" />
    //   </Text>
    //
    //   <Gutter size={6} />
    //
    //   <Controller
    //     control={control}
    //     rules={{
    //       required: "Mnemonic is required",
    //       validate: (value: string) => {
    //         value = trimWordsStr(value);
    //         if (!isPrivateKey(value)) {
    //           const split = trimWordsStr(value).split(" ");
    //
    //           if (split.length < 8) {
    //             return intl.formatMessage({ id: "error.too-short-mnemonic" });
    //           }
    //
    //           const notMnemonicWords: {
    //             index: number;
    //             word: string;
    //           }[] = [];
    //
    //           for (let i = 0; i < split.length; i++) {
    //             const word = split[i];
    //             if (word) {
    //               if (!isMnemonicWord(word)) {
    //                 notMnemonicWords.push({
    //                   index: i,
    //                   word: word,
    //                 });
    //               }
    //             }
    //           }
    //
    //           if (notMnemonicWords.length > 0) {
    //             return intl.formatMessage(
    //               { id: "error.wrong-mnemonic-word" },
    //               {
    //                 index: notMnemonicWords
    //                   .map((w) => `#${w.index + 1}`)
    //                   .join(", "),
    //               }
    //             );
    //           }
    //
    //           if (!bip39.validateMnemonic(split.join(" "))) {
    //             return intl.formatMessage({ id: "error.invalid-mnemonic" });
    //           }
    //         } else {
    //           value = value.replace("0x", "");
    //           if (value.length !== 64) {
    //             return "Invalid length of private key";
    //           }
    //
    //           try {
    //             if (
    //               Buffer.from(value, "hex").toString("hex").toLowerCase() !==
    //               value.toLowerCase()
    //             ) {
    //               return "Invalid private key";
    //             }
    //           } catch {
    //             return "Invalid private key";
    //           }
    //         }
    //       },
    //     }}
    //     render={({ field: { onChange, onBlur, value } }) => {
    //       return (
    //         <React.Fragment>
    //           <Box
    //             borderWidth={
    //               errors.recoveryPhrase && errors.recoveryPhrase?.message
    //                 ? 1
    //                 : 0
    //             }
    //             borderColor={
    //               errors.recoveryPhrase && errors.recoveryPhrase?.message
    //                 ? style.get("color-yellow-400").color
    //                 : undefined
    //             }
    //             backgroundColor={style.get("color-gray-600").color}
    //             padding={16}
    //             borderRadius={8}
    //           >
    //             <NativeTextInput
    //               returnKeyType="next"
    //               multiline={true}
    //               numberOfLines={6}
    //               textAlignVertical="top"
    //               placeholder="Type your recovery phrase or private key"
    //               placeholderTextColor={style.get("color-gray-300").color}
    //               autoCorrect={false}
    //               autoComplete="off"
    //               autoCapitalize="none"
    //               underlineColorAndroid="transparent"
    //               style={{
    //                 minHeight: 120,
    //                 color: style.get("color-text-high").color,
    //               }}
    //               onChangeText={onChange}
    //               onBlur={onBlur}
    //               value={value}
    //             />
    //
    //             <Box
    //               paddingRight={9}
    //               paddingBottom={16}
    //               style={{
    //                 position: "absolute",
    //                 bottom: 0,
    //                 right: 0,
    //               }}
    //             >
    //               <OWButton
    //                 fullWidth={false}
    //                 type={"link"}
    //                 label={"Paste"}
    //                 size="large"
    //                 onPress={async () => {
    //                   let wasAutoLockEnabled =
    //                     uiConfigStore.autoLockConfig.isEnableAutoLock;
    //                   if (Platform.OS === "ios") {
    //                     if (wasAutoLockEnabled) {
    //                       await uiConfigStore.autoLockConfig.disableAutoLock();
    //                     }
    //                   }
    //                   try {
    //                     const text = await Clipboard.getString();
    //                     if (text) {
    //                       setValue("recoveryPhrase", text, {
    //                         shouldValidate: true,
    //                       });
    //
    //                       setFocus("name");
    //                     }
    //                   } finally {
    //                     if (Platform.OS === "ios") {
    //                       if (wasAutoLockEnabled) {
    //                         await uiConfigStore.autoLockConfig.enableAutoLock();
    //                       }
    //                     }
    //                   }
    //                 }}
    //               />
    //             </Box>
    //           </Box>
    //
    //           {errors.recoveryPhrase && errors.recoveryPhrase?.message ? (
    //             <Text
    //               style={style.flatten([
    //                 "text-caption2",
    //                 "color-yellow-400",
    //                 "padding-top-4",
    //                 "padding-left-6",
    //               ])}
    //             >
    //               {errors.recoveryPhrase?.message}
    //             </Text>
    //           ) : null}
    //         </React.Fragment>
    //       );
    //     }}
    //     name="recoveryPhrase"
    //   />
    //
    //   <Gutter size={16} />
    //
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
    //   <VerticalCollapseTransition collapsed={isOpenBip44PathView}>
    //     <Box alignX="center">
    //       <OWButton
    //         label={intl.formatMessage({ id: "button.advanced" })}
    //         size={"small"}
    //         type={"secondary"}
    //         onPress={() => {
    //           setIsOpenBip44PathView(true);
    //         }}
    //       />
    //     </Box>
    //   </VerticalCollapseTransition>
    //   {
    //     <VerticalCollapseTransition collapsed={!isOpenBip44PathView}>
    //       <Bip44PathView
    //         state={bip44PathState}
    //         setIsOpen={setIsOpenBip44PathView}
    //       />
    //     </VerticalCollapseTransition>
    //   }
    //
    //   <Gutter size={16} />
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
            Enter recovery phrase or private key
          </OWText>

          <View
            style={{
              paddingLeft: 20,
              paddingRight: 20,
              paddingTop: 32,
            }}
          />
          <Controller
            control={control}
            rules={{
              required: "recoveryPhrase is required",
              validate: validateMnemonic,
            }}
            render={renderMnemonic}
            name="recoveryPhrase"
            defaultValue=""
          />

          <View style={styles.paste}>
            <TouchableOpacity
              style={styles.pasteBtn}
              onPress={() => {
                onPaste();
              }}
            >
              <OWIcon
                size={20}
                name="mnemo"
                color={colors["primary-text-action"]}
              />
              <OWText
                style={{ paddingLeft: 4 }}
                variant="h2"
                weight="600"
                size={14}
                color={colors["primary-text-action"]}
              >
                Paste from clipboard
              </OWText>
            </TouchableOpacity>
          </View>
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
            loading={isCreating}
            disabled={isCreating}
            onPress={onSubmit}
          />
        </View>
      </View>
    </View>
  );
});
const useStyle = () => {
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
      alignItems: "center",
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
