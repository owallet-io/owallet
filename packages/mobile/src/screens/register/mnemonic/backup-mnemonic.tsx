import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, Clipboard, TouchableOpacity } from 'react-native';
import { observer } from 'mobx-react-lite';
import { RouteProp, useIsFocused, useRoute } from '@react-navigation/native';
import { useTheme } from '@src/themes/theme-provider';
import { BackupWordChip } from '../../../components/mnemonic';
import { useSmartNavigation } from '../../../navigation.provider';
import OWButton from '../../../components/button/OWButton';
import OWIcon from '../../../components/ow-icon/ow-icon';
import { metrics } from '../../../themes';
import OWText from '@src/components/text/ow-text';
import { useSimpleTimer } from '@src/hooks';
import { CheckIcon, CopyFillIcon } from '@src/components/icon';

export const BackupMnemonicScreen: FunctionComponent = observer(props => {
  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          privateData: string;
          privateDataType: string;
        }
      >,
      string
    >
  >();
  const { colors } = useTheme();
  const smartNavigation = useSmartNavigation();

  const { isTimedOut, setTimer } = useSimpleTimer();
  const privateData = route.params.privateData;
  const privateDataType = route.params.privateDataType;
  const words = privateData.split(' ');

  const onCopy = useCallback(() => {
    Clipboard.setString(words.join(' '));
    setTimer(2000);
  }, [words]);

  const styles = useStyles();

  const onGoBack = () => {
    smartNavigation.goBack();
  };

  return (
    <View style={styles.container}>
      <View>
        <TouchableOpacity onPress={onGoBack} style={styles.goBack}>
          <OWIcon size={16} name="arrow-left" />
        </TouchableOpacity>
        <View style={[styles.aic, styles.title]}>
          <OWText variant="h2" typo="bold">
            Secure your wallet
          </OWText>
          <OWText color={colors['text-body']} weight={'500'} style={{ textAlign: 'center', paddingTop: 4 }}>
            Write down this recovery phrase in the exact order and keep it in a safe place
          </OWText>
          <View
            style={{
              paddingLeft: 20,
              paddingRight: 20,
              paddingTop: 32
            }}
          ></View>
          {privateDataType === 'mnemonic' ? (
            <WordsCard words={words} />
          ) : (
            <View style={styles.containerWord}>
              <OWText color={colors['text-body']} weight={'500'} style={{ textAlign: 'center', paddingTop: 4 }}>
                {words}
              </OWText>
            </View>
          )}

          <TouchableOpacity
            onPress={() => {
              onCopy();
            }}
          >
            <View style={styles.rc}>
              {isTimedOut ? <CheckIcon /> : <CopyFillIcon color={colors['purple-900']} />}
              <OWText style={{ paddingLeft: 8 }} variant="h2" weight="600" size={14} color={colors['purple-900']}>
                Copy to clipboard
              </OWText>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.aic}>
        <View style={styles.signIn}>
          <OWButton
            style={{
              borderRadius: 32
            }}
            label="Ok, I saved it!"
            disabled={false}
            onPress={() => {
              onGoBack();
            }}
            loading={false}
          />
        </View>
      </View>
    </View>
  );
});

const WordsCard: FunctionComponent<{
  words: string[];
}> = ({ words }) => {
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

  const styles = useStyles();
  return (
    <View style={styles.containerWord}>
      {words.map((word, i) => {
        return <BackupWordChip key={i.toString()} index={i + 1} word={word} hideWord={hideWord} />;
      })}

      <View style={styles.containerBtnCopy}>
        <View
          style={{
            flex: 1
          }}
        />
      </View>
    </View>
  );
};

const useStyles = () => {
  const { colors } = useTheme();
  return StyleSheet.create({
    padIcon: {
      paddingLeft: 10,
      width: 'auto'
    },

    containerBtnCopy: {
      width: '100%',
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center'
    },
    containerWord: {
      marginTop: 14,
      marginBottom: 16,
      padding: 16,
      borderColor: colors['primary-default'],
      borderWidth: 1,
      borderRadius: 8,
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'wrap'
    },
    container: {
      paddingTop: metrics.screenHeight / 14,
      justifyContent: 'space-between',
      height: '100%'
    },
    signIn: {
      width: '100%',
      alignItems: 'center',
      borderTopWidth: 1,
      borderTopColor: colors['gray-300'],
      padding: 16
    },

    aic: {
      alignItems: 'center',
      paddingBottom: 20
    },
    rc: {
      flexDirection: 'row',
      alignItems: 'center'
    },
    goBack: {
      backgroundColor: colors['background-light-gray'],
      borderRadius: 999,
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 16
    },
    title: {
      paddingHorizontal: 16,
      paddingTop: 24
    }
  });
};
