import * as cosmwasm from "@cosmjs/cosmwasm-stargate";
import { GasPrice } from "@cosmjs/stargate";
import { network } from "./initCommon";
export class CWStargate {
  static async init(
    account: any,
    chainId: string,
    rpc: string,
    options?: cosmwasm.SigningCosmWasmClientOptions
  ) {
    const owallet = await account.getOWallet();
    if (!owallet) {
      throw new Error("Can't get the owallet API");
    }
    const wallet = owallet.getOfflineSigner(chainId);

    const client = await cosmwasm.SigningCosmWasmClient.connectWithSigner(
      rpc,
      wallet,
      options ?? {
        gasPrice: GasPrice.fromString(network.fee.gasPrice + network.denom),
      }
    );
    return client;
  }
}
