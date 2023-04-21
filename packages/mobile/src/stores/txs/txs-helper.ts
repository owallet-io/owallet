import { ChainIdEnum } from "./enums";

export class TxsHelper {
  public readonly BASE_API_TXS_URL = {
    [ChainIdEnum.TRON]: 'https://apilist.tronscanapi.com',
    [ChainIdEnum.BNBChain]: 'https://apilist.tronscanapi.com',
    [ChainIdEnum.KawaiiEvm]: 'https://apilist.tronscanapi.com',
    [ChainIdEnum.Ethereum]: 'https://apilist.tronscanapi.com',
  };
}
