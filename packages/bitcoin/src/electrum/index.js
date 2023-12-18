import bitcoin from 'bitcoinjs-lib';
import { clients } from './clients';
import { ElectrumClient } from './electrum-client/electrum/client';
import { networks } from '../networks';
import { restBtc } from '@owallet/common';
import Axios from 'axios';
const fetch = require('node-fetch').default;
import peersJson from './peers.json';

let electrumKeepAlive = () => null;
let electrumKeepAliveInterval = 60000;

const pauseExecution = (duration = 500) => {
  return new Promise(async (resolve) => {
    try {
      const wait = () => resolve({ error: false });
      setTimeout(wait, duration);
    } catch (e) {
      console.log(e);
      resolve({ error: true });
    }
  });
};

const getDefaultPeers = (coin, protocol) => {
  return peersJson[coin].map((peer) => {
    try {
      return { ...peer, protocol };
    } catch {}
  });
};

const getScriptHash = (address = '', network = networks['bitcoin']) => {
  const script = bitcoin.address.toOutputScript(address, network);
  let hash = bitcoin.crypto.sha256(script);
  const reversedHash = new Buffer(hash.reverse());
  return reversedHash.toString('hex');
};

const getTimeout = ({ arr = undefined, timeout = 2000 } = {}) => {
  try {
    if (arr && Array.isArray(arr) && arr.length > 0) return ((arr.length * timeout) / 2) | timeout;
    return timeout;
  } catch {
    return timeout;
  }
};

//peers = A list of peers acquired from default electrum servers using the getPeers method.
//customPeers = A list of peers added by the user to connect to by default in lieu of the default peer list.
export const start = ({ id = Math.random(), coin = '', peers = [], customPeers = [] } = {}) => {
  const method = 'connectToPeer';
  return new Promise(async (resolve) => {
    try {
      if (!coin) resolve({ error: true, data: {} });
      //Clear/Remove any previous keep-alive message.
      try {
        clearInterval(electrumKeepAlive);
      } catch {}
      clients.coin = coin;
      let customPeersLength = 0;
      try {
        customPeersLength = customPeers.length;
      } catch {}
      //Attempt to connect to specified peer
      let connectionResponse = { error: true, data: '' };

      if (customPeersLength > 0) {
        const { port = '', host = '', protocol = 'wss' } = customPeers[0];
        connectionResponse = await connectToPeer({
          port,
          host,
          protocol,
          coin
        });
      } else {
        //Attempt to connect to random peer if none specified
        connectionResponse = await connectToRandomPeer(coin, peers, protocol);
      }
      resolve({
        id,
        error: connectionResponse.error,
        method: 'connectToPeer',
        data: connectionResponse.data,
        customPeers,
        coin
      });
    } catch (e) {
      console.log(e);
      resolve({ error: true, method, data: e });
    }
  });
};

export const batchAddresses = ({ coin = 'bitcoinTestnet', scriptHashes = [] } = {}) => {
  return new Promise(async (resolve) => {
    const response = await promiseTimeout(
      getTimeout(scriptHashes),
      clients.mainClient[coin].blockchain_scripthash_getHistoryBatch(scriptHashes)
    );
    resolve(response);
  });
};

