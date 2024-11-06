import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
} from "react";
import { observer } from "mobx-react-lite";
import { useIntl } from "react-intl";
import { useStyle } from "../../../styles";
import { Box } from "../../../components/box";
import {
  Clipboard,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Mnemonic } from "@owallet/crypto";
import LottieView from "lottie-react-native";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { OWButton } from "@components/button";
import OWIcon from "@components/ow-icon/ow-icon";
import OWText from "@components/text/ow-text";
import { Controller, useForm } from "react-hook-form";
import { useTheme } from "@src/themes/theme-provider";
import { metrics } from "@src/themes";
import { goBack, navigate } from "@src/router/root";
import { useSimpleTimer } from "@src/hooks";
import { BackupWordChip } from "@components/mnemonic";
import { CheckIcon } from "@components/icon";
import { SCREENS } from "@common/constants";
import { WarningBox } from "@components/guide-box";
import { Gutter } from "@components/gutter";

type WordsType = "12words" | "24words";

export const NewMnemonicScreen: FunctionComponent = observer(() => {
  const intl = useIntl();
  const style = useStyle();
  const navigation = useNavigation<StackNavProp>();

  const [words, setWords] = useState<string[]>([]);
  const [wordsType, setWordsType] = useState<WordsType>("12words");
  const onGoBack = () => {
    goBack();
  };
  useEffect(() => {
    const rng = (array: any) => {
      return Promise.resolve(crypto.getRandomValues(array));
    };

    if (wordsType === "12words") {
      Mnemonic.generateSeed(rng, 128).then((str) => setWords(str.split(" ")));
    } else if (wordsType === "24words") {
      Mnemonic.generateSeed(rng, 256).then((str) => setWords(str.split(" ")));
    } else {
      throw new Error(`Unknown words type: ${wordsType}`);
    }
  }, [wordsType]);
  const styles = useStyles();
  const { colors } = useTheme();
  const {
    control,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<FormData>();

  const submit = handleSubmit(() => {
    navigation.navigate(SCREENS.RegisterVerifyMnemonic, {
      mnemonic: words.join(" "),
      stepPrevious: 1,
      stepTotal: 3,
    });
  });
  // const renderWalletName = ({ field: { onChange, onBlur, value, ref } }) => {
  //   return (
  //       <TextInput
  //           label=""
  //           topInInputContainer={
  //             <View style={{ paddingBottom: 4 }}>
  //               <OWText>Wallet Name</OWText>
  //             </View>
  //           }
  //           returnKeyType="next"
  //           inputStyle={{
  //             width: metrics.screenWidth - 32,
  //             borderColor: colors["neutral-border-strong"],
  //           }}
  //           style={{ fontWeight: "600", paddingLeft: 4, fontSize: 15 }}
  //           inputLeft={
  //             <OWIcon
  //                 size={20}
  //                 name="wallet-outline"
  //                 color={colors["primary-text-action"]}
  //             />
  //           }
  //           error={errors.name?.message}
  //           onBlur={onBlur}
  //           onChangeText={onChange}
  //           value={value}
  //           ref={ref}
  //           onSubmitEditing={submit}
  //       />
  //   );
  // };
  return (
    <View style={styles.container}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity onPress={onGoBack} style={styles.goBack}>
          <OWIcon
            size={16}
            color={colors["neutral-icon-on-light"]}
            name="arrow-left"
          />
        </TouchableOpacity>

        <View style={[styles.aic, styles.title]}>
          <OWText variant="heading" style={{ textAlign: "center" }} typo="bold">
            Secure your wallet
          </OWText>
          <OWText
            variant={"body2"}
            size={14}
            color={colors["neutral-text-body"]}
            style={{
              textAlign: "center",
              paddingTop: 10,
            }}
          >
            Write down this recovery phrase in the exact order and keep it in a
            safe place
          </OWText>

          <View
            style={{
              paddingLeft: 20,
              paddingRight: 20,
              paddingTop: 32,
            }}
          />
          <WordsCard words={words} />
        </View>
      </ScrollView>

      <View style={styles.aic}>
        <View style={styles.signIn}>
          <OWButton
            style={{
              borderRadius: 32,
            }}
            textStyle={{ color: colors["neutral-text-action-on-dark-bg"] }}
            // label={mode === "add" ? "Import" : " Next"}
            label={"Ok, I Saved it!"}
            onPress={submit}
          />
        </View>
      </View>
    </View>
  );
});

const MnemonicTag: FunctionComponent<{ index: number; word: string }> = ({
  index,
  word,
}) => {
  const style = useStyle();

  return (
    <Box
      paddingX={12}
      paddingY={4}
      borderRadius={8}
      borderWidth={2}
      borderColor={style.get("color-gray-500").color}
    >
      <Text style={style.flatten(["subtitle2", "color-white"])}>{`${
        index + 1
      }. ${word}`}</Text>
    </Box>
  );
};

export const CopyToClipboard: FunctionComponent<{ text: string }> = ({
  text,
}) => {
  const intl = useIntl();
  const style = useStyle();
  const [hasCopied, setHasCopied] = useState(false);

  return (
    <OWButton
      label={
        hasCopied
          ? intl.formatMessage({
              id: "pages.register.components.copy-to-clipboard.button-after",
            })
          : intl.formatMessage({
              id: "pages.register.components.copy-to-clipboard.button-before",
            })
      }
      textStyle={{
        color: style.flatten([hasCopied ? "color-green-400" : "color-gray-50"])
          .color,
      }}
      size="large"
      onPress={async () => {
        await Clipboard.setString(text);

        setHasCopied(true);

        setTimeout(() => {
          setHasCopied(false);
        }, 1000);
      }}
      iconRight={
        hasCopied ? (
          <LottieView
            source={require("@assets/animations/loading_owallet.json")}
            loop={false}
            autoPlay
            style={style.flatten(["width-20", "height-20"])}
          />
        ) : undefined
      }
    />
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
