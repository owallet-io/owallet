'use strict'
// const net = require('net');
// const tls = require('tls');
const TlsSocketWrapper = require('./TlsSocketWrapper.js');
const TIMEOUT = 5000

const getSocket = (protocol, options) => {
    switch(protocol){
    case 'tcp':
        return new net.Socket();
    case 'tls':
    case 'ssl':
        if (!tls) throw new Error('tls package could not be loaded');
        return new TlsSocketWrapper(tls);
    }
    throw new Error('unknown protocol')
}

const initSocket = (self, protocol, options) => {
    const conn = getSocket(protocol, options);
    conn.setTimeout(TIMEOUT)
    conn.setEncoding('utf8')
    conn.setKeepAlive(true, 0)
    conn.setNoDelay(true)
    conn.on('connect', () => {
        conn.setTimeout(0)
        self.onConnect()
    })
    conn.on('close', (e) => {
        self.onClose(e)
    })
    conn.on('timeout', () => {
    })
    conn.on('data', (chunk) => {
        conn.setTimeout(0)
        self.onRecv(chunk)
    })
    conn.on('end', (e) => {
        conn.setTimeout(0)
        self.onEnd(e)
    })
    conn.on('error', (e) => {
        self.onError(e)
    })
    return conn
}

module.exports = initSocket