const connectToPeer = ({ port = 50002, host = '', protocol = 'wss', coin = 'bitcoin' } = {}) => {
  return new Promise(async (resolve) => {
    try {
      clients.coin = coin;
      let needToConnect = clients.mainClient[coin] === false;

      let connectionResponse = { error: false, data: clients.peer[coin] };
      if (!needToConnect) {
        //Ensure the server is still alive
        const pingResponse = await pingServer();
        if (pingResponse.error) {
          await disconnectFromPeer({ coin });
          needToConnect = true;
        }
      }
      if (needToConnect) {
        clients.mainClient[coin] = new ElectrumClient(host, port, protocol);

        connectionResponse = await promiseTimeout(10000, clients.mainClient[coin].connect());
        if (connectionResponse.error) {
          return resolve(connectionResponse);
        }
        /*
         * The scripthash doesn't have to be valid.
         * We're simply testing if the server will respond to a batch request.
         */
        const scriptHash = '32cc2b0b1ebcf8a136e10f4a2f25ca86e0232b2161f9bab05577827c9314cd85';
        const testResponses = await Promise.all([
          pingServer(),
          getAddressScriptHashesBalance({ coin, addresses: [{ scriptHash }] })
        ]);

        if (testResponses[0].error || testResponses[1].error) {
          return resolve({ error: true, data: '' });
        }
        try {
          //Clear/Remove Electrum's keep-alive message.
          clearInterval(electrumKeepAlive);
          //Start Electrum's keep-alive function. It’s sent every minute as a keep-alive message.
          electrumKeepAlive = setInterval(async () => {
            try {
              pingServer({ id: Math.random() });
            } catch {}
          }, electrumKeepAliveInterval);
        } catch (e) {}
        clients.peer[coin] = { port, host, protocol };
      }
      resolve(connectionResponse);
    } catch (e) {
      resolve({ error: true, data: e });
    }
  });
};

export const connectToRandomPeer = async (coin, peers = [], protocol = 'wss') => {
  //Peers can be found in peers.json.
  //Additional Peers can be located here in servers.json & servers_testnet.json for reference: https://github.com/spesmilo/electrum/tree/master/electrum
  let hasPeers = false;

  try {
    hasPeers =
      (Array.isArray(peers) && peers.length) || (Array.isArray(clients.peers[coin]) && clients.peers[coin].length);
  } catch {}
  if (hasPeers) {
    if (Array.isArray(peers) && peers.length) {
      //Update peer list
      clients.peers[coin] = peers;
    } else {
      //Set the saved peer list
      peers = clients.peers[coin];
    }
  } else {
    //Use the default peer list for a connection if no other peers were passed down and no saved peer list is present.
    peers = getDefaultPeers(coin, protocol);
  }

  const initialPeerLength = peers.length; //Acquire length of our default peers.
  //Attempt to connect to a random default peer. Continue to iterate through default peers at random if unable to connect.
  for (let i = 0; i <= initialPeerLength; i++) {
    try {
      const randomIndex = (peers.length * Math.random()) | 0;
      const peer = peers[randomIndex];

      const port = peer.port;
      const host = peer.host;
      protocol = peer.protocol;

      const connectionResponse = await connectToPeer({
        port,
        host,
        protocol,
        coin
      });

      if (connectionResponse.error === false) {
        return {
          error: connectionResponse.error,
          method: 'connectToRandomPeer',
          data: connectionResponse.data,
          coin
        };
      } else {
        clients.mainClient[coin].close && clients.mainClient[coin].close();
        clients.mainClient[coin] = false;
        if (peers.length === 1) {
          return {
            error: true,
            method: 'connectToRandomPeer',
            data: connectionResponse.data,
            coin
          };
        }
        peers.splice(randomIndex, 1);
      }
    } catch (e) {
      console.log(e);
    }
  }
  return {
    error: true,
    method: 'connectToRandomPeer',
    data: 'Unable to connect to any peer.'
  };
};

export const stop = async ({ coin = '' } = {}) => {
  return new Promise(async (resolve) => {
    try {
      //Clear/Remove Electrum's keep-alive message.
      clearInterval(electrumKeepAlive);
      //Disconnect from peer
      const response = await disconnectFromPeer({ coin });
      resolve(response);
    } catch (e) {
      resolve({ error: true, data: e });
    }
  });
};

export const promiseTimeout = async (ms, promise) => {
  let id;
  let timeout = new Promise((resolve) => {
    id = setTimeout(() => {
      resolve({ error: true, data: 'Timed Out.' });
    }, ms);
  });

  const result = await Promise.race([promise, timeout]);

  clearTimeout(id);
  try {
    if ('error' in result && 'data' in result) return result;
  } catch {}
  return { error: false, data: result };
};

