import * as cosmwasm from "@cosmjs/cosmwasm-stargate";
import { RPC_ORAICHAIN } from "../pages/nft/types";

export const getClientQuery = async (rpc = RPC_ORAICHAIN) => {
  return await cosmwasm.CosmWasmClient.connect(rpc);
};
