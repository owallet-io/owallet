import { IntPretty } from "@owallet/unit";

export interface AprItem {
  chainId: string;
  apr?: IntPretty;
}

export interface AprItemInner {
  apr?: number;
}
