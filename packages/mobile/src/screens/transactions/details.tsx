import Clipboard from 'expo-clipboard';
import React, { FunctionComponent } from 'react';
import { StyleSheet, View } from 'react-native';
import { Divider } from '@rneui/base';
import { CText as Text } from '../../components/text';
import { RectButton } from 'react-native-gesture-handler';
import { CheckIcon, CopyTransactionIcon } from '../../components/icon';
import { PageWithScrollView } from '../../components/page';
import { useStyle } from '../../styles';
import { TransactionSectionTitle } from './components';
import { colors, metrics, spacing, typography } from '../../themes';
import {
  formatContractAddress,
  formatOrai,
  getTxTypeNew,
  parseIbcMsgTransfer
} from '../../utils/helper';
import { useRoute, RouteProp } from '@react-navigation/native';
import moment from 'moment';
import { useSimpleTimer } from '../../hooks';
interface TransactionInfo {
  label: string;
  value: string;
}
interface TransactionDetail {
  amount: string;
  result: 'Success' | 'Fail';
  height: number | string;
  size: number | string;
  gas: number | string;
  time: string;
}

const bindStyleTxInfo = (
  label: string,
  value: string
): { color?: string; textTransform?: string; fontWeight?: string } => {
  switch (label) {
    case 'Transaction hash':
      return { color: colors['purple-700'], textTransform: 'uppercase' };
    case 'Amount':
      return value.includes('-')
        ? {
            color: colors['red-500'],
            fontWeight: '800',
            textTransform: 'uppercase'
          }
        : {
            color: colors['green-500'],
            fontWeight: '800',
            textTransform: 'uppercase'
          };
    default:
      return { color: colors['gray-900'] };
  }
};

const bindValueTxInfo = (label: string, value: string) => {
  switch (label) {
    case 'Transaction hash':
    case 'From':
    case 'To':
      return formatContractAddress(value);

    default:
      return value;
  }
};

const InfoItems: FunctionComponent<{
  label: string;
  value: string;
  topBorder?: boolean;
  onPress?: () => void;
}> = ({ label, value, topBorder }) => {
  const style = useStyle();
  const { isTimedOut, setTimer } = useSimpleTimer();
  const renderChildren = () => {
    return (
      <View style={styles.containerDetailVertical}>
        <View
          style={{
            flex: 1
          }}
        >
          <Text
            style={{
              color: colors['gray-600'],
              ...typography.h7
            }}
          >
            {label}
          </Text>
          <Text
            style={{
              ...bindStyleTxInfo(label, value),
              marginTop: spacing['2'],
              ...typography.body2
            }}
          >
            {bindValueTxInfo(label, value)}
          </Text>
        </View>
        {label !== 'Amount' && (
          <View
            style={{
              flex: 1,
              alignItems: 'flex-end'
            }}
          >
            {isTimedOut ? (
              <CheckIcon />
            ) : (
              <CopyTransactionIcon
                size={20}
                onPress={() => {
                  Clipboard.setString(value.trim());
                  setTimer(2000);
                }}
              />
            )}
          </View>
        )}
        <View />
      </View>
    );
  };

  return (
    <View
      style={{
        paddingHorizontal: spacing['20']
      }}
    >
      <View
        style={StyleSheet.flatten([
          style.flatten([
            'height-62',
            'flex-row',
            'items-center',
            'padding-x-20',
            'background-color-white'
          ])
        ])}
      >
        {renderChildren()}
      </View>
      <Divider />
    </View>
  );
};

const DetailItems: FunctionComponent<{
  label: string;
  value: string;
  topBorder?: boolean;
  onPress?: () => void;
}> = ({ label, onPress, value, topBorder }) => {
  const style = useStyle();
  const renderChildren = () => {
    return (
      <>
        <View style={styles.containerDetailHorizontal}>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: colors['gray-600'],
                ...typography.h7
              }}
            >
              {label}
            </Text>
          </View>

          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <Text
              style={{
                ...bindStyleTxInfo(label, value),
                ...typography.body2,
                color:
                  value === 'Success'
                    ? colors['green-500']
                    : value === 'Failed'
                    ? colors['red-500']
                    : colors['black']
              }}
            >
              {bindValueTxInfo(label, value)}
            </Text>
          </View>
          <View />
        </View>
      </>
    );
  };

  return (
    <View
      style={{
        paddingHorizontal: spacing['20']
      }}
    >
      <RectButton
        style={StyleSheet.flatten([
          style.flatten([
            'height-62',
            'flex-row',
            'items-center',
            'padding-x-20',
            'background-color-white'
          ])
        ])}
        onPress={onPress}
      >
        {renderChildren()}
      </RectButton>
      <Divider />
    </View>
  );
};

