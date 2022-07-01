import React, { FunctionComponent, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { CText as Text } from '../../../../components/text';
import { useStyle } from '../../../../styles';
import { CheckIcon, CopyFillIcon } from '../../../../components/icon';
import { Button } from '../../../../components/button';
import { WordChip } from '../../../../components/mnemonic';
import Clipboard from 'expo-clipboard';
import { PageWithScrollViewInBottomTabView } from '../../../../components/page';
import { useSimpleTimer } from '../../../../hooks';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { colors, spacing, typography } from '../../../../themes';
import { RectButton } from 'react-native-gesture-handler';

export const getPrivateDataTitle = (
  keyRingType: string,
  capitalize?: boolean
) => {
  if (capitalize) {
    return `View ${
      keyRingType === 'mnemonic' ? 'Mnemonic Seed' : 'Private Key'
    }`;
  }

  return `View ${keyRingType === 'mnemonic' ? 'mnemonic seed' : 'private key'}`;
};

export const canShowPrivateData = (keyRingType: string): boolean => {
  return keyRingType === 'mnemonic' || keyRingType === 'privateKey';
};

export const ViewPrivateDataScreen: FunctionComponent = () => {
  const style = useStyle();

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

  const navigation = useNavigation();
  useEffect(() => {
    navigation.setOptions({
      title: getPrivateDataTitle(route.params.privateDataType, true)
    });
  }, [navigation, route.params.privateDataType]);

  const { isTimedOut, setTimer } = useSimpleTimer();

  const privateData = route.params.privateData;
  const privateDataType = route.params.privateDataType;

  const words = privateData.split(' ');

  return (
    <PageWithScrollViewInBottomTabView>
      <View
        style={{
          backgroundColor: colors['white'],
          borderRadius: spacing['24'],
          paddingHorizontal: 20,
          paddingVertical: spacing['24'],
          marginTop: spacing['24']
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            backgroundColor: colors['gray-10'],
            borderRadius: spacing['24'],
            padding: spacing['20'],
            marginBottom: spacing['20']
          }}
        >
          {privateDataType === 'mnemonic' ? (
            words.map((word, i) => {
              return <WordChip key={i.toString()} index={i + 1} word={word} />;
            })
          ) : (
            <Text
              style={{
                ...typography['h6'],
                marginBottom: spacing['30']
              }}
            >
              {words}
            </Text>
          )}
        </View>
        <View
          style={{
            width: '100%'
          }}
        >
          <RectButton
            style={{ ...styles.containerBtn }}
            onPress={() => {
              Clipboard.setString(words.join(" ").trim())
              setTimer(2000)
            }}
          >
            <CopyFillIcon color={colors['white']} />
            <Text
              style={{ ...styles.textBtn, textAlign: 'center' }}
            >{`Copy to Clipboard`}</Text>
          </RectButton>
        </View>
      </View>
    </PageWithScrollViewInBottomTabView>
  );
};

const styles = StyleSheet.create({
  containerBtn: {
    backgroundColor: colors['purple-900'],
    borderRadius: spacing['8'],
    paddingVertical: spacing['16'],
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  textBtn: {
    ...typography.h6,
    color: colors['white'],
    fontWeight: '700',
    marginLeft: spacing['8']
  }
});
