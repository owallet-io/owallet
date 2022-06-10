import WalletConnect from '@walletconnect/client';
import { KeyRingStore, PermissionStore } from '@owallet/stores';
import {
  autorun,
  computed,
  makeObservable,
  observable,
  runInAction
} from 'mobx';
import { ChainStore } from '../chain';
import { OWallet } from '@owallet/provider';
import { Buffer } from 'buffer';
import { KVStore } from '@owallet/common';
import { WCMessageRequester } from './msg-requester';
import { RNRouterBackground } from '../../router';
import {
  getBasicAccessPermissionType,
  KeyRingStatus
} from '@owallet/background';
import { computedFn } from 'mobx-utils';
import { Key } from '@owallet/types';
import { AppState, Linking } from 'react-native';

export interface WalletConnectV1SessionRequest {
  id: number;
  jsonrpc: '2.0';
  method: string;
  params: [
    {
      peerId: string;
      peerMeta?: {
        name?: string;
        description?: string;
        icons?: string[];
        url?: string;
      };
    }
  ];
}

// Wallet connect v1.0 is not suitable for handling multiple chains.
// When the session requested, you cannot receive information from multiple chains,
// so open a session unconditionally and manage permissions through custom requests.
// Frontend should request the "owallet_enable_wallet_connect_V1" method with "chains" params.
// "chains" params should be in form of https://github.com/ChainAgnostic/CAIPs/blob/master/CAIPs/caip-2.md
export interface SessionRequestApproval {
  key: string;
  peerMeta: WalletConnectV1SessionRequest['params'][0]['peerMeta'];
  params: [
    {
      chains: string[];
    }
  ];
  resolve: () => void;
  reject: () => void;
}

export abstract class WalletConnectManager {
  @observable.shallow
  protected clientMap: Map<string, WalletConnect> = new Map();

  @observable.shallow
  protected pendingClientMap: Map<string, WalletConnect> = new Map();

  protected constructor(
    protected readonly chainStore: ChainStore,
    protected readonly keyRingStore: KeyRingStore
  ) {
    makeObservable(this);
  }

  hasClient(uri: string): boolean {
    return this.clientMap.has(uri);
  }

  getClient(uri: string): WalletConnect | undefined {
    return this.clientMap.get(uri);
  }

  async restoreClient(session: WalletConnect['session']) {
    const client = new WalletConnect({
      // TODO: Set metadata properly.
      clientMeta: {
        name: 'OWallet',
        description: 'Wallet for interchain',
        url: '#',
        icons: ['https://dhj8dql1kzq2v.cloudfront.net/owallet-256x256.png']
      },
      session
    });

    if (client.connected) {
      this.onSessionConnected(client);

      client.on('call_request', (error, payload) => {
        this.onCallRequest(client, error, payload);
      });

      client.on('disconnect', (error) => {
        if (error) {
          console.log(error);
          return;
        }
        this.onSessionDisconnected(client);
      });
    } else {
      this.onSessionDisconnected(client);
    }
  }

  protected async waitInitStores(): Promise<void> {
    // Wait until the chain store and account store is ready.
    if (this.chainStore.isInitializing) {
      await new Promise<void>((resolve) => {
        const disposer = autorun(() => {
          if (!this.chainStore.isInitializing) {
            resolve();
            if (disposer) {
              disposer();
            }
          }
        });
      });
    }

    if (this.keyRingStore.status !== KeyRingStatus.UNLOCKED) {
      await new Promise<void>((resolve) => {
        const disposer = autorun(() => {
          if (this.keyRingStore.status === KeyRingStatus.UNLOCKED) {
            resolve();
            if (disposer) {
              disposer();
            }
          }
        });
      });
    }
  }

