import { init, ScryptParams } from '@owallet/background';
import {
  RNEnv,
  RNMessageRequesterInternalToUI,
  RNRouterBackground
} from '../router';
import { AsyncKVStore } from '../common';
import scrypt from 'react-native-scrypt';
import { Buffer } from 'buffer/';
import TransportBLE from '@ledgerhq/react-native-hw-transport-ble';
import { getRandomBytesAsync } from '../common';
import { BACKGROUND_PORT } from '@owallet/router';

import { EmbedChainInfos } from '@owallet/common';
import {
  getLastUsedLedgerDeviceId,
  setLastUsedLedgerDeviceId
} from '../utils/ledger';

import { DAppInfos } from '../screens/web/config';

const router = new RNRouterBackground(RNEnv.produceEnv);

init(
  router,
  (prefix: string) => new AsyncKVStore(prefix),
  new RNMessageRequesterInternalToUI(),
  EmbedChainInfos,
  // allow all dApps
  DAppInfos.map((dApp) => dApp.uri),
  getRandomBytesAsync,
  {
    scrypt: async (text: string, params: ScryptParams) => {
      return Buffer.from(
        await scrypt(
          Buffer.from(text).toString('hex'),
          // Salt is expected to be encoded as Hex
          params.salt,
          params.n,
          params.r,
          params.p,
          params.dklen,
          'hex'
        ),
        'hex'
      );
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
    defaultMode: 'ble',
    transportIniters: {
      ble: async (deviceId?: string) => {
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
      }
    }
  }
);

router.listen(BACKGROUND_PORT);
