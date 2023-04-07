import {
  TITLE_TYPE_ACTIONS_COSMOS_HISTORY,
  TYPE_ACTIONS_COSMOS_HISTORY,
  TYPE_EVENT
} from './../../common/constants';
import { navigate } from '../../router/root';
import isValidDomain from 'is-valid-domain';
import { find } from 'lodash';
import moment from 'moment';
import { Base58 } from '@ethersproject/basex';
import { sha256 } from '@ethersproject/sha2';
import bs58 from 'bs58';
import get from 'lodash/get';
import Big from 'big.js';
const SCHEME_IOS = 'owallet://open_url?url=';
const SCHEME_ANDROID = 'app.owallet.oauth://google/open_url?url=';
export const TRON_ID = '0x2b6653dc';
const truncDecimals = 6;
const atomic = 10 ** truncDecimals;
export const TRON_BIP39_PATH_PREFIX = "m/44'/195'";
export const BIP44_PATH_PREFIX = "m/44'";
export const FAILED = 'FAILED';
export const SUCCESS = 'SUCCESS';
export const TRON_BIP39_PATH_INDEX_0 = TRON_BIP39_PATH_PREFIX + "/0'/0/0";
export const TRC20_LIST = [
  {
    contractAddress: 'TEkxiTehnzSmSe2XqrBj4w32RUN966rdz8',
    tokenName: 'USDC',
    coinDenom: 'USDC',
    coinGeckoId: 'usd-coin',
    coinImageUrl:
      'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png',
    coinDecimals: 6,
    type: 'trc20'
  },
  {
    contractAddress: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
    tokenName: 'USDT',
    coinDenom: 'USDT',
    coinDecimals: 6,
    coinGeckoId: 'tether',
    coinImageUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/825.png',
    type: 'trc20'
  }
  // {
  //   contractAddress: 'TGjgvdTWWrybVLaVeFqSyVqJQWjxqRYbaK',
  //   tokenName: 'USDD',
  //   coinDenom: 'USDD',
  //   coinDecimals: 6,
  //   coinGeckoId: 'usdd',
  //   coinImageUrl:
  //     'https://s2.coinmarketcap.com/static/img/coins/64x64/19891.png',
  //   type: 'trc20'
  // },
  // {
  //   contractAddress: 'TLBaRhANQoJFTqre9Nf1mjuwNWjCJeYqUL',
  //   tokenName: 'USDJ',
  //   coinDenom: 'USDJ',
  //   coinDecimals: 6,
  //   coinGeckoId: 'usdj',
  //   coinImageUrl:
  //     'https://s2.coinmarketcap.com/static/img/coins/64x64/5446.png',
  //   type: 'trc20'
  // },
  // {
  //   contractAddress: 'TF17BgPaZYbz8oxbjhriubPDsA7ArKoLX3',
  //   tokenName: 'JST',
  //   coinDenom: 'JST',
  //   coinDecimals: 6,
  //   coinGeckoId: 'just',
  //   coinImageUrl:
  //     'https://s2.coinmarketcap.com/static/img/coins/64x64/5488.png',
  //   type: 'trc20'
  // },
  // {
  //   contractAddress: 'TWrZRHY9aKQZcyjpovdH6qeCEyYZrRQDZt',
  //   tokenName: 'SUNOLD',
  //   coinDenom: 'SUNOLD',
  //   coinDecimals: 6,
  //   coinGeckoId: 'sun',
  //   coinImageUrl:
  //     'https://s2.coinmarketcap.com/static/img/coins/64x64/6990.png',
  //   type: 'trc20'
  // }
];
export const handleError = (error, url) => {
  if (__DEV__) {
    console.log(`[1;34m: ---------------------------------------`);
    console.log(`[1;34m: handleError -> url`, url);
    console.log(`[1;34m: handleError -> error`, JSON.stringify(error));
    console.log(`[1;34m: ---------------------------------------`);
  }
};

export const getEvmAddress = (base58Address) =>
  base58Address
    ? '0x' +
      Buffer.from(bs58.decode(base58Address).slice(1, -4)).toString('hex')
    : '-';