  async initClient(uri: string): Promise<WalletConnect> {
    await this.waitInitStores();

    if (this.clientMap.has(uri)) {
      throw new Error('Client already initialized');
    }

    if (this.pendingClientMap.has(uri)) {
      throw new Error('Client is waiting session');
    }

    const client = new WalletConnect({
      uri,
      // TODO: Set metadata properly.
      clientMeta: {
        name: 'OWallet',
        description: 'Wallet for interchain',
        url: '#',
        icons: ['https://dhj8dql1kzq2v.cloudfront.net/owallet-256x256.png']
      }
    });

    runInAction(() => {
      this.pendingClientMap.set(uri, client);
    });

    let resolver: () => void;
    let rejector: (e: Error) => void;
    const promise = new Promise<void>((resolve, reject) => {
      resolver = resolve;
      rejector = reject;
    });

    const timeout = setTimeout(() => {
      rejector(new Error('Timeout'));
    }, 10000);

    const handler = (error: Error | null) => {
      if (error) {
        console.log(error);
        return;
      }

      client.on('disconnect', (error) => {
        if (error) {
          console.log(error);
          return;
        }

        this.onSessionDisconnected(client);
      });

      if (!client.peerMeta?.url) {
        client.rejectSession({
          message: 'Should provide the peer url'
        });
        resolver();
        return;
      }

      client.approveSession({
        // Unfortunately, wallet connect 1.0 cannot deliver the chain ids in the form we want,
        // so we temporarily set the chain id to 99999 and send it.
        // And, wallet connect v1.0 is not suitable for handling multiple chains.
        // When the session requested, you cannot receive information from multiple chains,
        // so open a session unconditionally and manage permissions through custom requests.
        chainId: 99999,
        accounts: []
      });
      this.onSessionConnected(client);
      resolver();
    };

    client.on('session_request', handler);

    try {
      await promise;

      client.off('session_request');

      runInAction(() => {
        this.clientMap.set(uri, client);
      });

      client.on('call_request', (error, payload) => {
        this.onCallRequest(client, error, payload);
      });

      return client;
    } finally {
      runInAction(() => {
        this.pendingClientMap.delete(uri);
      });
      clearTimeout(timeout);
    }
  }

  protected createOWalletAPI(sessionId: string) {
    return new OWallet(
      // TODO: Set version
      '',
      'core',
      new WCMessageRequester(RNRouterBackground.EventEmitter, sessionId)
    );
  }

  protected readonly onCallRequest = async (
    client: WalletConnect,
    error: Error | null,
    payload: any
  ) => {
    if (error) {
      console.log(error);
      return;
    }

    const id = payload.id;
    if (!id) {
      console.log("Payload's id is empty", payload);
      return;
    }

    await this.waitInitStores();

    const owallet = this.createOWalletAPI(client.session.key);

    try {
      switch (payload.method) {
        case 'owallet_enable_wallet_connect_v1': {
          if (payload.params.length === 0) {
            throw new Error('Invalid parmas');
          }
          for (const param of payload.params) {
            if (typeof param !== 'string') {
              throw new Error('Invalid parmas');
            }
          }
          await owallet.enable(payload.params);
          client.approveRequest({
            id,
            result: []
          });
          break;
        }
        case 'owallet_get_key_wallet_connect_v1': {
          if (payload.params.length !== 1) {
            throw new Error('Invalid parmas');
          }
          if (typeof payload.params[0] !== 'string') {
            throw new Error('Invalid parmas');
          }
          const key = await owallet.getKey(payload.params[0]);
          client.approveRequest({
            id,
            result: [
              {
                name: key.name,
                algo: key.algo,
                pubKey: Buffer.from(key.pubKey).toString('hex'),
                address: Buffer.from(key.address).toString('hex'),
                bech32Address: key.bech32Address,
                isNanoLedger: key.isNanoLedger
              }
            ]
          });
          break;
        }
        case 'owallet_sign_amino_wallet_connect_v1': {
          if (payload.params.length !== 3 && payload.params.length !== 4) {
            throw new Error('Invalid parmas');
          }

          const result = await owallet.signAmino(
            payload.params[0],
            payload.params[1],
            payload.params[2],
            payload.params[3]
          );
          client.approveRequest({
            id,
            result: [result]
          });
          break;
        }
        default:
          throw new Error(`Unknown method (${payload.method})`);
      }
    } catch (e) {
      client.rejectRequest({
        id,
        error: {
          message: e.message
        }
      });
    }
  };

  protected abstract onSessionConnected(client: WalletConnect): Promise<void>;
  protected abstract onSessionDisconnected(
    client: WalletConnect
  ): Promise<void>;
}

