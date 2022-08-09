import CosmosApp from '@ledgerhq/hw-app-cosmos';
import TransportWebHID from '@ledgerhq/hw-transport-webhid';
import TransportWebUSB from '@ledgerhq/hw-transport-webusb';
import { signatureImport } from 'secp256k1';
import { Buffer } from 'buffer';
import { fromString } from 'bip32-path';

import Transport from '@ledgerhq/hw-transport';

export type TransportIniter = (...args: any[]) => Promise<Transport>;

export enum LedgerInitErrorOn {
  Transport,
  App,
  Unknown
}

export const LedgerWebUSBIniter: TransportIniter = async () => {
  return await TransportWebUSB.create();
};

export const LedgerWebHIDIniter: TransportIniter = async () => {
  return await TransportWebHID.create();
};

export class LedgerInitError extends Error {
  constructor(public readonly errorOn: LedgerInitErrorOn, message?: string) {
    super(message);

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, LedgerInitError.prototype);
  }
}

export class Ledger {
  constructor(private readonly cosmosApp: CosmosApp) {}

  static async init(
    mode: 'webusb' | 'webhid',
    initArgs: any[] = []
  ): Promise<Ledger> {
    const transportIniter =
      mode === 'webusb' ? LedgerWebUSBIniter : LedgerWebHIDIniter;

    const transport = await transportIniter(...initArgs);
    try {
      const cosmosApp = new CosmosApp(transport);
      const ledger = new Ledger(cosmosApp);
      const versionResponse = await ledger.getVersion();

      // In this case, device is on screen saver.
      // However, it is almost same as that the device is not unlocked to user-side.
      // So, handle this case as initializing failed in `Transport`.
      if (versionResponse.deviceLocked) {
        throw new Error('Device is on screen saver');
      }

      return ledger;
    } catch (e) {
      if (transport) {
        await transport.close();
      }
      if (e.message === 'Device is on screen saver') {
        throw new LedgerInitError(LedgerInitErrorOn.Transport, e.message);
      }

      throw new LedgerInitError(LedgerInitErrorOn.App, e.message);
    }
  }

  async getVersion(): Promise<{
    deviceLocked: boolean;
    major: number;
    version: string;
    testMode: boolean;
  }> {
    if (!this.cosmosApp) {
      throw new Error('Cosmos App not initialized');
    }

    const { version, device_locked, major, test_mode } =
      await this.cosmosApp.getAppConfiguration();

    return {
      deviceLocked: device_locked,
      major,
      version,
      testMode: test_mode
    };
  }

  async getPublicKey(path: number[] | string): Promise<Uint8Array> {
    if (!this.cosmosApp) {
      throw new Error('Cosmos App not initialized');
    }

    // make compartible with ledger-cosmos-js
    const { publicKey } = await this.cosmosApp.getAddress(
      typeof path === 'string' ? fromString(path).toPathArray() : path,
      'cosmos'
    );

    return Buffer.from(publicKey, 'hex');
  }

  async sign(
    path: number[] | string,
    message: Uint8Array
  ): Promise<Uint8Array> {
    if (!this.cosmosApp) {
      throw new Error('Cosmos App not initialized');
    }

    const { signature } = await this.cosmosApp.sign(
      typeof path === 'string' ? fromString(path).toPathArray() : path,
      message
    );

    // Parse a DER ECDSA signature
    return signatureImport(signature);
  }

  async close(): Promise<void> {
    return await this.cosmosApp.transport.close();
  }

  static async isWebHIDSupported(): Promise<boolean> {
    return await TransportWebHID.isSupported();
  }
}

let ledger: Ledger = null;

const channelDevice = new BroadcastChannel('device');

channelDevice.addEventListener('message', async (event) => {
  const { method, args, requestId } = event.data;
  let response: any;

  switch (method) {
    case 'init':
      const [mode, initArgs] = args;
      ledger = await Ledger.init(mode, initArgs);
      response = true;
      break;
    case 'isWebHIDSupported':
      response = await Ledger.isWebHIDSupported();
      break;
    default:
      response = await ledger[method].apply(ledger, args);
      break;
  }
  // use response to filter request
  channelDevice.postMessage({ requestId, response });
});
