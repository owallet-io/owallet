import { action, flow, makeObservable, observable } from "mobx";
import { rawEncode, rawDecode } from "ethereumjs-abi";
import Axios, { AxiosInstance } from "axios";
import { toGenerator } from "@owallet/common";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { hash as nameHash } from "@ensdomains/eth-ens-namehash";

export class ObservableEnsFetcher {
  static isValidENS(name: string): boolean {
    const strs = name.split(".");
    if (strs.length <= 1) {
      return false;
    }

    const tld = strs[strs.length - 1];
    // TODO: What if more top level domain is added?
    return tld === "eth" || tld === "xyz" || tld === "luxe" || tld === "kred";
  }

  @observable
  protected _isFetching = false;

  @observable
  protected _name: string = "";

  @observable
  protected _coinType: number | undefined = undefined;

  @observable.ref
  protected _address: Uint8Array | undefined = undefined;

  @observable.ref
  protected _error: Error | undefined = undefined;

  constructor(
    public readonly endpoint: string,
    public readonly ensRegistryContract: string = "0x00000000000c2e074ec69a0dfb2997ba6c7d2e1e"
  ) {
    makeObservable(this);
  }

  @action
  setNameAndCoinType(name: string, coinType: number) {
    const prevName = this._name;
    const prevCoinType = this._coinType;

    this._name = name;
    this._coinType = coinType;

    if (this._name !== prevName || this._coinType !== prevCoinType) {
      this.fetch(this._name, this._coinType);
    }
  }

  get isFetching(): boolean {
    return this._isFetching;
  }

  get name(): string {
    return this._name;
  }

  get coinType(): number | undefined {
    return this._coinType;
  }

  get address(): Uint8Array | undefined {
    return this._address;
  }

  get error(): Error | undefined {
    return this._error;
  }

  protected async fetchResolverAddress(
    instance: AxiosInstance,
    node: string
  ): Promise<string> {
    const result = await instance.post<{
      jsonrpc: "2.0";
      result?: string;
      id: string;
      error?: {
        code?: number;
        message?: string;
      };
    }>("", {
      jsonrpc: "2.0",
      id: "1",
      method: "eth_call",
      params: [
        {
          to: this.ensRegistryContract,
          data: rawEncode(["bytes32"], [node]),
        },
        "latest",
      ],
    });

    if (result.data.error && result.data.error.message) {
      throw new Error(result.data.error.message);
    }

    if (!result.data.result) {
      throw new Error("Unknown error");
    }

    return rawDecode(
      ["address"],
      Buffer.from(result.data.result.slice(2), "hex")
    )[0];
  }

  protected async fetchAddrFromResolver(
    instance: AxiosInstance,
    resolver: string,
    node: string,
    coinType: number
  ): Promise<string> {
    const result = await instance.post<{
      jsonrpc: "2.0";
      result?: string;
      id: string;
      error?: {
        code?: number;
        message?: string;
      };
    }>("", {
      jsonrpc: "2.0",
      id: "1",
      method: "eth_call",
      params: [
        {
          to: resolver,
          data: rawEncode(["bytes32", "uint256"], [node, coinType]),
        },
        "latest",
      ],
    });

    if (result.data.error && result.data.error.message) {
      throw new Error(result.data.error.message);
    }

    if (!result.data.result) {
      throw new Error("Unknown error");
    }

    return rawDecode(
      ["bytes"],
      Buffer.from(result.data.result.slice(2), "hex")
    )[0];
  }

  @flow
  protected *fetch(name: string, coinType: number) {
    this._isFetching = true;

    try {
      const instance = Axios.create({
        ...{
          baseURL: this.endpoint,
        },
      });

      const node = nameHash(name);

      const resolver = yield* toGenerator(
        this.fetchResolverAddress(instance, node)
      );

      const addr = yield* toGenerator(
        this.fetchAddrFromResolver(instance, resolver, node, coinType)
      );

      this._address = Buffer.from(addr.replace("0x", ""), "hex");
      this._error = undefined;
    } catch (e) {
      this._error = e;
    }

    this._isFetching = false;
  }
}
