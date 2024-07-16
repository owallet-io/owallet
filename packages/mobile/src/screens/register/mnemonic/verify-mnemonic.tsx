import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";
import { Text } from "@src/components/text";
import { BackupWordChip } from "../../../components/mnemonic";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { useTheme } from "@src/themes/theme-provider";
import { NewMnemonicConfig } from "./hook";
import { RegisterConfig } from "@owallet/hooks";
import { observer } from "mobx-react-lite";
import { RectButton } from "../../../components/rect-button";
import { BIP44HDPath } from "@owallet/types";
import { navigate } from "../../../router/root";
import { metrics, spacing, typography } from "../../../themes";
import OWButton from "@src/components/button/OWButton";
import { SCREENS } from "@src/common/constants";
import OWIcon from "@src/components/ow-icon/ow-icon";
import OWText from "@src/components/text/ow-text";
import { showToast } from "@src/utils/helper";

export const VerifyMnemonicScreen: FunctionComponent = observer((props) => {
  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          registerConfig: RegisterConfig;
          newMnemonicConfig: NewMnemonicConfig;
          bip44HDPath: BIP44HDPath;
          walletName?: string;
        }
      >,
      string
    >
  >();

  const { colors } = useTheme();

  // const smartNavigation = useSmartNavigation();
  const navigation = useNavigation();
  const registerConfig = route.params.registerConfig;
  const walletName = route.params.walletName;
  const newMnemonicConfig = route.params.newMnemonicConfig;

  const [candidateWords, setCandidateWords] = useState<
    {
      word: string;
      usedIndex: number;
    }[]
  >([]);
  const [wordSet, setWordSet] = useState<(string | undefined)[]>([]);

  useEffect(() => {
    const words = newMnemonicConfig.mnemonic.split(" ");
    const randomSortedWords = words.slice().sort(() => {
      return Math.random() > 0.5 ? 1 : -1;
    });
    setCandidateWords(
      randomSortedWords.map((word) => {
        return {
          word,
          usedIndex: -1,
        };
      })
    );
    setWordSet(
      newMnemonicConfig.mnemonic.split(" ").map(() => {
        return undefined;
      })
    );
  }, [newMnemonicConfig.mnemonic]);

  const firstEmptyWordSetIndex = wordSet.findIndex(
    (word) => word === undefined
  );

  const styles = useStyles();

  const onVerifyMnemonic = async () => {
    if (wordSet.join(" ") === newMnemonicConfig.mnemonic) {
      navigate(SCREENS.RegisterNewPincode, {
        registerConfig,
        walletName: walletName,
        words: newMnemonicConfig.mnemonic,
      });
    } else {
      showToast({
        message: "Mnemonic is not match",
        type: "danger",
      });
      return;
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.goBack}
        >
          <OWIcon
            size={16}
            color={colors["neutral-icon-on-light"]}
            name="arrow-left"
          />
        </TouchableOpacity>
        <View style={[styles.aic, styles.title]}>
          <OWText variant="heading" style={{ textAlign: "center" }} typo="bold">
            Confirm your mnemonic
          </OWText>

          <View
            style={{
              paddingLeft: 20,
              paddingRight: 20,
              paddingTop: 32,
            }}
          />
          <WordsCard
            wordSet={wordSet.map((word, i) => {
              return {
                word: word ?? "",
                empty: word === undefined,
                dashed: i === firstEmptyWordSetIndex,
              };
            })}
          />
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              flexWrap: "wrap",
            }}
          >
            {candidateWords.map(({ word, usedIndex }, i) => {
              return (
                <WordButton
                  key={i.toString()}
                  word={word}
                  used={usedIndex >= 0}
                  onPress={() => {
                    const newWordSet = wordSet.slice();
                    const newCandiateWords = candidateWords.slice();
                    if (usedIndex < 0) {
                      if (firstEmptyWordSetIndex < 0) {
                        return;
                      }

                      newWordSet[firstEmptyWordSetIndex] = word;
                      setWordSet(newWordSet);

                      newCandiateWords[i].usedIndex = firstEmptyWordSetIndex;
                      setCandidateWords(newCandiateWords);
                    } else {
                      newWordSet[usedIndex] = undefined;
                      setWordSet(newWordSet);

                      newCandiateWords[i].usedIndex = -1;
                      setCandidateWords(newCandiateWords);
                    }
                  }}
                />
              );
            })}
          </View>
          <View
            style={{
              flex: 1,
            }}
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
            onPress={() => {
              onVerifyMnemonic();
            }}
          />
        </View>
      </View>
    </View>
  );
});

const WordButton: FunctionComponent<{
  word: string;
  used: boolean;
  onPress: () => void;
}> = ({ word, used, onPress }) => {
  const { colors } = useTheme();

  return (
    <RectButton
      style={{
        backgroundColor: used
          ? colors["background-btn-mnemonic-active"]
          : colors["background-container"],
        paddingTop: 4,
        paddingBottom: 4,
        paddingLeft: 12,
        paddingRight: 12,
        marginRight: 12,
        marginBottom: 12,
        borderRadius: 8,
        borderWidth: used ? 0 : 1,
        borderColor: used
          ? colors["background-container"]
          : colors["btn-mnemonic"],
      }}
      onPress={onPress}
    >
      <Text
        style={{
          ...typography["subtitle2"],
          color: colors["btn-mnemonic"],
          fontSize: 14,
          fontWeight: "700",
        }}
      >
        {word}
      </Text>
    </RectButton>
  );
};

const WordsCard: FunctionComponent<{
  wordSet: {
    word: string;
    empty: boolean;
    dashed: boolean;
  }[];
}> = ({ wordSet }) => {
  const { colors } = useTheme();

  return (
    <View
      style={{
        marginTop: 14,
        marginBottom: 16,
        paddingTop: 10,
        paddingBottom: 10,
        paddingLeft: 24,
        paddingRight: 24,
        borderColor: colors["border-input-login"],
        borderWidth: 1,
        borderRadius: 8,
        display: "flex",
        flexDirection: "row",
        flexWrap: "wrap",
      }}
    >
      {wordSet.map((word, i) => {
        return (
          <BackupWordChip
            key={i.toString()}
            index={i + 1}
            word={word.word}
            empty={word.empty}
            dashedBorder={word.dashed}
            colors={colors}
          />
        );
      })}
    </View>
  );
};

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
  });
};
