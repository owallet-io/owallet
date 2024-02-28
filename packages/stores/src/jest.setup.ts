import "reflect-metadata";
const nodeCrypto = require("crypto");
Object.defineProperty(globalThis, "crypto", {
  value: {
    getRandomValues: (arr) => nodeCrypto.randomBytes(arr.length),
  },
});
class ChannelMock {
  onmessage: (event: { data: any }) => void;

  postMessage(data: any): void {
    if (this.onmessage) {
      this.onmessage({ data });
    }
  }
}

class WebSocket {
  constructor(url) {}
  onopen() {}
  onmessage() {}
  onclose() {}
}
(global as any).BroadcastChannel = ChannelMock;
(global as any).WebSocket = WebSocket;