export class WalletConnectStore extends WalletConnectManager {
  @observable.shallow
  protected _clients: WalletConnect[] = [];

  constructor(
    protected readonly kvStore: KVStore,
    protected readonly eventListener: {
      addEventListener: (type: string, fn: () => unknown) => void;
      removeEventListener: (type: string, fn: () => unknown) => void;
    },
    protected readonly chainStore: ChainStore,
    protected readonly keyRingStore: KeyRingStore,
    protected readonly permissionStore: PermissionStore
  ) {
    super(chainStore, keyRingStore);

    makeObservable(this);

    this.restore();
    this.initDeepLink();

    /*
     Unfortunately, owallet can handle the one key at the same time.
     So, if the other key was selected when the wallet connect connected and the frontend uses that account
     after the user changes the key on OWallet, the requests can't be handled properly.
     To reduce this problem, OWallet send the "owallet_keystore_may_changed_event_wallet_connect_v1" to the connected clients
     whenever the app is unlocked or user changes the key.
     */
    this.eventListener.addEventListener('owallet_keystoreunlock', () =>
      this.sendAccountMayChangedEventToClients()
    );
    this.eventListener.addEventListener('owallet_keystorechange', () =>
      this.sendAccountMayChangedEventToClients()
    );
  }

  protected async initDeepLink() {
    await this.checkInitialURL();

    Linking.addEventListener('url', (e) => {
      this.processDeepLinkURL(e.url);
    });

    AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        if (this._isAndroidActivityKilled) {
          // If the android activity restored, the deep link url handler will not work.
          // We should recheck the initial URL()
          this.checkInitialURL();
        }
        this._isAndroidActivityKilled = false;
      } else {
        this.clearNeedGoBackToBrowser();
      }
    });
  }

  protected async checkInitialURL() {
    const initialURL = await Linking.getInitialURL();
    if (initialURL) {
      this.processDeepLinkURL(initialURL);
    }

    Linking.addEventListener("url", (e) => {
      this.processDeepLinkURL(e.url);
    });
  }

  protected processDeepLinkURL(_url: string) {
    try {
      const url = new URL(_url);
      if (url.protocol === 'owallet:' && url.host === 'wcV1') {
        let params = url.search;
        if (params) {
          if (params.startsWith('?')) {
            params = params.slice(1);
          }
          if (this.canInitClient(params)) {
            runInAction(() => {
              this._isPendingClientFromDeepLink = true;
            });

            this.initClient(params)
              .then((client) => {
                this.deepLinkClientKeyMap[client.key] = true;
                this.saveDeepLinkClientKeyMap(this.deepLinkClientKeyMap);
              })
              .catch((e) => {
                console.log('Failed to init wallet connect v1 client', e);
              })
              .finally(() => {
                runInAction(() => {
                  this._isPendingClientFromDeepLink = false;
                });
              });
          }
        }
      }
    } catch (e) {
      console.log(e);
    }
  }

  onAndroidActivityKilled() {
    this._isAndroidActivityKilled = true;
  }

  protected onCallBeforeRequested(client: WalletConnect) {
    super.onCallBeforeRequested(client);

    this.wcCallCount++;

    if (this.deepLinkClientKeyMap[client.session.key]) {
      this.isPendingWcCallFromDeepLinkClient = true;
    }
  }

  @action
  protected onCallAfterRequested(client: WalletConnect) {
    super.onCallAfterRequested(client);

    this.wcCallCount--;
    if (this.wcCallCount == 0 && this.isPendingWcCallFromDeepLinkClient) {
      this.isPendingWcCallFromDeepLinkClient = false;

      if (AppState.currentState === 'active') {
        this._needGoBackToBrowser = true;
      }
    }
  }

  /**
   clearNeedGoBackToBrowser is used in the component to set the needGoBackToBrowser as false.
   */
  @action
  clearNeedGoBackToBrowser() {
    this._needGoBackToBrowser = false;
  }

  protected async sendAccountMayChangedEventToClients() {
    await this.waitInitStores();

    const keyForChainCache: Record<string, Key> = {};
    for (const client of this._clients) {
      let keys:
        | {
            name: string;
            algo: string;
            isNanoLedger: boolean;
            keys: {
              chainIdentifier: string;
              // Hex encoded
              pubKey: string;
              // Hex encoded
              address: string;
              bech32Address: string;
            }[];
          }
        | undefined;

      const owallet = this.createOWalletAPI(client.session.key);

      const permittedChains =
        await this.permissionStore.getOriginPermittedChains(
          WCMessageRequester.getVirtualSessionURL(client.session.key),
          getBasicAccessPermissionType()
        );

      for (const chain of permittedChains) {
        const key = keyForChainCache[chain] ?? (await owallet.getKey(chain));
        if (!keyForChainCache[chain]) {
          keyForChainCache[chain] = key;
        }

        if (!keys) {
          keys = {
            name: key.name,
            algo: key.algo,
            isNanoLedger: key.isNanoLedger,
            keys: [
              {
                chainIdentifier: chain,
                pubKey: Buffer.from(key.pubKey).toString('hex'),
                address: Buffer.from(key.address).toString('hex'),
                bech32Address: key.bech32Address
              }
            ]
          };
        } else {
          keys.keys.push({
            chainIdentifier: chain,
            pubKey: Buffer.from(key.pubKey).toString('hex'),
            address: Buffer.from(key.address).toString('hex'),
            bech32Address: key.bech32Address
          });
        }
      }

      if (keys) {
        client.sendCustomRequest({
          id: Math.floor(Math.random() * 100000),
          jsonrpc: '2.0',
          method: 'owallet_keystore_may_changed_event_wallet_connect_v1',
          params: [keys]
        });
      }
    }
  }

  getSession = computedFn((sessionId: string) => {
    return this.sessions.find((session) => session.key === sessionId);
  });

  @computed
  get sessions(): WalletConnect['session'][] {
    return this._clients.map((client) => {
      return client.session;
    });
  }

  protected async restore(): Promise<void> {
    const deepLinkClientMap = await this.kvStore.get<
      Record<string, true | undefined>
    >('deep_link_client_keys');
    if (deepLinkClientMap) {
      this.deepLinkClientKeyMap = deepLinkClientMap;
    }

    const persistentSessions = await this.getPersistentSessions();

    for (const session of persistentSessions) {
      this.restoreClient(session);
    }
  }

  async disconnect(sessionId: string): Promise<void> {
    const client = this._clients.find(
      (client) => client.session.key === sessionId
    );
    if (client) {
      await client.killSession({
        message: 'User requests disconnection'
      });
    }
  }

  protected async getPersistentSessions(): Promise<WalletConnect['session'][]> {
    const result = await this.kvStore.get<WalletConnect['session'][]>(
      'persistent_session_v1'
    );
    if (!result) {
      return [];
    }
    return result;
  }

  protected async setPersistentSessions(
    value: WalletConnect['session'][]
  ): Promise<void> {
    await this.kvStore.set('persistent_session_v1', value);
  }

  protected async saveDeepLinkClientKeyMap(
    keys: Record<string, true | undefined>
  ): Promise<void> {
    this.deepLinkClientKeyMap = keys;
    await this.kvStore.set('deep_link_client_keys', keys);
  }

  protected async onSessionConnected(client: WalletConnect): Promise<void> {
    const clients = this._clients;

    if (
      !clients.find(
        (persistent) => persistent.session.key === client.session.key
      )
    ) {
      runInAction(() => {
        clients.push(client);
      });
      await this.setPersistentSessions(
        clients.map((client) => {
          return client.session;
        })
      );
    }
  }

  protected async onSessionDisconnected(client: WalletConnect): Promise<void> {
    runInAction(() => {
      this._clients = this._clients.filter(
        (persistent) => persistent.session.key !== client.session.key
      );
    });
    await this.setPersistentSessions(
      this._clients.map((client) => {
        return client.session;
      })
    );

    for (const chainInfo of this.chainStore.chainInfos) {
      await this.permissionStore
        .getBasicAccessInfo(chainInfo.chainId)
        .removeOrigin(
          WCMessageRequester.getVirtualSessionURL(client.session.key)
        );
    }
  }
}
