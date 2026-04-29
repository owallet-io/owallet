import {
  QuerySharedContext,
  ObservableJsonRPCQueryMap,
  ObservableJsonRPCQuery,
} from "../common/query";
import { KVStore } from "@owallet/common";
import { formatUnits } from "@ethersproject/units";
import { keccak256 } from "@ethersproject/keccak256";
import { toUtf8Bytes } from "@ethersproject/strings";

export class VaultPriceStore extends ObservableJsonRPCQueryMap<string> {
  constructor(
    protected readonly kvStore: KVStore,
    protected readonly rpcUrl: string,
  ) {
    super((address: string) => {
      const sig = "lastPricePerShare()";
      const hash = keccak256(toUtf8Bytes(sig));
      const selector = hash.slice(0, 10);

      // selector for lastPricePerShare() is 0x758f126d
      return new ObservableJsonRPCQuery<string>(
        new QuerySharedContext(kvStore, {
          responseDebounceMs: 0,
        }),
        rpcUrl,
        "",
        "eth_call",
        [
          {
            to: address,
            data: selector,
          },
          "latest",
        ],
      );
    });
  }

  getPrice(address: string): number | undefined {
    const query = this.get(address);

    if (query.response) {
      console.log("query", query.response.data);
      const hex = query.response.data;
      try {
        console.log("hex", Number(hex));
        // lastPricePerShare is 18 decimals
        const price = formatUnits(hex, 18);

        console.log("price", price);
        return Number(price);
      } catch (e) {
        console.error("Failed to parse vault price", e);
        return undefined;
      }
    }
    return undefined;
  }

  async waitPrice(address: string): Promise<number | undefined> {
    const query = this.get(address);
    await query.waitResponse();
    return this.getPrice(address);
  }
}
