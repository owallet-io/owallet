import { decode, fromWords } from "bech32";
import protobuf from "protobufjs";

export const parseToIbcWasmMemo = (
  destinationReceiver: string,
  destinationChannel: string,
  destinationDenom: string
): string => {
  const protobufRoot = protobuf.Root.fromJSON({
    nested: {
      IbcBridgeWasmMemo: {
        fields: {
          destinationReceiver: {
            type: "string",
            id: 1,
          },
          destinationChannel: {
            type: "string",
            id: 2,
          },
          destinationDenom: {
            type: "string",
            id: 3,
          },
        },
      },
    },
  });

  const msg = protobufRoot.lookupType("IbcBridgeWasmMemo");
  const message = msg.create({
    destinationReceiver,
    destinationChannel,
    destinationDenom,
  });
  return Buffer.from(msg.encode(message).finish()).toString("base64");
};

export const parseToIbcHookMemo = (
  receiver: string,
  destinationReceiver: string,
  destinationChannel: string,
  destinationDenom: string
): string => {
  const protobufRoot = protobuf.Root.fromJSON({
    nested: {
      IbcHooksMemo: {
        fields: {
          receiver: {
            type: "bytes",
            id: 1,
          },
          destinationReceiver: {
            type: "string",
            id: 2,
          },
          destinationChannel: {
            type: "string",
            id: 3,
          },
          destinationDenom: {
            type: "string",
            id: 4,
          },
        },
      },
    },
  });

  const receiverCanonical = receiver
    ? Buffer.from(fromWords(decode(receiver).words))
    : "";
  const msg = protobufRoot.lookupType("IbcHooksMemo");
  const message = msg.create({
    receiver: receiverCanonical,
    destinationReceiver,
    destinationChannel,
    destinationDenom,
  });
  return Buffer.from(msg.encode(message).finish()).toString("base64");
};
