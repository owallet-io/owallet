import { navigate } from '../../router/root';
import isValidDomain from 'is-valid-domain';
import { find } from 'lodash';
import moment from 'moment';
const SCHEME_IOS = 'owallet://open_url?url=';
const SCHEME_ANDROID = 'app.owallet.oauth://google/open_url?url=';

export const handleDeepLink = async ({ url }) => {
  if (url) {
    const path = url.replace(SCHEME_ANDROID, '').replace(SCHEME_IOS, '');
    if (!url.indexOf(SCHEME_ANDROID)) {
      navigate('Browser', { path });
    }

    if (url.indexOf(SCHEME_IOS) === 0) {
      navigate('Browser', { path });
    }
  }
};

export const checkValidDomain = (url: string) => {
  if (isValidDomain(url)) {
    return true;
  }
  // try with URL
  try {
    const { origin } = new URL(url);
    return origin.length > 0;
  } catch {
    return false;
  }
};

export const _keyExtract = (item, index) => index.toString();

export const formatContractAddress = (address: string) => {
  const fristLetter = address?.slice(0, 10) ?? '';
  const lastLetter = address?.slice(-5) ?? '';

  return `${fristLetter}...${lastLetter}`;
};

// capital first letter of string
export const capitalizedText = (text: string) => {
  return text.slice(0, 1).toUpperCase() + text.slice(1, text.length);
};

export const TRANSACTION_TYPE = {
  DELEGATE: 'MsgDelegate',
  UNDELEGATE: 'MsgUndelegate',
  CLAIM_REWARD: 'MsgWithdrawDelegationReward',
  WITHDRAW: 'MsgWithdrawDelegatorReward',
  SEND: 'MsgSend',
  INSTANTIATE_CONTRACT: 'MsgInstantiateContract',
  EXECUTE_CONTRACT: 'MsgExecuteContract'
};

export const getTransactionValue = ({ data, address, logs }) => {
  const transactionType = data?.[0]?.type;
  let valueAmount = data?.[0]?.value?.amount;
  const events = logs?.[0]?.events;
  let eventType = null;
  let unbond = null;
  let isRecipient = false;
  if (
    checkType(transactionType, TRANSACTION_TYPE.CLAIM_REWARD) ||
    checkType(transactionType, TRANSACTION_TYPE.WITHDRAW)
  ) {
    eventType = 'withdraw_rewards';
  }
  if (checkType(transactionType, TRANSACTION_TYPE.DELEGATE)) {
    eventType = 'delegate';
  }
  if (
    checkType(transactionType, TRANSACTION_TYPE.SEND) ||
    checkType(transactionType, TRANSACTION_TYPE.UNDELEGATE)
  ) {
    eventType = 'transfer';
  }
  if (events && eventType) {
    const value = find(events, { type: eventType });
    if (checkType(transactionType, TRANSACTION_TYPE.UNDELEGATE)) {
      unbond = getUnbondInfo(logs?.[0]?.events);
    }

    const amountReward = value && find(value?.attributes, { key: 'amount' });
    const recipient = value && find(value?.attributes, { key: 'recipient' });
    if (recipient?.value === address) {
      isRecipient = true;
    }
    valueAmount = {
      // eslint-disable-next-line no-useless-escape
      amount: amountReward?.value?.replace(/[^0-9\.]+/g, ''),
      denom: amountReward?.value?.replace(/^\d+/g, '') || 'orai'
    };
  }

  const amount = valueAmount?.amount || valueAmount?.[0]?.amount || 0;
  const denom = valueAmount?.denom || valueAmount?.[0]?.denom;
  let title, isPlus;

  switch (true) {
    case checkType(transactionType, TRANSACTION_TYPE.DELEGATE):
      title = 'Delegated';

      isPlus = false;
      break;

    case checkType(transactionType, TRANSACTION_TYPE.UNDELEGATE):
      title = 'Un-Delegated';

      isPlus = true;
      break;

    case checkType(transactionType, TRANSACTION_TYPE.CLAIM_REWARD):
    case checkType(transactionType, TRANSACTION_TYPE.WITHDRAW):
      title = 'Reward';

      isPlus = true;
      break;

    case checkType(transactionType, TRANSACTION_TYPE.SEND): {
      title = 'Send Token';

      if (isRecipient) {
        title = 'Received Token';

        isPlus = true;
      }
      break;
    }

    case checkType(transactionType, TRANSACTION_TYPE.EXECUTE_CONTRACT): {
      title = 'Execute Contract';

      if (isRecipient) {
        title = 'Execute Contract';

        isPlus = true;
      }
      break;
    }

    case checkType(transactionType, TRANSACTION_TYPE.INSTANTIATE_CONTRACT): {
      title = 'Instantiate Contract';

      break;
    }
    default:
      break;
  }

  return { title, isPlus, amount, denom, unbond };
};