export const subscribeHeader = async ({ id = 'subscribeHeader', coin = '', onReceive = () => null } = {}) => {
  try {
    if (clients.mainClient[coin] === false) await connectToRandomPeer(coin, clients.peers[coin]);
    if (clients.subscribedHeaders[coin] === true)
      return {
        id,
        error: false,
        method: 'subscribeHeader',
        data: 'Already Subscribed.',
        coin
      };
    const res = await promiseTimeout(
      10000,
      clients.mainClient[coin].subscribe.on('blockchain.headers.subscribe', onReceive)
    );
    if (res.error) return { ...res, id, method: 'subscribeHeader' };
    const response = await promiseTimeout(10000, clients.mainClient[coin].blockchain_headers_subscribe());
    if (!response.error) clients.subscribedHeaders[coin] = true;
    return { ...response, id, method: 'subscribeHeader' };
  } catch (e) {
    return { id, error: true, method: 'subscribeHeader', data: e, coin };
  }
};

export const subscribeAddress = async ({
  id = 'wallet0bitcoin',
  address = '',
  coin = 'bitcoin',
  onReceive = (data) => console.log(data)
} = {}) => {
  try {
    if (clients.mainClient[coin] === false) await connectToRandomPeer(coin, clients.peers[coin]);
    //Ensure this address is not already subscribed
    if (clients.subscribedAddresses[coin].length < 1) {
      const res = await promiseTimeout(
        10000,
        clients.mainClient[coin].subscribe.on('blockchain.scripthash.subscribe', onReceive)
      );
      if (res.error) return { ...res, id, method: 'subscribeAddress' };
    }
    if (clients.subscribedAddresses[coin].includes(address))
      return { id, error: false, method: 'subscribeAddress', data: '' };
    const response = await promiseTimeout(10000, clients.mainClient[coin].blockchain_scripthash_subscribe(address));
    if (!response.error) clients.subscribedAddresses[coin].push(address);
    return { ...response, id, method: 'subscribeAddress' };
  } catch (e) {
    return { id, error: true, method: 'subscribeAddress', data: e };
  }
};

export const unSubscribeAddress = async (scriptHashes = [], id = Math.random()) => {
  return new Promise(async (resolve) => {
    try {
      if (clients.mainClient[coin] === false) await connectToRandomPeer(coin, clients.peers[coin]);
      let responses = [];
      await Promise.all(
        scriptHashes.map(async (scriptHash) => {
          try {
            const response = await clients.mainClient[coin].blockchain_scripthash_unsubscribe(scriptHash);
            responses.push(response);
          } catch {}
        })
      );
      resolve({
        id,
        error: false,
        method: 'unSubscribeAddress',
        data: responses
      });
    } catch (e) {
      resolve({
        id,
        error: true,
        method: 'unSubscribeAddress',
        data: e,
        scriptHashes
      });
    }
  });
};

export const disconnectFromPeer = async ({ id = Math.random(), coin = '' } = {}) => {
  const failure = (data = {}) => {
    return { error: true, id, method: 'disconnectFromPeer', data };
  };
  try {
    if (clients.mainClient[coin] === false) {
      //No peer to disconnect from peer...
      return {
        error: false,
        data: 'No peer to disconnect from.',
        id,
        coin,
        method: 'disconnectFromPeer'
      };
    }
    //Attempt to disconnect from peer...
    clients.mainClient[coin].close();
    clients.mainClient[coin] = false;
    clients.coin = '';
    await pauseExecution();
    return {
      error: false,
      id,
      method: 'disconnectFromPeer',
      coin,
      data: 'Disconnected...'
    };
  } catch (e) {
    failure(e);
  }
};

export const getAddressBalance = ({ address = '', id = Math.random(), coin = '' } = {}) => {
  const method = 'getAddressBalance';
  return new Promise(async (resolve) => {
    try {
      if (clients.mainClient[coin] === false) await connectToRandomPeer(coin, clients.peers[coin]);
      const response = await promiseTimeout(
        getTimeout(),
        clients.mainClient[coin].blockchainAddress_getBalance(address)
      );
      return { id, method, coin, ...response };
    } catch (e) {
      console.log(e);
      resolve({ error: true, method, data: e, coin });
    }
  });
};

