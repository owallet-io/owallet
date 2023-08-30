'use strict';
const EventEmitter = require('events').EventEmitter;
const util = require('./util');
const initSocket = require('./init_socket');
const connectSocket = require('./connect_socket');

class Client {
  constructor(port, host, protocol = 'tcp', options = void 0) {
    this.id = 0;
    this.port = port;
    this.host = host;
    this.callback_message_queue = {};
    this.subscribe = new EventEmitter();
    this.conn = initSocket(this, protocol, options);
    this.mp = new util.MessageParser((body, n) => {
      this.onMessage(body, n);
    });
    this.status = 0;
  }

  async connect() {
    if (this.status) {
      return Promise.resolve({ error: false, data: '' });
    }
    const connectionResponse = await connectSocket(
      this.conn,
      this.port,
      this.host
    );
    this.status = connectionResponse.error === true ? 0 : 1;
    return Promise.resolve(connectionResponse);
  }

  close() {
    if (!this.status) {
      return;
    }
    this.conn.end();
    this.conn.destroy();
    this.status = 0;
  }

  request(method, params) {
    if (!this.status) {
      return Promise.reject(new Error('ESOCKET'));
    }
    return new Promise((resolve, reject) => {
      const id = ++this.id;
      const content = util.makeRequest(method, params, id);
      this.callback_message_queue[id] = util.createPromiseResult(
        resolve,
        reject
      );
      this.conn.write(content + '\n');
    });
  }

  requestBatch(method, params, secondParam) {
    if (!this.status) {
      return Promise.reject(new Error('ESOCKET'));
    }
    return new Promise((resolve, reject) => {
      let arguments_far_calls = {};
      let contents = [];
      for (let param of params) {
        const id = ++this.id;
        if (secondParam !== undefined) {
          contents.push(util.makeRequest(method, [param, secondParam], id));
        } else {
          contents.push(util.makeRequest(method, [param], id));
        }
        arguments_far_calls[id] = param;
      }
      const content = '[' + contents.join(',') + ']';
      this.callback_message_queue[this.id] = util.createPromiseResultBatch(
        resolve,
        reject,
        arguments_far_calls
      );
      // callback will exist only for max id
      this.conn.write(content + '\n');
    });
  }

  response(msg) {
    let callback;
    if (!msg.id && msg[0] && msg[0].id) {
      // this is a response from batch request
      for (let m of msg) {
        if (m.id && this.callback_message_queue[m.id]) {
          callback = this.callback_message_queue[m.id];
          delete this.callback_message_queue[m.id];
        }
      }
    } else {
      callback = this.callback_message_queue[msg.id];
    }

    if (callback) {
      delete this.callback_message_queue[msg.id];
      if (msg.error) {
        callback(msg.error);
      } else {
        callback(null, msg.result || msg);
      }
    } else {
      console.log("Can't get callback"); // can't get callback
    }
  }

  onMessage(body, n) {
    const msg = JSON.parse(body);
    if (msg instanceof Array) {
      this.response(msg);
    } else {
      if (msg.id !== void 0) {
        this.response(msg);
      } else {
        this.subscribe.emit(msg.method, msg.params);
      }
    }
  }

  onConnect() {}

  onClose() {
    Object.keys(this.callback_message_queue).forEach((key) => {
      this.callback_message_queue[key](new Error('close connect'));
      delete this.callback_message_queue[key];
    });
  }

  onRecv(chunk) {
    this.mp.run(chunk);
  }

  onEnd() {}

  onError(e) {}
}

module.exports = Client;
