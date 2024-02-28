import { TypeTextAndCustomizeComponent } from './types';
import {
  TokenItemType,
  CustomChainInfo,
  Networks,
  BSC_SCAN,
  ETHEREUM_SCAN,
  TRON_SCAN,
  KWT_SCAN,
  network,
  NetworkChainId
} from '@oraichain/oraidex-common';
import { showToast } from '@src/utils/helper';

export const checkFnComponent = (titleRight: TypeTextAndCustomizeComponent, Element: React.ReactNode) => {
  if (!!titleRight) {
    if (typeof titleRight === 'string') {
      return Element;
    } else if (typeof titleRight === 'function') {
      return titleRight();
    }
    return titleRight;
  }
  return null;
};

export const handleErrorSwap = message => {
  showToast({
    message:
      message && message.length < 300
        ? message
        : 'Something went wrong! Please make sure you have enough fees to make this transaction.',
    type: 'danger'
  });
};

export const getTransactionUrl = (chainId: NetworkChainId, transactionHash: string) => {
  switch (Number(chainId)) {
    case Networks.bsc:
      return `${BSC_SCAN}/tx/${transactionHash}`;
    case Networks.mainnet:
      return `${ETHEREUM_SCAN}/tx/${transactionHash}`;
    case Networks.tron:
      return `${TRON_SCAN}/#/transaction/${transactionHash.replace(/^0x/, '')}`;
    default:
      // raw string
      switch (chainId) {
        case 'kawaii_6886-1':
          return `${KWT_SCAN}/tx/${transactionHash}`;
        case 'Oraichain':
          return `${network.explorer}/txs/${transactionHash}`;
      }
      return null;
  }
};
