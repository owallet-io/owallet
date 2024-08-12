import {
  ObservableChainQuery,
  ObservableChainQueryMap,
} from "../../chain-query";
import { getRpcByChainId, KVStore } from "@owallet/common";
import { ChainGetter, QueryResponse } from "../../../common";
import { computed, makeObservable } from "mobx";
import Web3 from "web3";
import { utils } from "ethers";
import ERC20_ABI from "human-standard-token-abi";
import { QuerySharedContext } from "src/common/query/context";
type GasEvmRequest = {
  to: string;
  from: string;
  amount: string;
  contract_address: string;
};
export class ObservableQueryGasEvmContractInner extends ObservableChainQuery<number> {
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter,
    protected readonly paramGas: GasEvmRequest
  ) {
    super(sharedContext, chainId, chainGetter, ``);
    makeObservable(this);
  }

  /**
   * Return the gas price.
   * If fetching is not completed or failed, return the 0 Int.
   */
  @computed
  get gas(): number {
    if (!this.response?.data) {
      //TODO: default gas for eth is 21000
      return 21000;
    }
    return this.response.data;
  }
  protected override async fetchResponse(
    abortController: AbortController
  ): Promise<{
    headers: any;
    data: number;
  }> {
    try {
      const { data, headers } = await super.fetchResponse(abortController);
      const web3 = new Web3(
        getRpcByChainId(this.chainGetter.getChain(this.chainId), this.chainId)
      );
      const { from, to, contract_address, amount } = this.paramGas;
      console.log(contract_address, "contract_address");
      if (!to || !from || !amount || !contract_address) return;
      const tokenInfo = new web3.eth.Contract(
        // @ts-ignore
        ERC20_ABI,
        contract_address
      );
      const tokenDecimal = await tokenInfo.methods.decimals().call();
      if (!tokenDecimal) return;
      const estimateGas = await tokenInfo.methods
        .transfer(to, utils.parseUnits(amount, tokenDecimal))
        .estimateGas({
          from: from,
        });

      return {
        headers,
        data: estimateGas,
      };
    } catch (error) {
      console.log(
        "🚀 ~ ObservableQueryGasEvmContractInner ~ fetchResponse ~ error:",
        error
      );
    }
  }
}

export class ObservableQueryGasEvmContract extends ObservableChainQueryMap<number> {
  constructor(
    protected readonly sharedContext: QuerySharedContext,
    protected readonly chainId: string,
    protected readonly chainGetter: ChainGetter
  ) {
    super(sharedContext, chainId, chainGetter, (data) => {
      return new ObservableQueryGasEvmContractInner(
        this.sharedContext,
        this.chainId,
        this.chainGetter,
        JSON.parse(data)
      );
    });
  }

  getGas(data: GasEvmRequest): ObservableQueryGasEvmContractInner {
    return this.get(JSON.stringify(data)) as ObservableQueryGasEvmContractInner;
  }
}
