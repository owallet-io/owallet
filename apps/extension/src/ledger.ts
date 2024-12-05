// import { ledgerProxy } from "@owallet/background";

// const channelDevice = new BroadcastChannel("device");

// channelDevice.addEventListener("message", async (event) => {
//   const { method, args, requestId } = event.data;
//   const response = await ledgerProxy(method, args);
//   // use response to filter request
//   channelDevice.postMessage({ requestId, response });
// });
