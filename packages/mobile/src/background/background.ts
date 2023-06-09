import { init, LedgerInternal, ScryptParams } from '@owallet/background';
import {
  RNEnv,
  RNMessageRequesterInternalToUI,
  RNRouterBackground
} from '../router';
import { AsyncKVStore } from '../common';
import scrypt from 'scrypt-async-modern';
import { Buffer } from 'buffer';
import TransportBLE from '@ledgerhq/react-native-hw-transport-ble';
import { BACKGROUND_PORT } from '@owallet/router';
import { EmbedChainInfos } from '@owallet/common';
import {
  getLastUsedLedgerDeviceId,
  setLastUsedLedgerDeviceId
} from '../utils/ledger';
import { DAppInfos } from '../screens/web/config';

// done polyfill
const { webcrypto } = require('crypto');
const router = new RNRouterBackground(RNEnv.produceEnv);

LedgerInternal.transportIniters.ble = async (deviceId?: string) => {
  const lastDeviceId = await getLastUsedLedgerDeviceId();

  if (!deviceId && !lastDeviceId) {
    throw new Error('Device id is empty');
  }

  if (!deviceId) {
    deviceId = lastDeviceId;
  }

  if (deviceId && deviceId !== lastDeviceId) {
    await setLastUsedLedgerDeviceId(deviceId);
  }

  return await TransportBLE.open(deviceId);
};

init(
  router,
  (prefix: string) => new AsyncKVStore(prefix),
  new RNMessageRequesterInternalToUI(),
  EmbedChainInfos,
  // allow all dApps
  DAppInfos.map(dApp => dApp.uri),
  // @ts-ignore
  webcrypto.getRandomValues,
  {
    scrypt: async (text: string, params: ScryptParams) => {
      const buf = await scrypt(text, Buffer.from(params.salt, 'hex'), {
        dkLen: params.dklen,
        N: params.n,
        r: params.r,
        p: params.p,
        encoding: 'binary'
      });
      return buf;
    }
  },
  {
    create: (params: {
      iconRelativeUrl?: string;
      title: string;
      message: string;
    }) => {
      console.log(`Notification: ${params.title}, ${params.message}`);
    }
  },
  {
    defaultMode: 'ble'
  }
);

router.listen(BACKGROUND_PORT);
