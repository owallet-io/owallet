import { ChainInfo } from "@owallet/types";
import { ChainIdHelper } from "@owallet/cosmos";
import Axios from "axios";

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

export async function getFeatures(
  chainInfo: Readonly<ChainInfo>
): Promise<any> {
  const restInstance = Axios.create({
    baseURL: chainInfo.rest,
  });
  let staragteUpdate = false;
  if (!chainInfo.features || !chainInfo.features.includes("stargate")) {
    // If the chain doesn't have the stargate feature,
    // but it can use the GRPC HTTP Gateway,
    // assume that it can support the stargate and try to update the features.
    await restInstance.get("/cosmos/base/tendermint/v1beta1/node_info");
    staragteUpdate = true;
  }

  let ibcGoUpdates = false;
  if (
    !chainInfo?.features?.includes("ibc-go") &&
    (staragteUpdate || chainInfo?.features?.includes("stargate"))
  ) {
    // If the chain uses the ibc-go module separated from the cosmos-sdk,
    // we need to check it because the REST API is different.
    const result = await restInstance.get<{
      params: {
        receive_enabled: boolean;
        send_enabled: boolean;
      };
    }>("/ibc/apps/transfer/v1/params");
    if (result?.status === 200) {
      ibcGoUpdates = true;
    }
  }

  let ibcTransferUpdate = false;
  if (
    !chainInfo?.features?.includes("ibc-transfer") &&
    (staragteUpdate || chainInfo?.features?.includes("stargate"))
  ) {
    const isIBCGo = ibcGoUpdates || chainInfo?.features?.includes("ibc-go");

    // If the chain doesn't have the ibc transfer feature,
    // try to fetch the params of ibc transfer module.
    // assume that it can support the ibc transfer if the params return true, and try to update the features.
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
    if (result.data.params.receive_enabled && result.data.params.send_enabled) {
      ibcTransferUpdate = true;
    }
  }

  let noLegacyStdTxUpdate = false;
  if (
    !chainInfo?.features?.includes("no-legacy-stdTx") &&
    (staragteUpdate || chainInfo?.features?.includes("stargate"))
  ) {
    // The chain with above cosmos-sdk@v0.44.0 can't send the legacy stdTx,
    // Assume that it can't send the legacy stdTx if the POST /txs responses "not implemented".
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
    if (
      result.status === 501 &&
      result.data.code === 12 &&
      result.data.message === "Not Implemented"
    ) {
      noLegacyStdTxUpdate = true;
    }
  }

  const updates = {
    stargate: staragteUpdate,
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
      staragteUpdate ||
      ibcGoUpdates ||
      ibcTransferUpdate ||
      noLegacyStdTxUpdate,
  };
}