export const checkType = (str, type) => str?.indexOf?.(type) >= 0;

export const getUnbondInfo = (events = []) => {
  const unbond = find(events, { type: 'unbond' });
  const unbondValue = find(unbond.attributes, { key: 'amount' });
  const unbondCompleted = find(unbond.attributes, {
    key: 'completion_time'
  });

  const date = moment(unbondCompleted.value);
  const isCompleted = moment(date).isBefore(moment());

  return {
    isCompleted,
    date,
    value: unbondValue?.value
  };
};

export const convertAmount = (amount: any) => {
  switch (typeof amount) {
    case 'string':
    case 'number':
      return Number(amount) / Math.pow(10, 6);
    default:
      return 0;
  }
};

export const getDomainFromUrl = url => {
  if (!url) {
    return '';
  }
  return `${url?.match?.(
    // eslint-disable-next-line no-useless-escape
    /^(?:https?:\/\/)?(?:[^@\/\n]+@)?(?:www\.)?([^:\/?\n]+)/gim
  )}`
    .replace('https://', '')
    .replace('http://', '');
};

export const parseIbcMsgRecvPacket = denom => {
  return denom?.slice(0, 1) === 'u' ? denom?.slice(1, denom?.length) : denom;
};

export const getTxTypeNew = (type, rawLog = '[]', result = '') => {
  if (type) {
    const typeArr = type.split('.');
    let typeMsg = typeArr[typeArr.length - 1];
    if (typeMsg === 'MsgExecuteContract' && result === 'Success') {
      let rawLogArr = JSON.parse(rawLog);
      for (let event of rawLogArr[0].events) {
        if (event['type'] === 'wasm') {
          for (let att of event['attributes']) {
            if (att['key'] === 'action') {
              let attValue = att['value']
                .split('_')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join('');
              typeMsg += '/' + attValue;
              break;
            }
          }

          break;
        }
      }
    }
    return typeMsg;
  }
  return 'Msg';
};

export const parseIbcMsgTransfer = (
  rawLog,
  type = 'send_packet',
  key = 'packet_data'
) => {
  const arrayIbcDemonPacket =
    rawLog && rawLog?.[0]?.events?.find(e => e.type === type);
  const ibcDemonPackData =
    arrayIbcDemonPacket &&
    arrayIbcDemonPacket?.attributes?.find(ele => ele.key === key);
  const ibcDemonObj =
    typeof ibcDemonPackData?.value === 'string' ||
    ibcDemonPackData?.value instanceof String
      ? JSON.parse(ibcDemonPackData.value)
      : { denom: '' };
  return ibcDemonObj;
};

export const formatOrai = (amount, decimal = 6) => {
  return Number(amount) / Math.pow(10, decimal);
};

export const getUnixTimes = (value, unit, startOf) => [
  moment()
    .startOf(startOf ?? 'hour')
    .subtract(value, unit)
    .unix(),
  moment()
    .startOf(startOf ?? 'hour')
    .add(3, 'minute')
    .unix()
];

export function nFormatter(num, digits: 1) {
  const lookup = [
    { value: 1, symbol: '' },
    { value: 1e3, symbol: 'k' },
    { value: 1e6, symbol: 'M' },
    { value: 1e9, symbol: 'G' },
    { value: 1e12, symbol: 'T' },
    { value: 1e15, symbol: 'P' },
    { value: 1e18, symbol: 'E' }
  ];
  const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  var item = lookup
    .slice()
    .reverse()
    .find(function (item) {
      return num >= item.value;
    });
  return item
    ? {
        value: Number((num / item.value).toFixed(digits).replace(rx, '$1')),
        symbol: item.symbol
      }
    : { value: 0, symbol: '' };
}
