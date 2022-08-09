const channelDevice = new BroadcastChannel('device');

const callProxy = (method: string, args: any[] = []): Promise<any> =>
  new Promise((resolve) => {
    let requestId = Date.now();
    const handler = ({ data }) => {
      // match requestId
      if (data.requestId !== requestId) return;
      resolve(data.response);
      channelDevice.removeEventListener('message', handler);
    };
    channelDevice.addEventListener('message', handler);
    channelDevice.postMessage({ method, args, requestId });
  });

export class Ledger {
  static async init(mode: string, initArgs: any[] = []): Promise<Ledger> {
    await callProxy('init', [mode, initArgs]);
    return new Ledger();
  }

  getVersion(): Promise<{
    deviceLocked: boolean;
    major: number;
    version: string;
    testMode: boolean;
  }> {
    return callProxy('getVersion');
  }

  getPublicKey(path: number[] | string): Promise<Uint8Array> {
    return callProxy('getPublicKey', [path]);
  }

  sign(path: number[] | string, message: Uint8Array): Promise<Uint8Array> {
    return callProxy('sign', [path, message]);
  }

  close(): Promise<void> {
    return callProxy('close');
  }

  static isWebHIDSupported(): Promise<boolean> {
    return callProxy('isWebHIDSupported');
  }
}
