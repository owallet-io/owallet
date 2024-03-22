import { Erc20ContractTokenInfo } from "./types";
import { KVStore } from "@owallet/common";
import { ObservableChainQuery, ObservableChainQueryMap } from "../chain-query";
import { ChainGetter, QueryResponse } from "../../common";
import { computed } from "mobx";
import Web3 from "web3";
import ERC20_ABI from "./erc20";

export class ObservableQueryErc20ContactInfoInner extends ObservableChainQuery<Erc20ContractTokenInfo> {
  constructor(
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter,
    protected readonly contractAddress: string
  ) {
    super(kvStore, chainId, chainGetter, contractAddress);
  }

  @computed
  get tokenInfo(): Erc20ContractTokenInfo | undefined {
    if (!this.response || !this.response.data) {
      return undefined;
    }

    return this.response?.data?.token_info_response ?? this.response?.data;
  }
  protected async fetchResponse(): Promise<
    QueryResponse<Erc20ContractTokenInfo>
  > {
    const web3 = new Web3(this.chainGetter.getChain(this.chainId).rest);
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
      status: 1,
      staled: false,
      timestamp: Date.now(),
    };
  }
}

export class ObservableQueryErc20ContractInfo extends ObservableChainQueryMap<Erc20ContractTokenInfo> {
  constructor(
    protected readonly kvStore: KVStore,
    protected readonly chainId: string,
    protected readonly chainGetter: ChainGetter
  ) {
    super(kvStore, chainId, chainGetter, (contractAddress: string) => {
      return new ObservableQueryErc20ContactInfoInner(
        this.kvStore,
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
