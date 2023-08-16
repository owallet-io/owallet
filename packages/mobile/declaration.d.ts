declare module 'net-owallet' {
    import TcpSockets from 'react-native-tcp-socket';
    export = TcpSockets;
}

declare module 'tls-owallet' {
    import TcpSockets from 'react-native-tcp-socket';
    export const Server = TcpSockets.TLSServer;
    export const TLSSocket = TcpSockets.TLSSocket;
    export const connect = TcpSockets.connectTLS;
    export const createServer = TcpSockets.createTLSServer;
}