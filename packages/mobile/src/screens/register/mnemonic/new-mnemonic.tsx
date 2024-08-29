import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
} from "react";
import { View, StyleSheet, Clipboard, TouchableOpacity } from "react-native";
import { observer } from "mobx-react-lite";
import { RouteProp, useIsFocused, useRoute } from "@react-navigation/native";
import { useTheme } from "@src/themes/theme-provider";
import { RegisterConfig } from "@owallet/hooks";
import { useNewMnemonicConfig } from "./hook";
import { CheckIcon } from "../../../components/icon";
import { BackupWordChip } from "../../../components/mnemonic";
import { TextInput } from "../../../components/input";
import { Controller, useForm } from "react-hook-form";

import { useSimpleTimer } from "../../../hooks";
import { useBIP44Option } from "../bip44";
import { navigate, checkRouter, goBack } from "../../../router/root";
import OWButton from "../../../components/button/OWButton";
import OWIcon from "../../../components/ow-icon/ow-icon";
import { metrics } from "../../../themes";
import OWText from "@src/components/text/ow-text";
import { tracking } from "@src/utils/tracking";
import { SCREENS } from "@src/common/constants";

interface FormData {
  name: string;
  password: string;
  confirmPassword: string;
}

export const NewMnemonicScreen: FunctionComponent = observer((props) => {
  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          registerConfig: RegisterConfig;
        }
      >,
      string
    >
  >();
  useEffect(() => {
    tracking(`Create Wallet Screen`);
    return () => {};
  }, []);

  const { colors } = useTheme();

  const registerConfig: RegisterConfig = route.params.registerConfig;
  const bip44Option = useBIP44Option();

  const newMnemonicConfig = useNewMnemonicConfig(registerConfig);
  const [mode] = useState(registerConfig.mode);

  const words = newMnemonicConfig.mnemonic.split(" ");

  const {
    control,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<FormData>();

  const submit = handleSubmit(() => {
    if (checkRouter(props?.route?.name, "RegisterMain")) {
      navigate("RegisterVerifyMnemonicMain", {
        registerConfig,
        newMnemonicConfig,
        bip44HDPath: bip44Option.bip44HDPath,
      });
    } else {
      navigate(SCREENS.RegisterVerifyMnemonic, {
        registerConfig,
        newMnemonicConfig,
        bip44HDPath: bip44Option.bip44HDPath,
        walletName: getValues("name"),
      });
    }
  });
  const onGoBack = () => {
    if (checkRouter(props?.route?.name, "RegisterMain")) {
      goBack();
    } else {
      navigate(SCREENS.RegisterIntro);
    }
  };

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
        onSubmitEditing={submit}
      />
    );
  };

  const styles = useStyles();

  return (
    <View style={styles.container}>
      <View>
        <TouchableOpacity onPress={onGoBack} style={styles.goBack}>
          <OWIcon
            size={16}
            color={colors["neutral-icon-on-light"]}
            name="arrow-left"
          />
        </TouchableOpacity>
        <View style={[styles.aic, styles.title]}>
          <OWText variant="heading" style={{ textAlign: "center" }} typo="bold">
            Create new wallet
          </OWText>

          <View
            style={{
              paddingLeft: 20,
              paddingRight: 20,
              paddingTop: 32,
            }}
          />
          <WordsCard words={words} />
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
      </View>

      <View style={styles.aic}>
        <View style={styles.signIn}>
          <OWButton
            style={{
              borderRadius: 32,
            }}
            label={mode === "add" ? "Import" : " Next"}
            onPress={submit}
          />
        </View>
      </View>
    </View>
  );
});

const WordsCard: FunctionComponent<{
  words: string[];
}> = ({ words }) => {
  const { isTimedOut, setTimer } = useSimpleTimer();
  const { colors } = useTheme();
  /*
    On IOS, user can peek the words by right side gesture from the verifying mnemonic screen.
    To prevent this, hide the words if the screen lost the focus.
   */
  const [hideWord, setHideWord] = useState(false);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      setHideWord(false);
    } else {
      const timeout = setTimeout(() => {
        setHideWord(true);
      }, 500);

      return () => clearTimeout(timeout);
    }
  }, [isFocused]);
  const onCopy = useCallback(() => {
    Clipboard.setString(words.join(" "));
    setTimer(3000);
  }, [words]);
  const styles = useStyles();
  return (
    <View style={styles.containerWord}>
      {words.map((word, i) => {
        return (
          <BackupWordChip
            key={i.toString()}
            index={i + 1}
            word={word}
            hideWord={hideWord}
            colors={colors}
          />
        );
      })}

      <View style={styles.containerBtnCopy}>
        <View
          style={{
            flex: 1,
          }}
        />
        <OWButton
          style={styles.padIcon}
          onPress={onCopy}
          icon={
            isTimedOut ? (
              <CheckIcon />
            ) : (
              <OWIcon
                name="copy"
                color={colors["icon-primary-surface-default-gray"]}
                size={20}
              />
            )
          }
          type="link"
        />
      </View>
    </View>
  );
};

const useStyles = () => {
  const { colors } = useTheme();
  return StyleSheet.create({
    mockView: {
      height: 20,
    },
    padIcon: {
      paddingLeft: 10,
      width: "auto",
    },
    icon: {
      width: 22,
      height: 22,
      tintColor: colors["icon-primary-surface-default-gray"],
    },
    containerBtnCopy: {
      width: "100%",
      display: "flex",
      flexDirection: "row",
      justifyContent: "flex-end",
      alignItems: "center",
    },
    containerWord: {
      marginTop: 14,
      marginBottom: 16,
      paddingTop: 16,
      paddingLeft: 16,
      paddingRight: 16,
      paddingBottom: 10,
      borderColor: colors["border-purple-100-gray-800"],
      borderWidth: 1,
      borderRadius: 8,
      display: "flex",
      flexDirection: "row",
      flexWrap: "wrap",
    },

    headerContainer: {
      height: 72,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
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
    goBack: {
      backgroundColor: colors["neutral-surface-action3"],
      borderRadius: 999,
      width: 44,
      height: 44,
      alignItems: "center",
      justifyContent: "center",
      marginLeft: 16,
    },
    borderInput: {
      borderColor: colors["border-purple-100-gray-800"],
      backgroundColor: "transparent",
      borderWidth: 1,
      paddingLeft: 11,
      paddingRight: 11,
      paddingTop: 12,
      paddingBottom: 12,
      borderRadius: 8,
    },
    title: {
      paddingHorizontal: 16,
      paddingTop: 24,
    },
    input: {
      width: metrics.screenWidth - 32,
      borderColor: colors["neutral-border-strong"],
    },
    textInput: { fontWeight: "600", paddingLeft: 4, fontSize: 15 },
  });
};
