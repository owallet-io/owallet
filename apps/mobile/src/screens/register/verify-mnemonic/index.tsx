import React, { FunctionComponent, useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
import {
  InteractionManager,
  Platform,
  StyleSheet,
  Text,
  TextInput as NativeTextInput,
  View,
} from "react-native";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { FormattedMessage, useIntl } from "react-intl";
import { useStyle } from "../../../styles";
import { Gutter } from "../../../components/gutter";
import { XAxis } from "../../../components/axis";
import { TextInput } from "../../../components/input";
import { Controller, useForm } from "react-hook-form";
import { useEffectOnce } from "@hooks/use-effect-once";
import { goBack, navigate, RootStackParamList } from "@src/router/root";
import { OWButton } from "@components/button";
import { useTheme } from "@src/themes/theme-provider";
import { RectButton, ScrollView } from "react-native-gesture-handler";
import { TouchableOpacity } from "@gorhom/bottom-sheet";
import OWIcon from "@components/ow-icon/ow-icon";
import OWText from "@components/text/ow-text";
import { metrics, spacing, typography } from "@src/themes";
import { SCREENS } from "@common/constants";
import { useStore } from "@src/stores";
import { useBIP44PathState } from "@screens/register/components/bip-path-44";

export const VerifyMnemonicScreen: FunctionComponent = observer(() => {
  const intl = useIntl();
  const style = useStyle();
  const route =
    useRoute<RouteProp<RootStackParamList, "Register.VerifyMnemonic">>();
  const bip44PathState = useBIP44PathState();
  const navigation = useNavigation<StackNavProp>();
  const { keyRingStore } = useStore();
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

  const [inputs, setInputs] = useState<Record<number, string | undefined>>({});
  const [validatingStarted, setValidatingStarted] = useState<boolean>(false);

  const firstWordInputRef = React.useRef<NativeTextInput>(null);
  useEffectOnce(() => {
    InteractionManager.runAfterInteractions(() => {
      firstWordInputRef.current?.focus();
    });
  });
  const secondWordInputRef = React.useRef<NativeTextInput>(null);

  const verifyingWords = useMemo(() => {
    if (route.params.mnemonic?.trim() === "") {
      throw new Error(
        intl.formatMessage({
          id: "pages.register.verify-mnemonic.mnemonic-empty-error",
        })
      );
    }

    const words = route.params.mnemonic?.split(" ").map((w) => w.trim()) ?? [];
    const num = words.length;
    const one = Math.floor(Math.random() * num);
    const two = (() => {
      let r = Math.floor(Math.random() * num);
      while (r === one) {
        r = Math.floor(Math.random() * num);
      }
      return r;
    })();

    return [
      {
        index: one,
        word: words[one],
      },
      {
        index: two,
        word: words[two],
      },
    ].sort((word1, word2) => {
      return word1.index < word2.index ? -1 : 1;
    });
  }, [intl, route.params.mnemonic]);

  const validate = () => {
    setValidatingStarted(true);

    for (const word of verifyingWords) {
      if (inputs[word.index]?.trim() !== word.word) {
        return false;
      }
    }

    return true;
  };
  const needPassword = keyRingStore.keyInfos.length === 0;
  const onSubmit = handleSubmit((data) => {
    console.log(data, "data");
    console.log(validate(), "validate()");
    if (validate()) {
      if (needPassword) {
        navigate(SCREENS.RegisterNewPincode, {
          walletName: data.name,
          words: route.params.mnemonic,
          stepTotal: route.params.stepTotal,
          stepPrevious: route.params.stepPrevious,
        });
        return;
      }
      navigation.reset({
        routes: [
          {
            name: "Register.FinalizeKey",
            params: {
              name: data.name,
              password: "",
              stepPrevious: route.params.stepPrevious + 1,
              stepTotal: route.params.stepTotal,
              mnemonic: {
                value: route.params.mnemonic,
                bip44Path: bip44PathState.getPath(),
                isFresh: true,
              },
            },
          },
        ],
      });
    }
  });
  const { colors } = useTheme();
  const styles = useStyles();
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
        placeholder={"Your name"}
        error={errors.name?.message}
        onBlur={onBlur}
        onChangeText={onChange}
        value={value}
        ref={ref}
        onSubmitEditing={onSubmit}
      />
    );
  };
  return (
    <View style={styles.container}>
      <ScrollView>
        <TouchableOpacity onPress={goBack} style={styles.goBack}>
          <OWIcon
            size={16}
            color={colors["neutral-icon-on-light"]}
            name="arrow-left"
          />
        </TouchableOpacity>
        <View
          style={[
            styles.aic,
            styles.title,
            {
              paddingHorizontal: 20,
            },
          ]}
        >
          <OWText variant="heading" style={{ textAlign: "center" }} typo="bold">
            Verify recovery phrase
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
            The purpose of this process is to ensure that you have written down
            your recovery phrase.
          </OWText>

          <View
            style={{
              alignItems: "center",
              paddingVertical: 16,
            }}
          >
            {verifyingWords.map(({ index, word }, i) => {
              return (
                <XAxis alignY="center" key={index}>
                  <OWText
                    style={{
                      ...style.flatten(["subtitle2"]),
                      color: colors["neutral-text-title"],
                    }}
                  >
                    <FormattedMessage
                      id="pages.register.verify-mnemonic.verifying-box.word"
                      values={{ index: index + 1 }}
                    />
                  </OWText>

                  <Gutter size={16} />

                  <TextInput
                    ref={i === 0 ? firstWordInputRef : secondWordInputRef}
                    autoCapitalize="none"
                    containerStyle={{ width: 120 }}
                    onChangeText={(text) => {
                      setInputs({
                        ...inputs,
                        [index]: text,
                      });
                    }}
                    errorBorder={(() => {
                      if (validatingStarted) {
                        return inputs[index]?.trim() !== word;
                      }
                      return false;
                    })()}
                    returnKeyType={"next"}
                    onSubmitEditing={() => {
                      if (i === 0) {
                        secondWordInputRef.current?.focus();
                      } else {
                        setFocus("name");
                      }
                    }}
                  />
                </XAxis>
              );
            })}
          </View>
          <Controller
            control={control}
            rules={{
              required: "Name is required",
            }}
            render={renderWalletName}
            name={"name"}
          />
        </View>
      </ScrollView>

      <View style={styles.aic}>
        <View style={styles.signIn}>
          <OWButton
            style={{
              borderRadius: 32,
            }}
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
    titleHeaderView: {
      fontSize: 24,
      lineHeight: 34,
      fontWeight: "700",
      color: colors["text-title-login"],
    },
    headerView: {
      height: 72,
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    containerContentScroll: {
      paddingTop: Platform.OS == "android" ? 50 : 0,
      paddingHorizontal: spacing["page-pad"],
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
      // alignItems: "center",
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
  });
};
