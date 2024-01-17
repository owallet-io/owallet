import React, { FunctionComponent } from 'react';
import { ViewStyle, View, Clipboard } from 'react-native';
import { Text } from '@src/components/text';
import { Bech32Address } from '@owallet/cosmos';
import { RectButton } from '../rect-button';
import { CheckIcon, CopyAccountIcon, CopyFillIcon, CopyIcon } from '../icon';
import { useSimpleTimer } from '../../hooks';
import { formatContractAddress } from '../../utils/helper';
import { useTheme } from '@src/themes/theme-provider';

export const AddressCopyable: FunctionComponent<{
  style?: ViewStyle;
  address: string;
  chain?: string;
  networkType?: string;
  maxCharacters: number;
}> = ({ style: propStyle, address, maxCharacters, networkType, chain }) => {
  const { isTimedOut, setTimer } = useSimpleTimer();
  const { colors } = useTheme();

  return (
    <RectButton
      style={{
        backgroundColor: colors['sub-background'],
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
      {chain ? (
        <Text style={{ fontSize: 14, color: colors['neutral-text-title'], fontWeight: '700' }}>{chain}: </Text>
      ) : null}
      <Text style={{ fontSize: 14, color: colors['sub-text'], fontWeight: '700' }}>
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
        {isTimedOut ? <CheckIcon /> : <CopyFillIcon color={colors['sub-text']} />}
      </View>
    </RectButton>
  );
};
