import { InjectedOWallet, InjectedEthereum } from '@owallet/provider';
import { OWalletMode, EthereumMode } from '@owallet/types';

export class RNInjectedEthereum extends InjectedEthereum {
  static parseWebviewMessage(message: any): any {
    if (message && typeof message === 'string') {
      try {
        return JSON.parse(message);
      } catch (err) {
        alert(`parseWebviewMessage err`);
        alert(err.message);
        // noop
      }
    }

    return message;
  }

  constructor(version: string, mode: EthereumMode) {
    super(
      version,
      mode,
      {
        addMessageListener: (fn: (e: any) => void) => {
          alert(`addMessageListener ${JSON.stringify(fn)}`);
          window.addEventListener('message', fn);
        },
        removeMessageListener: (fn: (e: any) => void) =>
          window.removeEventListener('message', fn),
        postMessage: message => {
          alert(`postMessage ${JSON.stringify(message)}`);
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          window.ReactNativeWebView.postMessage(JSON.stringify(message));
        }
      },
      RNInjectedEthereum.parseWebviewMessage
    );
  }
}

export class RNInjectedOWallet extends InjectedOWallet {
  static parseWebviewMessage(message: any): any {
    if (message && typeof message === 'string') {
      try {
        return JSON.parse(message);
      } catch {
        // noop
      }
    }

    try {
      if (!message.id) {
        throw new Error("Empty id");
      }

  constructor(version: string, mode: OWalletMode) {
    super(
      version,
      mode,
      {
        addMessageListener: (fn: (e: any) => void) =>
          window.addEventListener('message', fn),
        removeMessageListener: (fn: (e: any) => void) =>
          window.removeEventListener('message', fn),
        postMessage: message => {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          window.ReactNativeWebView.postMessage(JSON.stringify(message));
        }
      },
      RNInjectedOWallet.parseWebviewMessage
    );
  }
}
