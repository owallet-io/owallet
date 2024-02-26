import { ObservableChainQuery } from '../chain-query';
import { KVStore } from '@owallet/common';
import { ChainGetter } from '../../common';
import { QueryResponse } from '../../common';
import ERC20_ABI from './erc20';

import Web3 from 'web3';

export class ObservableEvmContractChainQuery<
  T
> extends ObservableChainQuery<T> {
  constructor(
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter,
    protected readonly contractAddress: string,
    // eslint-disable-next-line @typescript-eslint/ban-types
    protected obj : { [key: string]: any }
  ) {
    super(
      kvStore,
      chainId,
      chainGetter,
      ''
    );
  }

  
  

  protected canFetch(): boolean {
    return this.contractAddress.length !== 0;
  }

  protected async fetchResponse(
  ): Promise<QueryResponse<T>> {
    
    const web3 = new Web3(this.chainGetter.getChain(this.chainId).rest);
    // @ts-ignore
    const contract = new web3.eth.Contract(ERC20_ABI, this.contractAddress);
    const tokenDecimal = await contract.methods.decimals().call();
    const tokenSymbol = await contract.methods.symbol().call();
    const tokenName = await contract.methods.name().call();
    if(this.obj?.balance?.address) throw new Error('Not found wallet address on erc20');
    console.log("🚀 ~ this.obj:", this.obj)
    const total_supply = await contract.methods.balanceOf(this.obj.balance.address).call();
    const tokenInfoData = {
      decimals: parseInt(tokenDecimal),
      symbol: tokenSymbol,
      name: tokenName,
      total_supply: total_supply,
      token_info_response: {
        decimals: parseInt(tokenDecimal),
        name: tokenName,
        symbol: tokenSymbol,
        total_supply: total_supply
      }
    };
    if (!total_supply) {
      throw new Error('Failed to get the response from the contract');
    }

    return {
      data: tokenInfoData as T,
      status: 1,
      staled: false,
      timestamp: Date.now()
    };
  }
    
}
