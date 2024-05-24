import { ObservableChainQuery } from "../chain-query";
import Web3 from "web3";
import { KVStore } from "@owallet/common";
import { ChainGetter } from "../../common";
import { CancelToken } from "axios";
import { QueryResponse } from "../../common";
import ERC20_ABI from "./erc20";

export class ObservableEvmContractChainQuery<
  T
> extends ObservableChainQuery<T> {
  constructor(
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter,
    protected readonly contractAddress: string,
    // eslint-disable-next-line @typescript-eslint/ban-types
    protected data: { [key: string]: any }
  ) {
    super(kvStore, chainId, chainGetter, "", data);
  }

  protected canFetch(): boolean {
    return this.contractAddress.length !== 0;
  }

  protected async fetchResponse(
    abortController: AbortController
  ): Promise<QueryResponse<T>> {
    try {
      const response = await super.fetchResponse(abortController);
      const resultFetchBalance = response.data;
      const provider = this.chainGetter.getChain(this.chainId).rest;
      const web3 = new Web3(provider);
      // @ts-ignore
      const tokenInfo = new web3.eth.Contract(ERC20_ABI, this.contractAddress);

      const tokenDecimal = await tokenInfo.methods.decimals().call();
      const tokenSymbol = await tokenInfo.methods.symbol().call();
      const tokenName = await tokenInfo.methods.name().call();

      if (!resultFetchBalance) {
        throw new Error("Failed to get the response from the contract");
      }

      const tokenInfoData = {
        decimals: parseInt(tokenDecimal),
        symbol: tokenSymbol,
        name: tokenName,
        total_supply: resultFetchBalance,
      };

      return {
        data: resultFetchBalance,
        status: response.status,
        staled: false,
        timestamp: Date.now(),
        info: tokenInfoData,
      };
    } catch (error) {
      console.log("Error on fetch response: ", error);
    }
  }
}
