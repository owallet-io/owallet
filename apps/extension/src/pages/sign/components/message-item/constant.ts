import { Optional } from "utility-types";

export declare const EnumAction: {
  transfer: {
    to_address: string;
  };
  ibc_transfer: {
    ibc_info: Object;
    fee_swap: Optional<null>;
  };
  contract_call: {
    contract_address: string;
    msg: any;
  };
  ibc_wasm_transfer: {
    ibc_wasm_info: Object;
    fee_swap: Optional<null>;
  };
};

export const TX_PARSER = "https://tx-parser.orai.network/";
// export const TX_PARSER = "http:/192.168.20.81:9000/";
