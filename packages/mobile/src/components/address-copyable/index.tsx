import React, { FunctionComponent } from 'react';
import { ViewStyle, View } from 'react-native';
import { CText as Text } from '../text';
import { Bech32Address } from '@owallet/cosmos';
import Clipboard from 'expo-clipboard';
import { RectButton } from '../rect-button';
import { CheckIcon, CopyAccountIcon, CopyFillIcon, CopyIcon } from '../icon';
import { useSimpleTimer } from '../../hooks';
import { colors } from '../../themes';
import { formatContractAddress } from '../../utils/helper';

export const AddressCopyable: FunctionComponent<{
  style?: ViewStyle;
  address: string;
  networkType?: string;
  maxCharacters: number;
}> = ({ style: propStyle, address, maxCharacters, networkType }) => {
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
        Clipboard.setString(address);
        setTimer(2000);
      }}
      rippleColor={colors['primary-100']}
      underlayColor={colors['primary-50']}
      activeOpacity={1}
    >
      <Text
        style={{ fontSize: 14, color: colors['gray-150'], fontWeight: '700' }}
      >
        {networkType === 'cosmos'
          ? Bech32Address.shortenAddress(address, maxCharacters)
          : formatContractAddress(address ?? '')}
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
