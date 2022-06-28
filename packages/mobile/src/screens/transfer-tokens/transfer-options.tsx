import React, { FunctionComponent } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import {
  SendBridgeIcon,
  SendCrossChainIcon,
  SendQRCodeIcon,
  SendWithinNetworkIcon,
} from '../../components/icon';
import { colors, spacing } from '../../themes';

const styles = StyleSheet.create({
  sendTokenCard: {
    borderRadius: spacing['24'],
    padding: spacing['12'],
  },
  sendTokenCardbody: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  sendTokenCardContent: {
    padding: spacing['16'],
    marginBottom: spacing['12'],
    borderRadius: spacing['12'],
    alignItems: 'center',
    backgroundColor: colors['white'],
    shadowColor: '#18274B1F',
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 1,
    shadowRadius: 16.0,
  },
  iconSendToken: {
    marginBottom: spacing['6'],
  },
  textSendToken: {
    fontWeight: '800',
    fontSize: 14,
  },
});

const tokenTransferInfo = [
  {
    icon: <SendWithinNetworkIcon />,
    titleLine1: 'Send',
    titleLine2: 'within network',
  },
  {
    icon: <SendCrossChainIcon />,
    titleLine1: 'Send cross-chain',
    titleLine2: '(IBC Transfer)',
  },
  {
    icon: <SendBridgeIcon />,
    titleLine1: 'Bridge',
    titleLine2: '',
  },
  {
    icon: <SendQRCodeIcon />,
    titleLine1: 'Send',
    titleLine2: 'via QR code',
  },
];

const TransferTokensOptions: FunctionComponent = () => {
  return (
    <>
      <View style={styles.sendTokenCardbody}>
        {tokenTransferInfo.map((val) => (
          <View style={{ width: '48%' }}>
            <TouchableOpacity style={styles.sendTokenCardContent}>
              <View style={styles.iconSendToken}>{val.icon}</View>
              <Text style={styles.textSendToken}>{val.titleLine1}</Text>
              <Text style={styles.textSendToken}>{val.titleLine2}</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
      <View style={{ marginTop: spacing['20'], alignItems: 'center' }}>
        <Text style={{ color: colors['gray-150'] }}>View lists</Text>
      </View>
    </>
  );
};

export default TransferTokensOptions;