export const getAddressScriptHash = ({ address = '', coin = '' } = {}) => {
  try {
    const scriptHash = getScriptHash(address, networks[coin]);
    return { error: false, data: scriptHash };
  } catch (e) {
    return { error: true, data: e };
  }
};

export const getAddressScriptHashBalance = ({ scriptHash = '', id = Math.random(), coin = '' } = {}) => {
  const method = 'getAddressScriptHashBalance';
  return new Promise(async (resolve) => {
    try {
      if (clients.mainClient[coin] === false) await connectToRandomPeer(coin, clients.peers[coin]);
      const { error, data } = await promiseTimeout(
        getTimeout(),
        clients.mainClient[coin].blockchain_scripthash_getBalance(scriptHash)
      );
      resolve({ id, error, method, data, scriptHash, coin });
    } catch (e) {
      console.log(e);
      return { id, error: true, method, data: e, coin };
    }
  });
};

export const getAddressScriptHashesBalance = ({ addresses = [], id = Math.random(), coin = '' } = {}) => {
  const method = 'getAddressScriptHashesBalance';
  return new Promise(async (resolve) => {
    try {
      if (clients.mainClient[coin] === false) await connectToRandomPeer(coin, clients.peers[coin]);
      const timeout = getTimeout({ arr: addresses });

      const { error, data } = await promiseTimeout(
        timeout,
        clients.mainClient[coin].blockchain_scripthashes_getBalance(addresses.map((a) => a.scriptHash))
      );
      resolve({ id, error, method, data, coin });
    } catch (e) {
      console.log(e);
      resolve({ id, error: true, method, data: e, coin });
    }
  });
};

export const getAddressScriptHashHistory = async ({ scriptHash = '', id = Math.random(), coin = '' } = {}) => {
  const method = 'getAddressScriptHashHistory';
  return new Promise(async (resolve) => {
    try {
      if (clients.mainClient[coin] === false) await connectToRandomPeer(coin, clients.peers[coin]);
      const { error, data } = await promiseTimeout(
        getTimeout(),
        clients.mainClient[coin].blockchain_scripthash_getHistory(scriptHash)
      );
      resolve({ id, error, method, data, coin });
    } catch (e) {
      console.log(e);
      resolve({ id, error: true, method, data: e, coin });
    }
  });
};

export const getAddressScriptHashesHistory = ({ addresses = [], id = Math.random(), coin = '' } = {}) => {
  const method = 'getAddressScriptHashesHistory';
  return new Promise(async (resolve) => {
    try {
      if (clients.mainClient[coin] === false) await connectToRandomPeer(coin, clients.peers[coin]);
      const timeout = getTimeout({ arr: addresses });
      const { error, data } = await promiseTimeout(
        timeout,
        clients.mainClient[coin].blockchain_scripthashes_getHistory(addresses.map((a) => a.scriptHash))
      );
      resolve({ id, error, method, data, coin });
    } catch (e) {
      console.log(e);
      resolve({ id, error: true, method, data: [], coin });
    }
  });
};

export const listUnspentAddressScriptHash = ({ scriptHash = '', id = Math.random(), coin = '' } = {}) => {
  const method = 'listUnspentAddressScriptHash';
  return new Promise(async (resolve) => {
    try {
      if (clients.mainClient[coin] === false) await connectToRandomPeer(coin, clients.peers[coin]);
      const { error, data } = await promiseTimeout(
        getTimeout(),
        clients.mainClient[coin].blockchain_scripthash_listunspent(scriptHash)
      );
      resolve({ id, error, method, data, coin });
    } catch (e) {
      console.log(e);
      resolve({ id, error: true, method, data: e, coin });
    }
  });
};

export const listUnspentAddressScriptHashes = ({ addresses = [], id = Math.random(), coin = '' } = {}) => {
  const method = 'listUnspentAddressScriptHashes';

  return new Promise(async (resolve) => {
    try {
      if (clients.mainClient[coin] === false) await connectToRandomPeer(coin, clients.peers[coin]);
      const timeout = getTimeout({ arr: addresses });
      const { error, data } = await promiseTimeout(
        timeout,
        clients.mainClient[coin].blockchainScripthashes_listunspent(addresses)
      );
      resolve({ id, error, method, data, coin });
    } catch (e) {
      resolve({ id, error: true, method, data: e, coin });
    }
  });
};

