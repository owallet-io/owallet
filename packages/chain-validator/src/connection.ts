import { ChainIdHelper } from "@owallet/cosmos";
import { simpleFetch, SimpleFetchResponse } from "@owallet/simple-fetch";

export class DifferentChainVersionError extends Error {
  constructor(m: string) {
    super(m);
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, DifferentChainVersionError.prototype);
  }
}

export async function checkRPCConnectivity(
  chainId: string,
  rpc: string,
  wsObject?: (url: string) => {
    readonly readyState: number;
    onerror: ((event: any) => void) | null;
    close(): void;
  }
): Promise<void> {
  let resultStatus: SimpleFetchResponse<
    | {
        result: {
          node_info: {
            network: string;
          };
        };
      }
    | {
        node_info: {
          network: string;
        };
      }
  >;

  try {
    // Get the status to get the chain id.
    resultStatus = await simpleFetch(rpc, "/status");
  } catch (e) {
    console.log(e);
    throw new Error("Failed to get response /status from rpc endpoint");
  }

  const version = ChainIdHelper.parse(chainId);

  const statusResult = (() => {
    if ("result" in resultStatus.data) {
      return resultStatus.data.result;
    }
    return resultStatus.data;
  })();

  const versionFromRPCStatus = ChainIdHelper.parse(
    statusResult.node_info.network
  );

  if (versionFromRPCStatus.identifier !== version.identifier) {
    throw new Error(
      `RPC endpoint has different chain id (expected: ${chainId}, actual: ${statusResult.node_info.network})`
    );
  } else if (versionFromRPCStatus.version !== version.version) {
    // In the form of {chain_identifier}-{chain_version}, if the identifier is the same but the version is different, it is strictly an error,
    // but it is actually the same chain but the chain version of the node is different.
    // In this case, it is possible to treat as a warning and proceed as it is, so this is separated with above error.
    throw new DifferentChainVersionError(
      `RPC endpoint has different chain id (expected: ${chainId}, actual: ${statusResult.node_info.network})`
    );
  }

  let wsURL = rpc;
  if (wsURL.startsWith("http")) {
    wsURL = wsURL.replace("http", "ws");
  }
  wsURL = wsURL.endsWith("/") ? wsURL + "websocket" : wsURL + "/websocket";

  const wsInstance = wsObject ? wsObject(wsURL) : new WebSocket(wsURL);
  wsInstance.onerror = () => {
    // To prevent not catchable error,
    // provide noop handler.
  };

  let wsConnected = false;
  // Try 15 times at 1 second intervals to test websocket connectivity.
  for (let i = 0; i < 15; i++) {
    // If ws state is not "connecting"
    if (wsInstance.readyState !== 0) {
      // If ws state is "open", it means that app can connect ws to /websocket rpc
      if (wsInstance.readyState === 1) {
        wsConnected = true;
        break;
      } else {
        // else, handle that as error.
        throw new Error("Failed to connect websocket to /websocket rpc");
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  // Close web socket
  wsInstance.close();

  if (!wsConnected) {
    throw new Error("Failed to connect websocket to /websocket rpc");
  }
}

export async function checkRestConnectivity(
  chainId: string,
  rest: string
): Promise<void> {
  let resultLCDNodeInfo: SimpleFetchResponse<{
    default_node_info: {
      network: string;
    };
  }>;

  try {
    // Get the node info to get the chain id.
    resultLCDNodeInfo = await simpleFetch<{
      default_node_info: {
        network: string;
      };
    }>(rest, "/cosmos/base/tendermint/v1beta1/node_info");
  } catch (e) {
    console.log(e);
    throw new Error(
      "Failed to get response /cosmos/base/tendermint/v1beta1/node_info from lcd endpoint"
    );
  }

  const version = ChainIdHelper.parse(chainId);

  const versionFromLCDNodeInfo = ChainIdHelper.parse(
    resultLCDNodeInfo.data.default_node_info.network
  );

  if (versionFromLCDNodeInfo.identifier !== version.identifier) {
    throw new Error(
      `LCD endpoint has different chain id (expected: ${chainId}, actual: ${resultLCDNodeInfo.data.default_node_info.network})`
    );
  } else if (versionFromLCDNodeInfo.version !== version.version) {
    // In the form of {chain_identifier}-{chain_version}, if the identifier is the same but the version is different, it is strictly an error,
    // but it is actually the same chain but the chain version of the node is different.
    // In this case, it is possible to treat as a warning and proceed as it is, so this is separated with above error.
    throw new DifferentChainVersionError(
      `LCD endpoint has different chain id (expected: ${chainId}, actual: ${resultLCDNodeInfo.data.default_node_info.network})`
    );
  }
}

export async function checkEvmRpcConnectivity(
  evmChainId: number,
  evmRpc: string
) {
  let resultEvmChainId: SimpleFetchResponse<{
    result: string;
  }>;

  try {
    // get the EVM chain id.
    resultEvmChainId = await simpleFetch<{
      result: string;
    }>(evmRpc, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "request-source": "owallet-extension/chain-validator",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_chainId",
        params: [],
        id: 1,
      }),
    });
  } catch (e) {
    console.log(e);
    throw new Error("Failed to get response eth_chainId from EVM RPC endpoint");
  }

  const evmChainIdFromResult = Number(resultEvmChainId.data.result);

  if (evmChainIdFromResult !== evmChainId) {
    throw new Error(
      `EVM RPC endpoint has different chain id (expected: ${evmChainId}, actual: ${evmChainIdFromResult})`
    );
  }
}
