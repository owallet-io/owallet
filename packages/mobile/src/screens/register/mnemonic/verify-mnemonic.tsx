import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
} from "react";
import { PageWithScrollView } from "../../../components/page";
import { Platform, StyleSheet, View } from "react-native";
import { Text } from "@src/components/text";
import { WordChip } from "../../../components/mnemonic";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { useTheme } from "@src/themes/theme-provider";
import { NewMnemonicConfig } from "./hook";
import { RegisterConfig } from "@owallet/hooks";
import { observer } from "mobx-react-lite";
import { RectButton } from "../../../components/rect-button";
import { BIP44HDPath } from "@owallet/types";
import { useStore } from "../../../stores";
import { navigate, checkRouter } from "../../../router/root";
import { spacing, typography } from "../../../themes";
import { OWalletLogo } from "../owallet-logo";
import OWButton from "@src/components/button/OWButton";
import { SCREENS } from "@src/common/constants";
import { LRRedact } from "@logrocket/react-native";

export const VerifyMnemonicScreen: FunctionComponent = observer((props) => {
  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          registerConfig: RegisterConfig;
          newMnemonicConfig: NewMnemonicConfig;
          bip44HDPath: BIP44HDPath;
        }
      >,
      string
    >
  >();

  const { analyticsStore } = useStore();
  const { colors } = useTheme();

  // const smartNavigation = useSmartNavigation();
  const navigation = useNavigation();
  const registerConfig = route.params.registerConfig;
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

  const [isCreating, setIsCreating] = useState(false);
  const styles = useStyles();
  const onVerifyMnemonic = useCallback(async () => {
    if (isCreating) return;
    setIsCreating(true);
    await registerConfig.createMnemonic(
      newMnemonicConfig.name,
      newMnemonicConfig.mnemonic,
      newMnemonicConfig.password,
      route.params.bip44HDPath
    );

    analyticsStore.setUserProperties({
      registerType: "seed",
      accountType: "mnemonic",
    });
    if (checkRouter(props?.route?.name, "RegisterVerifyMnemonicMain")) {
      navigate(SCREENS.RegisterDone, {
        password: newMnemonicConfig.password,
        type: "new",
      });
    } else {
      navigation.reset({
        index: 0,
        routes: [
          {
            name: "Register.Done",
            params: {
              password: newMnemonicConfig.password,
              type: "new",
            },
          },
        ],
      });
    }
  }, [newMnemonicConfig, isCreating]);
  return (
    <PageWithScrollView
      contentContainerStyle={styles.containerContentScroll}
      backgroundColor={colors["plain-background"]}
    >
      <LRRedact>
        <View style={styles.headerView}>
          <Text style={styles.titleHeaderView}>Create new wallet</Text>
          <View>
            <OWalletLogo size={72} />
          </View>
        </View>
        <Text
          style={{
            ...typography["h7"],
            color: colors["text-label-input"],
            marginTop: 32,
            marginBottom: 4,
          }}
        >
          Confirm your mnemonic
        </Text>
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

        <OWButton
          label="Next"
          loading={isCreating}
          disabled={wordSet.join(" ") !== newMnemonicConfig.mnemonic}
          onPress={onVerifyMnemonic}
        />

        <OWButton
          label="Go back"
          type="link"
          onPress={() => {
            navigation.goBack();
          }}
        />
        {/* Mock element for bottom padding */}
        <View
          style={{
            height: 20,
          }}
        />
      </LRRedact>
    </PageWithScrollView>
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
          <WordChip
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
  });
};