export const getAddressScriptHashMempool = ({ scriptHash = '', id = Math.random(), coin = '' } = {}) => {
  const method = 'getAddressScriptHashMempool';
  return new Promise(async (resolve) => {
    try {
      if (clients.mainClient[coin] === false) await connectToRandomPeer(coin, clients.peers[coin]);
      const { error, data } = await promiseTimeout(
        getTimeout(),
        clients.mainClient[coin].blockchain_scripthash_getMempool(scriptHash)
      );
      resolve({ id, error, method, data, coin });
    } catch (e) {
      console.log(e);
      resolve({ id, error: true, method, data: [], coin });
    }
  });
};

export const getAddressScriptHashesMempool = ({ addresses = [], id = Math.random(), coin = '' } = {}) => {
  const method = 'getAddressScriptHashesMempool';
  return new Promise(async (resolve) => {
    try {
      if (clients.mainClient[coin] === false) await connectToRandomPeer(coin, clients.peers[coin]);
      const timeout = getTimeout({ arr: addresses });
      const { error, data } = await promiseTimeout(
        timeout,
        clients.mainClient[coin].blockchain_scripthashes_getMempool(addresses.map((a) => a.scriptHash))
      );
      resolve({ id, error, method, data, coin });
    } catch (e) {
      console.log(e);
      resolve({ id, error: true, method, data: e, coin });
    }
  });
};

export const getMempool = ({ address = '', id = Math.random(), coin = '' } = {}) => {
  const method = 'getMempool';
  return new Promise(async (resolve) => {
    try {
      if (clients.mainClient[coin] === false) await connectToRandomPeer(coin, clients.peers[coin]);
      const { error, data } = await promiseTimeout(
        getTimeout(),
        clients.mainClient[coin].blockchainAddress_getMempool(address)
      );
      resolve({ id, error, method, data, coin });
    } catch (e) {
      console.log(e);
      resolve({ id, error: true, method, data: e, coin });
    }
  });
};

export const listUnspentAddress = ({ address = '', id = Math.random(), coin = '' } = {}) => {
  const method = 'listUnspentAddress';
  return new Promise(async (resolve) => {
    try {
      if (clients.mainClient[coin] === false) await connectToRandomPeer(coin, clients.peers[coin]);
      const { error, data } = await promiseTimeout(
        getTimeout(),
        clients.mainClient[coin].blockchainAddress_listunspent(address)
      );
      resolve({ id, error, method, data, coin });
    } catch (e) {
      console.log(e);
      resolve({ id, error: true, method, data: e, coin });
    }
  });
};

export const getFeeEstimate = ({ blocksWillingToWait = 8, id = Math.random(), coin = '' } = {}) => {
  const method = 'getFeeEstimate';
  return new Promise(async (resolve) => {
    try {
      if (clients.mainClient[coin] === false) await connectToRandomPeer(coin, clients.peers[coin]);
      const { error, data } = await promiseTimeout(
        getTimeout(),
        clients.mainClient[coin].blockchainEstimatefee(blocksWillingToWait)
      );
      resolve({ id, error, method, data, coin });
    } catch (e) {
      console.log(e);
      resolve({ id, error: true, method, data: e, coin });
    }
  });
};

export const getAddressHistory = ({ address = '', id = Math.random(), coin = '' } = {}) => {
  const method = 'getAddressHistory';
  return new Promise(async (resolve) => {
    try {
      if (clients.mainClient[coin] === false) await connectToRandomPeer(coin, clients.peers[coin]);
      const { error, data } = await promiseTimeout(
        getTimeout(),
        clients.mainClient[coin].blockchainAddress_gethistory(address)
      );
      resolve({ id, error, method, data, coin });
    } catch (e) {
      console.log(e);
      resolve({ id, error: true, method, data: e, coin });
    }
  });
};

