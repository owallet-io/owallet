import { SocketClient } from '../socket/socket_client';
import { makeRequest, createPromiseResult } from './util';

const keepAliveInterval = 450 * 1000; // 7.5 minutes as recommended by ElectrumX SESSION_TIMEOUT

export class ElectrumClient extends SocketClient {
  constructor(host, port, protocol, options) {
    super(host, port, protocol, options);
    this.timeLastCall = 0;
  }
  initElectrum(electrumConfig, persistencePolicy = { maxRetry: 1000, callback: null }) {
    this.persistencePolicy = persistencePolicy;
    this.electrumConfig = electrumConfig;
    this.timeLastCall = 0;
    return this.connect().then(() => this.server_version(this.electrumConfig.client, this.electrumConfig.version));
  }
  async connect(clientName, electrumProtocolVersion, persistencePolicy = { maxRetry: 10, callback: null }) {
    this.persistencePolicy = persistencePolicy;

    this.timeLastCall = 0;

    if (this.status === 0) {
      try {
        // Connect to Electrum Server.
        await super.connect();

        // Get banner.
        const banner = await this.server_banner();

        // Negotiate protocol version.
        if (clientName && electrumProtocolVersion) {
          const version = await this.server_version(clientName, electrumProtocolVersion);
          console.log(`Negotiated version: [${version}]`);
        }
      } catch (err) {
        throw new Error(`failed to connect to electrum server: [${err}]`);
      }

      this.keepAlive();
    }
  }

  async request(method, params) {
    if (this.status === 0) {
      throw new Error('connection not established');
    }

    this.timeLastCall = new Date().getTime();

    const ret = await new Promise((resolve, reject) => {
      const id = ++this.id;

      const content = makeRequest(method, params, id);

      this.callback_message_queue[id] = createPromiseResult(resolve, reject);

      this.client.send(content + '\n');
    });

    return ret;
  }

  /**
   * Ping the server to ensure it is responding, and to keep the session alive.
   * The server may disconnect clients that have sent no requests for roughly 10
   * minutes. It sends a ping request every 2 minutes. If the request fails it
   * logs an error and closes the connection.
   */
  keepAlive() {
    if (this.timeout != null) {
      clearTimeout(this.timeout);
    }
    this.timeout = setTimeout(() => {
      if (this.timeLastCall !== 0 && new Date().getTime() > this.timeLastCall + 5000) {
        this.server_ping();
      }
    }, 5000);
  }

  close() {
    super.close();
    if (this.timeout != null) {
      clearTimeout(this.timeout);
    }
    this.reconnect = this.reconnect = this.onClose = this.keepAlive = () => {}; // dirty hack to make it stop reconnecting
  }
  reconnect() {
    return this.initElectrum(this.electrumConfig);
  }
  onClose() {
    super.onClose();

    const list = [
      'server.peers.subscribe',
      'blockchain.numblocks.subscribe',
      'blockchain.headers.subscribe',
      'blockchain.address.subscribe'
    ];

    // TODO: We should probably leave listeners if the have persistency policy.
    list.forEach((event) => this.events.removeAllListeners(event));

    // Stop keep alive.
    // clearInterval(this.keepAliveHandle);

    // TODO: Refactor persistency
    setTimeout(() => {
      if (this.persistencePolicy != null && this.persistencePolicy.maxRetry > 0) {
        this.reconnect();
        this.persistencePolicy.maxRetry -= 1;
      } else if (this.persistencePolicy != null && this.persistencePolicy.callback != null) {
        this.persistencePolicy.callback();
      } else if (this.persistencePolicy == null) {
        this.reconnect();
      }
    }, 10000);
  }

  // TODO: Refactor persistency
  // reconnect() {
  //   return this.initElectrum(this.electrumConfig);
  // }

