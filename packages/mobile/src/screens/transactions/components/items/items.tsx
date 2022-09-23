import React from 'react';
import { FunctionComponent } from 'react';
import { StyleSheet, TextStyle, View, ViewStyle } from 'react-native';
import { CText as Text } from '../../../../components/text';
import { RectButton } from '../../../../components/rect-button';
import { colors, metrics, spacing, typography } from '../../../../themes';
import { convertAmount, getTransactionValue } from '../../../../utils/helper';
import moment from 'moment';

interface TransactionItemProps {
  item: any;
  address: string;
  onPress?: () => void;
  containerStyle?: ViewStyle;
}

export const TransactionItem: FunctionComponent<TransactionItemProps> = ({
  item,
  address,
  onPress,
  containerStyle
}) => {
  const { txhash, tx, timestamp } = item || {};
  const date = moment(timestamp).format('MMM DD, YYYY [at] HH:mm');

  // const { messages } = tx?.body || {};
  // const { title, isPlus, amount, denom, unbond } = getTransactionValue({
  //   data: [
  //     {
  //       type: messages?.[0]?.['@type']
  //     }
  //   ],
  //   address,
  //   logs: item.logs
  // });

  const amountDataCell = useCallback(() => {
    let amount;
    if (
      item?.messages?.find(
        msg => getTxTypeNew(msg['@type']) === 'MsgRecvPacket'
      )
    ) {
      const msg = item?.messages?.find(msg => {
        return getTxTypeNew(msg['@type']) === 'MsgRecvPacket';
      });

      const msgRec = JSON.parse(
        Buffer.from(msg?.packet?.data, 'base64').toString('ascii')
      );
      amount = msgRec;
      const port = item?.message?.packet?.destination_port;
      const channel = item?.message?.packet?.destination_channel;
    } else if (
      item?.messages?.find(msg => getTxTypeNew(msg['@type']) === 'MsgTransfer')
    ) {
      if (item?.raw_log.includes('failed')) {
        return;
      }
      const rawLog = JSON.parse(item?.raw_log);
      const rawLogParse = parseIbcMsgTransfer(rawLog);
      const rawLogDenomSplit = rawLogParse?.denom?.split('/');
      amount = rawLog;
    } else {
      const type = getTxTypeNew(
        item?.messages[item?.messages?.length - 1]['@type'],
        item?.raw_log,
        item?.result
      );
      const msg = item?.messages?.find(
        msg => getTxTypeNew(msg['@type']) === type
      );

      amount = msg?.amount?.length > 0 ? msg?.amount[0] : msg?.amount ?? {};
    }

    return (
      <Text
        style={{
          ...styles.textAmount,
          marginTop: spacing['8'],
          textTransform: 'uppercase',
          color:
            getTxTypeNew(item?.messages?.[0]['@type']) === 'MsgSend' &&
            item?.messages?.[0]?.from_address &&
            address === item.messages[0].from_address
              ? colors['red-500']
              : colors['green-500']
        }}
      >
        {/* {amount == 0 || title === 'Received Token' || title === 'Reward'
            ? '+'
            : '-'} */}
        {console.log(amount, 'amount ===')}
        {amount && !amount?.denom?.startsWith('u')
          ? `${formatOrai(amount.amount ?? 0)} ${amount.denom ?? ''}`
          : `${formatOrai(amount.amount ?? 0)} ${
              amount.denom ? amount.denom?.substring(1) : ''
            }`}
      </Text>
    );
  }, [item]);

  const renderChildren = () => {
    return (
      <View
        style={{
          ...styles.innerButton,
          flex: 1
        }}
      >
        <View>
          <Text
            style={{
              ...styles.textInfo
            }}
          >
            {title}
          </Text>
        </View>

        <View
          style={{
            flex: 1,
            justifyContent: 'flex-end',
            alignItems: 'flex-end'
          }}
        >
          <Text
            style={{
              ...styles.textInfo,
              color: colors['gray-300']
            }}
          >
            {date}
          </Text>
          <Text
            style={{
              ...styles.textAmount,
              marginTop: spacing['8'],
              textTransform: 'uppercase',
              color: amount?.includes?.('-')
                ? colors['red-500']
                : colors['green-500']
            }}
          >
            {convertAmount(amount)} {denom}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <RectButton
      style={{
        ...styles.container, // default style for container
        ...containerStyle
      }}
      onPress={onPress}
    >
      {renderChildren()}
    </RectButton>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginLeft: spacing['24'],
    marginRight: spacing['24'],
    borderRadius: spacing['8'],
    backgroundColor: colors['red-50'],
    marginTop: spacing['4'],
    marginBottom: spacing['8']
  },
  textInfo: {
    ...typography.h7,
    color: colors['gray-900'],
    fontWeight: '600'
  },
  textAmount: {
    ...typography.h6,
    fontWeight: '800'
  },
  innerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: spacing['8'],
    marginHorizontal: spacing['16']
  }
});