export const getTransactionHex = ({ txId = '', id = Math.random(), coin = '' } = {}) => {
  const method = 'getTransactionHex';
  return new Promise(async (resolve) => {
    try {
      if (clients.mainClient[coin] === false) await connectToRandomPeer(coin, clients.peers[coin]);
      const { error, data } = await promiseTimeout(
        getTimeout(),
        clients.mainClient[coin].blockchain_transaction_get(txId)
      );
      resolve({ id, error, method, data, coin });
    } catch (e) {
      console.log(e);
      resolve({ id, error: true, method, data: e, coin });
    }
  });
};
export const getTransactionHexByBlockStream = ({ txId = '', coin = '', id = Math.random() } = {}) => {
  const method = 'getTransactionHex';
  return new Promise(async (resolve) => {
    try {
      const rs = await fetch(`${restBtc[coin]}/tx/${txId}/hex`);
      const rsText = await rs.text();

      resolve({ id, error: rs.status !== 200 ? true : false, method, data: rsText, coin });
    } catch (e) {
      console.log(e);
      resolve({ id, error: true, method, data: e, coin });
    }
  });
};

export const getDonationAddress = ({ id = Math.random(), coin = '' } = {}) => {
  const method = 'getDonationAddress';
  return new Promise(async (resolve) => {
    try {
      if (clients.mainClient[coin] === false) await connectToRandomPeer(coin, clients.peers[coin]);
      const response = await clients.mainClient[coin].serverDonation_address();
      resolve({ id, error: false, method, data: response });
    } catch (e) {
      console.log(e);
      resolve({ id, error: true, method, data: e });
    }
  });
};

export const getPeers = ({ id = Math.random(), coin = '' } = {}) => {
  const method = 'getPeers';
  return new Promise(async (resolve) => {
    try {
      if (clients.mainClient[coin] === false) await connectToRandomPeer(coin, clients.peers[coin]);
      const data = await clients.mainClient[coin].serverPeers_subscribe();
      resolve({ id, error: false, method, data, coin });
    } catch (e) {
      console.log(e);
      resolve({ id, error: true, method, data: null, coin });
    }
  });
};

export const getAvailablePeers = ({ id = Math.random(), coin, protocol = 'wss' } = {}) => {
  const method = 'getAvailablePeers';
  return new Promise(async (resolve) => {
    try {
      //Additional Peers can be located here for reference:
      //(electrum/lib/network.py) https://github.com/spesmilo/electrum/blob/afa1a4d22a31d23d088c6670e1588eed32f7114d/lib/network.py#L57
      const peers = getDefaultPeers(coin, protocol);
      resolve({ id, error: false, method, data: peers });
    } catch (e) {
      console.log(e);
      resolve({ id, error: true, method, data: e, coin });
    }
  });
};

const getVersion = ({ id = Math.random(), v1 = '3.2.3', v2 = '1.4', coin = '' } = {}) => {
  const method = 'getVersion';
  return new Promise(async (resolve) => {
    let peerData = '';
    if (clients.mainClient[coin] === false) peerData = await connectToRandomPeer(coin, clients.peers[coin]);
    if (coin !== coin) peerData = await connectToRandomPeer(coin, clients.peers[coin]);
    try {
      const response = await clients.mainClient[coin].server_version(v1, v2);
      resolve({ id, error: false, method, data: response, peerData, coin });
    } catch (e) {
      console.log('bad connection:', JSON.stringify(e));

      return await getVersion({ id, coin });
    }
  });
};

export const getNewBlockHeightSubscribe = ({ id = Math.random(), coin = '' } = {}) => {
  const method = 'getNewBlockHeightSubscribe';
  return new Promise(async (resolve) => {
    try {
      if (clients.mainClient[coin] === false) await connectToRandomPeer(coin, clients.peers[coin]);
      const { error, data } = await promiseTimeout(
        getTimeout(),
        clients.mainClient[coin].blockchainNumblocks_subscribe()
      );
      resolve({ id, error, method, data, coin });
    } catch (e) {
      console.log(e);
      resolve({ id, error: true, method, data: e, coin });
    }
  });
};

