import { Erc20ContractTokenInfo } from "./types";
import { getRpcByChainId, KVStore } from "@owallet/common";
import { ObservableChainQuery, ObservableChainQueryMap } from "../chain-query";
import { ChainGetter, QueryResponse } from "../../common";
import { computed } from "mobx";
import Web3 from "web3";
import ERC20_ABI from "human-standard-token-abi";
import { QuerySharedContext } from "src/common/query/context";

export class ObservableQueryErc20ContactInfoInner extends ObservableChainQuery<Erc20ContractTokenInfo> {
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter,
    protected readonly contractAddress: string
  ) {
    super(sharedContext, chainId, chainGetter, contractAddress);
  }

  @computed
  get tokenInfo(): Erc20ContractTokenInfo | undefined {
    if (!this.response || !this.response.data) {
      return undefined;
    }

    return this.response?.data?.token_info_response ?? this.response?.data;
  }
  protected override async fetchResponse(
    abortController: AbortController
  ): Promise<{ headers: any; data: Erc20ContractTokenInfo }> {
    const { headers } = await super.fetchResponse(abortController);

    const web3 = new Web3(
      getRpcByChainId(this.chainGetter.getChain(this.chainId), this.chainId)
    );
    // @ts-ignore
    const contract = new web3.eth.Contract(ERC20_ABI, this.contractAddress);
    const tokenDecimal = await contract.methods.decimals().call();
    const tokenSymbol = await contract.methods.symbol().call();
    const tokenName = await contract.methods.name().call();
    const total_supply = await contract.methods.totalSupply().call();

    const tokenInfoData: Erc20ContractTokenInfo = {
      decimals: parseInt(tokenDecimal),
      symbol: tokenSymbol,
      name: tokenName,
      total_supply: total_supply,
      token_info_response: {
        decimals: parseInt(tokenDecimal),
        name: tokenName,
        symbol: tokenSymbol,
        total_supply: total_supply,
      },
    };

    return {
      data: tokenInfoData,
      headers,
    };
  }
}

export class ObservableQueryErc20ContractInfo extends ObservableChainQueryMap<Erc20ContractTokenInfo> {
  constructor(
    protected readonly sharedContext: QuerySharedContext,
    protected readonly chainId: string,
    protected readonly chainGetter: ChainGetter
  ) {
    super(sharedContext, chainId, chainGetter, (contractAddress: string) => {
      return new ObservableQueryErc20ContactInfoInner(
        this.sharedContext,
        this.chainId,
        this.chainGetter,
        contractAddress
      );
    });
  }

  getQueryContract(
    contractAddress: string
  ): ObservableQueryErc20ContactInfoInner {
    return this.get(contractAddress) as ObservableQueryErc20ContactInfoInner;
  }
}
