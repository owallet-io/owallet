export interface Coin {
    readonly denom: string;
    readonly amount: string;
  }
  
  export interface StdFee {
    readonly amount: readonly Coin[];
    readonly gas: string;
    readonly payer?: string;
    readonly granter?: string;
  
    // XXX: "feePayer" should be "payer". But, it maybe from ethermint team's mistake.
    //      That means this part is not standard.
    readonly feePayer?: string;
  }
  
  export interface Msg {
    readonly type: string;
    readonly value: any;
  }
  
  export interface StdSignDoc {
    readonly chain_id: string;
    readonly account_number: string;
    readonly sequence: string;
    // Should be nullable
    readonly timeout_height?: string;
    readonly fee: StdFee;
    readonly msgs: readonly Msg[];
    readonly memo: string;
  }