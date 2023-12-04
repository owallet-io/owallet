export type Uint128 = string;
export type AssetInfo =
  | {
      token: {
        contract_addr: Addr;
      };
    }
  | {
      native_token: {
        denom: string;
      };
    };
export type Addr = string;
export type Logo =
  | {
      url: string;
    }
  | {
      embedded: EmbeddedLogo;
    };
export type EmbeddedLogo =
  | {
      svg: Binary;
    }
  | {
      png: Binary;
    };
export type Binary = string;
export interface Cw20Coin {
  address: string;
  amount: Uint128;
}
export interface Asset {
  amount: Uint128;
  info: AssetInfo;
}
export interface InstantiateMarketingInfo {
  description?: string | null;
  logo?: Logo | null;
  marketing?: string | null;
  project?: string | null;
}
export interface Config {
  cw20_code_id: number;
  factory_addr: Addr;
  owner: Addr;
}
export { SigningCosmWasmClient, ExecuteResult } from '@cosmjs/cosmwasm-stargate';
