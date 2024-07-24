import { ChainInfo } from "@owallet/types";
import { ChainIdHelper } from "@owallet/cosmos";
import Axios, { AxiosInstance } from "axios";

export function hasChain(
  chainId: string,
  chainInfo: Readonly<ChainInfo>
): boolean {
  return (
    !chainId ||
    !chainInfo ||
    (chainId && !ChainIdHelper.hasChainVersion(chainId))
  );
}

async function checkStargate(restInstance: AxiosInstance): Promise<boolean> {
  try {
    await restInstance.get("/cosmos/base/tendermint/v1beta1/node_info");
    return true;
  } catch {
    return false;
  }
}

async function checkIBCGo(restInstance: AxiosInstance): Promise<boolean> {
  try {
    const result = await restInstance.get<{
      params: {
        receive_enabled: boolean;
        send_enabled: boolean;
      };
    }>("/ibc/apps/transfer/v1/params");
    return result.status === 200;
  } catch {
    return false;
  }
}

async function checkIBCTransfer(
  restInstance: AxiosInstance,
  isIBCGo: boolean
): Promise<boolean> {
  try {
    const result = await restInstance.get<{
      params: {
        receive_enabled: boolean;
        send_enabled: boolean;
      };
    }>(
      isIBCGo
        ? "/ibc/apps/transfer/v1/params"
        : "/ibc/applications/transfer/v1beta1/params"
    );
    return (
      result.data.params.receive_enabled && result.data.params.send_enabled
    );
  } catch {
    return false;
  }
}

async function checkNoLegacyStdTx(
  restInstance: AxiosInstance
): Promise<boolean> {
  try {
    const result = await restInstance.post<
      | {
          code: 12;
          message: "Not Implemented";
          details: [];
        }
      | any
    >("/txs", undefined, {
      validateStatus: (status) => {
        return (status >= 200 && status < 300) || status === 501;
      },
    });
    return (
      result.status === 501 &&
      result.data.code === 12 &&
      result.data.message === "Not Implemented"
    );
  } catch {
    return false;
  }
}

export async function getFeatures(
  chainInfo: Readonly<ChainInfo>
): Promise<any> {
  const restInstance = Axios.create({
    baseURL: chainInfo.rest,
  });

  const stargateUpdate = await checkStargate(restInstance);
  const ibcGoUpdates = await checkIBCGo(restInstance);
  const ibcTransferUpdate = await checkIBCTransfer(restInstance, ibcGoUpdates);
  const noLegacyStdTxUpdate = await checkNoLegacyStdTx(restInstance);

  const updates = {
    stargate: stargateUpdate,
    "ibc-go": ibcGoUpdates,
    "ibc-transfer": ibcTransferUpdate,
    "no-legacy-stdTx": noLegacyStdTxUpdate,
  };

  const features = Object.entries(updates)
    .filter(([_, value]) => value)
    .map(([key]) => key);

  return {
    features,
    slient:
      stargateUpdate ||
      ibcGoUpdates ||
      ibcTransferUpdate ||
      noLegacyStdTxUpdate,
  };
}
