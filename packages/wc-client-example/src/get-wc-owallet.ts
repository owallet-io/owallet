import { OWallet } from '@owallet/types';
import WalletConnect from '@walletconnect/client';
import { OWalletQRCodeModalV1 } from '@owallet/wc-qrcode-modal';
import { OWalletConnectV1 } from '@owallet/wc-client';
import { BroadcastMode, StdTx } from '@cosmjs/launchpad';
import Axios from 'axios';
import { EmbedChainInfos } from './config';
import { Buffer } from 'buffer';

let owallet: OWallet | undefined = undefined;
let promise: Promise<OWallet> | undefined = undefined;

async function sendTx(
  chainId: string,
  stdTx: StdTx,
  mode: BroadcastMode
): Promise<Uint8Array> {
  const params = {
    tx: stdTx,
    mode
  };

  const restInstance = Axios.create({
    baseURL: EmbedChainInfos.find((chainInfo) => chainInfo.chainId === chainId)!
      .rest
  });

  const result = await restInstance.post('/txs', params);

  return Buffer.from(result.data.txhash, 'hex');
}

export function getWCOWallet(): Promise<OWallet> {
  if (owallet) {
    return Promise.resolve(owallet);
  }

  const fn = () => {
    const connector = new WalletConnect({
      bridge: 'https://bridge.walletconnect.org', // Required
      signingMethods: [
        'owallet_enable_wallet_connect_v1',
        'owallet_sign_amino_wallet_connect_v1'
      ],
      qrcodeModal: new OWalletQRCodeModalV1()
    });

    // Check if connection is already established
    if (!connector.connected) {
      // create new session
      connector.createSession();

      return new Promise<OWallet>((resolve, reject) => {
        connector.on('connect', (error) => {
          if (error) {
            reject(error);
          } else {
            owallet = new OWalletConnectV1(connector, {
              sendTx
            });
            resolve(owallet);
          }
        });
      });
    } else {
      owallet = new OWalletConnectV1(connector, {
        sendTx
      });
      return Promise.resolve(owallet);
    }
  };

  if (!promise) {
    promise = fn();
  }

  return promise;
}
