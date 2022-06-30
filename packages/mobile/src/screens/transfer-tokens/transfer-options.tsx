import React, { FunctionComponent } from 'react';
import { StyleSheet, View } from 'react-native';
import { CText as Text} from "../../components/text";
import { TouchableOpacity } from 'react-native-gesture-handler';
import {
  SendBridgeIcon,
  SendCrossChainIcon,
  SendQRCodeIcon,
  SendWithinNetworkIcon,
} from '../../components/icon';
import { colors, metrics, spacing } from '../../themes';

const styles = StyleSheet.create({
  sendTokenCard: {
    borderRadius: spacing['24'],
  },
  sendTokenCardbody: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: spacing['-6'],
    justifyContent: 'space-between',
  },
  sendTokenCardContent: {
    paddingHorizontal: spacing['6'],
    width: '50%',
  },
  sendTokenCardMain: {
    marginBottom: spacing['12'],
    borderRadius: spacing['12'],
    height: 122,
    alignItems: 'center',
    paddingVertical: spacing['16'],
    paddingHorizontal: spacing['8'],
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
        {tokenTransferInfo.map((val, i) => (
          <View style={styles.sendTokenCardContent} key={i}>
            <View style={styles.sendTokenCardMain}>
              <TouchableOpacity style={{ alignItems: 'center'}}>
                <View style={styles.iconSendToken} >{val.icon}</View>
                <Text style={styles.textSendToken}>{val.titleLine1}</Text>
                <Text style={styles.textSendToken}>{val.titleLine2}</Text>
              </TouchableOpacity>
            </View>
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
