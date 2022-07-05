import React, { FunctionComponent, useEffect, useState } from 'react';
import { PageWithScrollView } from '../../../components/page';
import { View } from 'react-native';
import { CText as Text } from '../../../components/text';
import { WordChip } from '../../../components/mnemonic';
import { Button } from '../../../components/button';
import { RouteProp, useRoute } from '@react-navigation/native';
import { useSmartNavigation } from '../../../navigation.provider';
import { NewMnemonicConfig } from './hook';
import { RegisterConfig } from '@owallet/hooks';
import { observer } from 'mobx-react-lite';
import { RectButton } from '../../../components/rect-button';
import { BIP44HDPath } from '@owallet/background';
import { useStore } from '../../../stores';
import {
  navigate,
  checkRouter,
  checkRouterPaddingBottomBar
} from '../../../router/root';
import { colors, typography } from '../../../themes';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { LoadingSpinner } from '../../../components/spinner';

export const VerifyMnemonicScreen: FunctionComponent = observer(() => {
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

  const smartNavigation = useSmartNavigation();

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
    const words = newMnemonicConfig.mnemonic.split(' ');
    const randomSortedWords = words.slice().sort(() => {
      return Math.random() > 0.5 ? 1 : -1;
    });
    setCandidateWords(randomSortedWords.map(word => {
      return {
        word,
        usedIndex: -1
      }
    }))
    setWordSet(
      newMnemonicConfig.mnemonic.split(' ').map(() => {
        return undefined;
      })
    );
  }, [newMnemonicConfig.mnemonic]);

  const firstEmptyWordSetIndex = wordSet.findIndex(
    (word) => word === undefined
  );

  const [isCreating, setIsCreating] = useState(false);

  return (
    <PageWithScrollView
      contentContainerStyle={{
        display: 'flex'
      }}
      style={{
        paddingLeft: 20,
        paddingRight: 20
      }}
    >
      <Text
        style={{
          ...typography['h5'],
          color: colors['text-black-medium'],
          marginTop: 32,
          marginBottom: 4,
        }}
      >
        Confirm your mnemonic
      </Text>
      <WordsCard
        wordSet={wordSet.map((word, i) => {
          return {
            word: word ?? '',
            empty: word === undefined,
            dashed: i === firstEmptyWordSetIndex
          };
        })}
      />
      <View
        style={{
          display: 'flex',
          flexDirection: 'row',
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
          flex: 1
        }}
      />
      <TouchableOpacity
        //  loading={isCreating}
        disabled={wordSet.join(' ') !== newMnemonicConfig.mnemonic}
        onPress={async () => {
          if (isCreating) return;
          setIsCreating(true);
          await registerConfig.createMnemonic(
            newMnemonicConfig.name,
            newMnemonicConfig.mnemonic,
            newMnemonicConfig.password,
            route.params.bip44HDPath
          );
          analyticsStore.setUserProperties({
            registerType: 'seed',
            accountType: 'mnemonic'
          });
          if (checkRouter(props?.route?.name, 'RegisterVerifyMnemonicMain')) {
            navigate('RegisterEnd', {
              password: newMnemonicConfig.password,
              type: 'new'
            });
          } else {
            smartNavigation.reset({
              index: 0,
              routes: [
                {
                  name: 'Register.End',
                  params: {
                    password: newMnemonicConfig.password,
                    type: 'new'
                  }
                }
              ]
            });
          }
        }}
        style={{
          marginBottom: 24,
          marginTop: 32,
          backgroundColor: colors['purple-900'],
          borderRadius: 8
        }}
      >
        {isCreating ? (
          <View style={{ padding: 16, alignItems: 'center' }}>
            <LoadingSpinner color={colors['white']} size={20} />
          </View>
        ) : (
          <Text
            style={{
              color: colors['white'],
              textAlign: 'center',
              fontWeight: '700',
              fontSize: 16,
              padding: 16
            }}
          >
            Next
          </Text>
        )}
      </TouchableOpacity>
      {/* Mock element for bottom padding */}
      <View
        style={{
          height: 20
        }}
      />
    </PageWithScrollView>
  );
});

const WordButton: FunctionComponent<{
  word: string;
  used: boolean;
  onPress: () => void;
}> = ({ word, used, onPress }) => {
  return (
    <RectButton
      style={{
        backgroundColor: used ? colors['gray-10'] : colors['white'],
        paddingTop: 4,
        paddingBottom: 4,
        paddingLeft: 12,
        paddingRight: 12,
        marginRight: 12,
        marginBottom: 12,
        borderRadius: 8,
        borderWidth: used ? 0 : 1,
        borderColor: used ? colors['gray-10'] : colors['purple-900']
      }}
      onPress={onPress}
    >
      <Text
        style={{
          ...typography['subtitle2'],
          color: colors['purple-900'],
          fontSize: 14,
          fontWeight: '700',
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

  return (
    <View
      style={{
        marginTop: 14,
        marginBottom: 16,
        paddingTop: 10,
        paddingBottom: 10,
        paddingLeft: 24,
        paddingRight: 24,
        borderColor: colors['purple-100'],
        borderWidth: 1,
        borderRadius: 8,
        display: 'flex',
        flexDirection: 'row',
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
          />
        );
      })}
    </View>
  );
};