  // ElectrumX API
  //
  // Documentation:
  // https://electrumx.readthedocs.io/en/latest/protocol-methods.html
  //
  server_version(client_name, protocol_version) {
    return this.request('server.version', [client_name, protocol_version]);
  }
  server_banner() {
    return this.request('server.banner', []);
  }
  server_ping() {
    return this.request('server.ping', []);
  }
  server_addPeer(features) {
    return this.request('server.add_peer', [features]);
  }
  server_donation_address() {
    return this.request('server.donation_address', []);
  }
  server_features() {
    return this.request('server.features', []);
  }
  server_peers_subscribe() {
    return this.request('server.peers.subscribe', []);
  }
  blockchain_address_getProof(address) {
    return this.request('blockchain.address.get_proof', [address]);
  }
  blockchain_scripthash_getBalance(scripthash) {
    return this.request('blockchain.scripthash.get_balance', [scripthash]);
  }
  blockchain_scripthashes_getBalance(scripthashes) {
    return this.request('blockchain.scripthash.get_balance', scripthashes);
  }
  blockchain_scripthash_getHistory(scripthash) {
    return this.request('blockchain.scripthash.get_history', [scripthash]);
  }
  blockchain_scripthashes_getHistory(scripthashes) {
    return this.request('blockchain.scripthash.get_history', scripthashes);
  }
  blockchain_scripthash_getMempool(scripthash) {
    return this.request('blockchain.scripthash.get_mempool', [scripthash]);
  }
  blockchain_scripthashes_getMempool(scripthashes) {
    return this.request('blockchain.scripthash.get_mempool', scripthashes);
  }
  blockchain_scripthash_listunspent(scripthash) {
    return this.request('blockchain.scripthash.listunspent', [scripthash]);
  }
  blockchain_scripthashes_listunspent(scripthashes) {
    return this.request('blockchain.scripthash.listunspent', scripthashes);
  }
  blockchain_scripthash_subscribe(scripthash) {
    return this.request('blockchain.scripthash.subscribe', [scripthash]);
  }
  blockchain_scripthash_unsubscribe(scripthash) {
    return this.request('blockchain.scripthash.unsubscribe', [scripthash]);
  }
  blockchain_block_header(height, cpHeight = 0) {
    return this.request('blockchain.block.header', [height, cpHeight]);
  }
  blockchain_block_headers(startHeight, count, cpHeight = 0) {
    return this.request('blockchain.block.headers', [startHeight, count, cpHeight]);
  }
  blockchainEstimatefee(number) {
    return this.request('blockchain.estimatefee', [number]);
  }
  blockchain_headers_subscribe() {
    return this.request('blockchain.headers.subscribe', []);
  }
  blockchain_relayfee() {
    return this.request('blockchain.relayfee', []);
  }
  blockchain_transaction_broadcast(rawtx) {
    return this.request('blockchain.transaction.broadcast', [rawtx]);
  }
  async blockchain_transaction_get(tx_hash, verbose = false, merkle = false) {
    try {
      const rs = await this.request('blockchain.transaction.get', [tx_hash, verbose]);
      return rs;
    } catch (e) {
      return { error: true, data: e };
    }
  }

  async blockchainScripthashes_listunspent(scripthashes) {
    try {
      const result = [];
      await Promise.all(
        scripthashes.map(async (scripthashData) => {
          try {
            const { scriptHash, address, path } = scripthashData;
            const response = await this.request('blockchain.scripthash.listunspent', [scriptHash]);

            const responseLength = response.length;

            if (responseLength > 0) {
              response.map((res) => {
                try {
                  const { height, tx_hash, tx_pos, value } = res;
                  const data = {
                    height,
                    tx_hash,
                    tx_pos,
                    value,
                    scriptHash,
                    address,
                    path
                  };
                  result.push(data);
                } catch (e) {
                  console.log('🚀 ~ file: client.js:223 ~ ElectrumClient ~ response.map ~ e:', e);
                }
              });
            }
          } catch (e) {
            console.log('blockchainScripthashes_listunspent', e);
          }
        })
      );

      return result;
    } catch (e) {
      return { error: true, data: e };
    }
  }
  blockchain_transaction_getMerkle(tx_hash, height) {
    return this.request('blockchain.transaction.get_merkle', [tx_hash, height]);
  }
  mempool_getFeeHistogram() {
    return this.request('mempool.get_fee_histogram', []);
  }
  blockchainTransaction_get(tx_hash, verbose = false, merkle = false) {
    try {
      return this.request('blockchain.transaction.get', [tx_hash, verbose]);
    } catch (e) {
      return { error: true, data: e };
    }
  }
  async blockchainTransactions_get(tx_hashes, verbose = false, merkle = false) {
    try {
      const result = [];
      await Promise.all(
        tx_hashes.map(async (tx) => {
          try {
            const response = await this.request('blockchain.transaction.get', [tx.tx_hash, verbose]);
            if (response) {
              try {
                const data = Object.assign(tx, response);
                result.push(data);
              } catch (e) {}
            }
          } catch (e) {}
        })
      );
      return result;
    } catch (e) {
      return { error: false, data: e };
    }
  }
  // ---------------------------------
  // protocol 1.1 deprecated method
  // ---------------------------------
  blockchain_utxo_getAddress(tx_hash, index) {
    return this.request('blockchain.utxo.get_address', [tx_hash, index]);
  }
  blockchain_numblocks_subscribe() {
    return this.request('blockchain.numblocks.subscribe', []);
  }
  // ---------------------------------
  // protocol 1.2 deprecated method
  // ---------------------------------
  blockchain_block_getChunk(index) {
    return this.request('blockchain.block.get_chunk', [index]);
  }
  blockchain_address_getBalance(address) {
    return this.request('blockchain.address.get_balance', [address]);
  }
  blockchain_address_getHistory(address) {
    return this.request('blockchain.address.get_history', [address]);
  }
  blockchain_address_getHistory(address) {
    return this.request('blockchain.address.get_history', [address]);
  }
  blockchain_address_getMempool(address) {
    return this.request('blockchain.address.get_mempool', [address]);
  }
  blockchain_address_listunspent(address) {
    return this.request('blockchain.address.listunspent', [address]);
  }
  blockchain_address_subscribe(address) {
    return this.request('blockchain.address.subscribe', [address]);
  }
}
