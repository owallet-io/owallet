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

  const updates = {
    stargate: false,
    "ibc-go": false,
    "ibc-transfer": false,
    "no-legacy-stdTx": false,
  };

  if (!chainInfo.features || !chainInfo.features.includes("stargate")) {
    await restInstance.get("/cosmos/base/tendermint/v1beta1/node_info");
    updates.stargate = true;
  }

  if (
    !chainInfo?.features?.includes("ibc-go") &&
    (updates.stargate || chainInfo?.features?.includes("stargate"))
  ) {
    const result = await restInstance.get<{
      params: { receive_enabled: boolean; send_enabled: boolean };
    }>("/ibc/apps/transfer/v1/params");
    if (result.status === 200) {
      updates["ibc-go"] = true;
    }
  }

  if (
    !chainInfo?.features?.includes("ibc-transfer") &&
    (updates.stargate || chainInfo?.features?.includes("stargate"))
  ) {
    const isIBCGo =
      updates["ibc-go"] || chainInfo?.features?.includes("ibc-go");
    const result = await restInstance.get<{
      params: { receive_enabled: boolean; send_enabled: boolean };
    }>(
      isIBCGo
        ? "/ibc/apps/transfer/v1/params"
        : "/ibc/applications/transfer/v1beta1/params"
    );
    if (result.data.params.receive_enabled && result.data.params.send_enabled) {
      updates["ibc-transfer"] = true;
    }
  }

  if (
    !chainInfo?.features?.includes("no-legacy-stdTx") &&
    (updates.stargate || chainInfo?.features?.includes("stargate"))
  ) {
    const result = await restInstance.post<
      { code: 12; message: "Not Implemented"; details: [] } | any
    >("/txs", undefined, {
      validateStatus: (status) =>
        (status >= 200 && status < 300) || status === 501,
    });
    if (
      result.status === 501 &&
      result.data.code === 12 &&
      result.data.message === "Not Implemented"
    ) {
      updates["no-legacy-stdTx"] = true;
    }
  }

  const features = Object.entries(updates)
    .filter(([_, value]) => value)
    .map(([key]) => key);

  return {
    features,
    slient: Object.values(updates).some((value) => value),
  };
}