//Returns current block height
export const getNewBlockHeadersSubscribe = ({ id = Math.random(), coin = '', updateBlockHeight = () => null } = {}) => {
  const method = 'getNewBlockHeadersSubscribe';
  return new Promise(async (resolve) => {
    try {
      //if (coin !== coin) await clients.mainClient[coin].connect();
      if (clients.mainClient[coin] === false) await connectToRandomPeer(coin, clients.peers[coin]);
      const response = await clients.mainClient[coin].blockchain_headers_subscribe();
      let blockHeight = 0;
      try {
        if ('height' in response) {
          blockHeight = response.height;
        } else if ('block_height' in response) {
          blockHeight = response.block_height;
        } else {
          return resolve({ error: true, data: blockHeight });
        }
      } catch (e) {}
      let error = true;
      if (blockHeight !== 0) {
        updateBlockHeight({ selectedCrypto: coin, blockHeight });
        error = false;
      }
      resolve({ id, error, method, data: blockHeight, coin });
    } catch (e) {
      resolve({ error: true, method, data: e });
    }
  });
};

export const getTransactionMerkle = ({ id = Math.random(), txHash = '', height = '', coin = '' } = {}) => {
  const method = 'getTransactionMerkle';
  return new Promise(async (resolve) => {
    try {
      if (clients.mainClient[coin] === false) await connectToRandomPeer(coin, clients.peers[coin]);
      const { error, data } = await promiseTimeout(
        getTimeout(),
        clients.mainClient[coin].blockchain_transaction_getMerkle(txHash, height)
      );
      resolve({ id, error, method, data, coin });
    } catch (e) {
      console.log(e);
      resolve({ id, error: true, method, data: e, coin });
    }
  });
};

export const getTransaction = ({ id = Math.random(), txHash = '', coin = '' } = {}) => {
  const method = 'getTransaction';
  return new Promise(async (resolve) => {
    try {
      if (clients.mainClient[coin] === false) await connectToRandomPeer(coin, clients.peers[coin]);
      const { error, data } = await promiseTimeout(
        getTimeout(),
        clients.mainClient[coin].blockchainTransaction_get(txHash, true)
      );
      resolve({ id, error, method, data, coin });
    } catch (e) {
      console.log(e);
      resolve({ id, error: true, method, data: e, coin });
    }
  });
};
export const getTransactions = ({ id = Math.random(), txHashes = [], coin = '' } = {}) => {
  const method = 'getTransactions';
  return new Promise(async (resolve) => {
    try {
      if (clients.mainClient[coin] === false) await connectToRandomPeer(coin, clients.peers[coin]);
      const timeout = getTimeout({ arr: txHashes });
      const { error, data } = await promiseTimeout(
        timeout,
        clients.mainClient[coin].blockchainTransactions_get(txHashes, true)
      );
      resolve({ id, error, method, data, coin });
    } catch (e) {
      console.log(e);
      resolve({ id, error: true, method, data: [], coin });
    }
  });
};

export const getAddressUtxo = ({ id = Math.random(), txHash = '', index = '', coin = '' } = {}) => {
  const method = 'getAddressUtxo';
  return new Promise(async (resolve) => {
    try {
      if (clients.mainClient[coin] === false) await connectToRandomPeer(coin, clients.peers[coin]);
      const { error, data } = await promiseTimeout(
        getTimeout(),
        clients.mainClient[coin].blockchainUtxo_getAddress(txHash, index)
      );
      resolve({ id, error, method, data, coin });
    } catch (e) {
      console.log(e);
      resolve({ id, error: true, method, data: e, coin });
    }
  });
};

export const relayFee = async ({ id = Math.random(), coin = '' }) => {
  const method = 'relayFee';

  try {
    if (clients.mainClient[coin] === false) await connectToRandomPeer(coin, clients.peers[coin]);
    const { error, data } = await promiseTimeout(5000, clients.mainClient[coin].blockchain_relayfee());
    return { id, error, method, data, coin };
  } catch (e) {
    console.log(e);
    return { id, error: true, method, data: e, coin };
  }
};