export const getBase58Address = (address) => {
  const evmAddress = '0x41' + address.substring(2);
  const hash = sha256(sha256(evmAddress));
  const checkSum = hash.substring(2, 10);
  return Base58.encode(evmAddress + checkSum);
};

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
export function limitString(str, limit) {
  if (str.length > limit) {
    return str.slice(0, limit) + '...';
  } else {
    return str;
  }
}
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
export function getStringAfterMsg(str) {
  const msgIndex = str.indexOf('Msg');
  if (msgIndex === -1) {
    return '';
  }
  return str.substring(msgIndex + 3);
}
export const getValueTransactionHistory = ({
  item,
  address
}): IDataTransaction => {
  let isRecipient = false;
  let amount = '';
  let denom = '';
  let eventType, countEvent;
  const transfer = 'transfer';
  if (item?.tx_result?.code === 0) {
    const logs = JSON.parse(get(item, 'tx_result.log'));
    const event = logs && find(get(logs, `[0].events`), { type: 'message' });
    const action = event && find(get(event, 'attributes'), { key: 'action' });
    const actionValue = action?.value;
    eventType =
      actionValue?.length > 0 && actionValue?.toLowerCase()?.includes('msg')
        ? getStringAfterMsg(addSpacesToString(actionValue))
        : convertString(actionValue);
    countEvent = countKeywords(`${logs}`, actionValue);
    const value = find(get(logs, `[0].events`), {
      type: transfer
    });
    const amountValue = value && find(value?.attributes, { key: 'amount' });
    const recipient = value && find(value?.attributes, { key: 'recipient' });
    if (recipient?.value === address && actionValue === transfer) {
      isRecipient = true;
    }
    const matchesAmount = amountValue?.value?.match(/\d+/g);
    const matchesDenom = amountValue?.value?.match(/[^0-9\.]+/g);
    amount = matchesAmount?.length > 0 && matchesAmount[0];
    denom = matchesDenom?.length > 0 && removeSpecialChars(matchesDenom[0]);
  }

  return {
    status: item?.tx_result?.code === 0 ? 'success' : 'failed',
    eventType,
    countEvent,
    amount,
    denom,
    isRecipient
  };
};
function convertString(str) {
  const words = str.split('_');
  const capitalizedWords = words.map(
    (word) => word.charAt(0).toUpperCase() + word.slice(1)
  );
  return capitalizedWords.join(' ');
}
export function removeSpecialChars(str) {
  return str.replace(/[^\w\s]/gi, '');
}
function addSpacesToString(str) {
  return str.replace(/([a-z])([A-Z])/g, '$1 $2');
}
function countKeywords(text, keyword) {
  const words = text?.split(/\W+/);
  return words?.filter((word) => word?.toLowerCase() === keyword?.toLowerCase())
    ?.length;
}
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

export const formatAmount = (amount, decimals = 6) => {
  if (amount?.length < 12) {
    const divisor = new Big(10).pow(decimals);
    const amountFormat = new Big(amount).div(divisor);
    return amountFormat.toFixed(decimals);
  } else {
    const divisor = new Big(10).pow(16);
    const amountFormat = new Big(amount).div(divisor);
    return amountFormat.toFixed(decimals);
  }
};

export const getDomainFromUrl = (url) => {
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

export const parseIbcMsgRecvPacket = (denom) => {
  return denom?.slice(0, 1) === 'u' ? denom?.slice(1, denom?.length) : denom;
};

export const getTxTypeNew = (type, rawLog = '[]', result = '') => {
  if (type) {
    const typeArr = type.split('.');
    let typeMsg = typeArr?.[typeArr?.length - 1];
    if (typeMsg === 'MsgExecuteContract' && result === 'Success') {
      let rawLogArr = JSON.parse(rawLog);
      for (let event of rawLogArr?.[0].events) {
        if (event?.['type'] === 'wasm') {
          for (let att of event?.['attributes']) {
            if (att?.['key'] === 'action') {
              let attValue = att?.['value']
                .split('_')
                .map((word) => word?.charAt(0).toUpperCase() + word?.slice(1))
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
    rawLog && rawLog?.[0]?.events?.find((e) => e?.type === type);
  const ibcDemonPackData =
    arrayIbcDemonPacket &&
    arrayIbcDemonPacket?.attributes?.find((ele) => ele?.key === key);
  const ibcDemonObj =
    typeof ibcDemonPackData?.value === 'string' ||
    ibcDemonPackData?.value instanceof String
      ? JSON.parse(ibcDemonPackData?.value ?? '{}')
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

export function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
export { get };
