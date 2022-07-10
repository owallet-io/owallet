import React, { FunctionComponent } from 'react';
import { ViewStyle, View } from 'react-native';
import { CText as Text } from '../text';
import Clipboard from 'expo-clipboard';
import { RectButton } from '../rect-button';
import { CheckIcon, CopyAccountIcon, CopyFillIcon, CopyIcon } from '../icon';
import { useSimpleTimer } from '../../hooks';
import { colors } from '../../themes';

export const Copyable: FunctionComponent<{
  style?: ViewStyle;
  text: string;
}> = ({ style: propStyle, text }) => {
  const { isTimedOut, setTimer } = useSimpleTimer();

  return (
    <RectButton
      style={{
        backgroundColor: '#F8EFFF',
        paddingLeft: 12,
        paddingRight: 8,
        marginTop: 2,
        marginBottom: 2,
        borderRadius: 12,
        height: 30,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        ...propStyle
      }}
      onPress={() => {
        Clipboard.setString(text);
        setTimer(2000);
      }}
      rippleColor={colors['primary-100']}
      underlayColor={colors['primary-50']}
      activeOpacity={1}
    >
      <Text
        style={{ fontSize: 14, color: colors['gray-150'], fontWeight: '700' }}
      >
        {text}
      </Text>
      <View
        style={{
          marginLeft: 4,
          width: 20
        }}
      >
        {isTimedOut ? (
          <CheckIcon />
        ) : (
          <CopyFillIcon color={colors['gray-150']} />
        )}
      </View>
    </RectButton>
  );
};