export const broadcastTransaction = async ({ id = Math.random(), rawTx = '', coin = '' } = {}) => {
  const method = 'broadcastTransaction';

  try {
    if (clients.mainClient[coin] === false) await connectToRandomPeer(coin, clients.peers[coin]);

    const { error, data } = await promiseTimeout(
      5000,
      clients.mainClient[coin].blockchain_transaction_broadcast(rawTx)
    );

    return { id, error, method, data, coin };
  } catch (e) {
    console.log(e);
    return { id, error: true, method, data: e, coin };
  }
};

export const getBlockChunk = ({ id = Math.random(), index = '', coin = '' } = {}) => {
  const method = 'getBlockChunk';
  return new Promise(async (resolve) => {
    try {
      if (clients.mainClient[coin] === false) await connectToRandomPeer(coin, clients.peers[coin]);
      const { error, data } = await promiseTimeout(
        getTimeout(),
        clients.mainClient[coin].blockchainBlock_getChunk(index)
      );
      resolve({ id, error, method, data, coin });
    } catch (e) {
      console.log(e);
      resolve({ id, error: true, method, data: e, coin });
    }
  });
};

export const getBlockHeader = ({ id = Math.random(), height = '', coin = '' } = {}) => {
  const method = 'getBlockHeader';
  return new Promise(async (resolve) => {
    try {
      if (clients.mainClient[coin] === false) await connectToRandomPeer(coin, clients.peers[coin]);
      const { error, data } = await promiseTimeout(
        getTimeout(),
        clients.mainClient[coin].blockchainBlock_getHeader(height)
      );
      resolve({ id, error, method, data, coin });
    } catch (e) {
      console.log(e);
      resolve({ id, error: true, method, data: e, coin });
    }
  });
};

export const getHeader = ({ id = Math.random(), height = '', coin = '' } = {}) => {
  const method = 'getHeader';
  return new Promise(async (resolve) => {
    try {
      if (clients.mainClient[coin] === false) await connectToRandomPeer(coin, clients.peers[coin]);
      const { error, data } = await promiseTimeout(
        getTimeout(),
        clients.mainClient[coin].blockchainBlock_getBlockHeader(height)
      );
      return { id, error, method, data, coin };
    } catch (e) {
      console.log(e);
      resolve({ id, error: true, method, data: e, coin });
    }
  });
};

export const getBanner = ({ id = Math.random(), coin = '' } = {}) => {
  const method = 'getBanner';
  return new Promise(async (resolve) => {
    try {
      if (clients.mainClient[coin] === false) await connectToRandomPeer(coin, clients.peers[coin]);
      const response = await clients.mainClient[coin].server_banner();
      resolve({ id, error: false, method, data: response });
    } catch (e) {
      console.log(e);
      resolve({ id, error: true, method, data: e });
    }
  });
};

const pingServer = ({ id = Math.random(), coin = '' } = {}) => {
  const method = 'pingServer';
  return new Promise(async (resolve) => {
    try {
      if (!coin) coin = clients.coin;
      if (clients.mainClient[coin] === false) await connectToRandomPeer(coin, clients.peers[coin]);
      const { error, data } = await promiseTimeout(getTimeout(), clients.mainClient[coin].server_ping());
      resolve({ id, error, method, data });
    } catch (e) {
      resolve({ id, error: true, method, data: e });
    }
  });
};

export const getAddressProof = ({ address = '', id = Math.random(), coin = '' } = {}) => {
  const method = 'getAddressProof';
  return new Promise(async (resolve) => {
    try {
      if (clients.mainClient[coin] === false) await connectToRandomPeer(coin, clients.peers[coin]);
      const { error, data } = await promiseTimeout(
        getTimeout(),
        clients.mainClient[coin].blockchainAddress_getProof(address)
      );
      resolve({ id, error, method, data, coin });
    } catch (e) {
      console.log(e);
      resolve({ id, error: true, method, data: e, coin });
    }
  });
};