export const TransactionDetail: FunctionComponent<any> = () => {
  const style = useStyle();
  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          item: object;
        }
      >,
      string
    >
  >();

  const { item, type } = route.params || {};

  const { tx_hash, tx, timestamp, gas_used, gas_wanted, height, code }: any =
    item || {};

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
      const rawLog = JSON.parse(item?.raw_log);
      const rawLogParse = parseIbcMsgTransfer(rawLog);
      const rawLogDenomSplit = rawLogParse?.denom?.split('/');
      amount = rawLog;
    } else {
      const type = getTxTypeNew(
        item.messages[item?.messages?.length - 1]['@type'],
        item?.raw_log,
        item?.result
      );
      const msg = item?.messages?.find(
        msg => getTxTypeNew(msg['@type']) === type
      );

      amount = msg?.amount?.length > 0 ? msg?.amount[0] : msg?.amount ?? {};
    }
    const prefix =
      getTxTypeNew(item?.messages?.[0]['@type']) === 'MsgSend' &&
      item?.messages?.[0]?.from_address &&
      item.address === item.messages[0].from_address
        ? '-'
        : '+';

    return amount && !amount?.denom?.startsWith('u')
      ? `${prefix} ${formatOrai(amount.amount ?? 0)} ${amount.denom ?? ''}`
      : `${prefix} ${formatOrai(amount.amount ?? 0)} ${
          amount.denom ? amount.denom?.substring(1) : ''
        }`;
  }, [item]);

  const date = moment(timestamp).format('MMM DD, YYYY [at] HH:mm');
  const { messages } = tx?.body || {};
  const { title, isPlus, amount, denom, unbond } = getTransactionValue({
    data: [
      {
        type: messages?.[0]?.['@type']
      }
    ],
    address: route.params?.item?.address,
    logs: route.params?.item?.logs
  });

  const txInfos: TransactionInfo[] = [
    {
      label: 'From',
      value: tx?.body?.messages?.[0]?.from_address
    },
    {
      label: 'To',
      value: tx?.body?.messages?.[0]?.to_address
    },
    {
      label: 'Transaction hash',
      value: formatContractAddress(tx_hash)
    },
    {
      label: 'Amount',
      value: `${convertAmount(amount)} ${denom.toUpperCase()}`
    }
  ];

  const txDetail: TransactionInfo[] = [
    {
      label: 'Result',
      value: code === 0 ? 'Success' : 'Failed'
    },
    {
      label: 'Block height',
      value: height
    },
    {
      label: 'Gas (used/ wanted)',
      value: `${gas_used} / ${gas_wanted}`
    },
    {
      label: 'Fee',
      value: `${tx?.auth_info?.fee?.amount?.[0]?.amount * Math.pow(10, -6)} ${
        tx?.auth_info?.fee?.amount?.[0]?.denom
      }`
    },
    {
      label: 'Amount',
      value: `${convertAmount(amount)} ${denom}`
    },
    {
      label: 'Time',
      value: date
    }
  ];

  return (
    <PageWithScrollView>
      <View style={styles.containerTitle}>
        <Text style={styles.textTitle}>Transaction Detail</Text>
      </View>
      <TransactionSectionTitle title={title} right={<></>} />
      <View>
        {txInfos.map((item, index) => (
          <InfoItems
            key={index}
            label={item.label}
            topBorder={true}
            value={item.value}
          />
        ))}
      </View>
      <TransactionSectionTitle title={'Detail'} right={<></>} />

      <View>
        {txDetail.map(({ label, value }: TransactionInfo, index: number) => (
          <DetailItems
            key={index}
            label={label}
            topBorder={true}
            value={value}
          />
        ))}
      </View>

      <View style={style.flatten(['height-1', 'margin-y-20'])} />
    </PageWithScrollView>
  );
};

const styles = StyleSheet.create({
  container: {},
  containerTitle: {
    paddingHorizontal: spacing['20'],
    paddingVertical: spacing['16'],
    backgroundColor: colors['white']
  },
  textTitle: {
    ...typography.h3,
    color: colors['black'],
    lineHeight: 34,
    fontWeight: 'bold'
  },
  containerDetailVertical: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: metrics.screenWidth - 40
  },
  containerDetailHorizontal: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: metrics.screenWidth - 40
  },
  textParagraph: {}
});
