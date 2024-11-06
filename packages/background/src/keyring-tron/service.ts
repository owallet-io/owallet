import { ChainsService } from "../chains";
import { KeyRingService } from "../keyring";
import { InteractionService } from "../interaction";
import { ChainsUIService } from "../chains-ui";
import { Key } from "@owallet/types";
import { KeyRingCosmosService } from "../keyring-cosmos";
import { KeyRingTronBaseService } from "./keyring-base";
import { DEFAULT_FEE_LIMIT_TRON, TronWebProvider } from "@owallet/common";
import { APP_PORT, Env } from "@owallet/router";

export class KeyRingTronService {
  constructor(
    protected readonly chainsService: ChainsService,
    public readonly keyRingService: KeyRingService,
    protected readonly interactionService: InteractionService,
    protected readonly chainsUIService: ChainsUIService,
    protected readonly msgPrivilegedOrigins: string[],
    protected readonly keyRingTronBaseService: KeyRingTronBaseService,
    protected readonly keyRingCosmosService: KeyRingCosmosService
  ) {}

  async init() {
    // TODO: ?
    // this.chainsService.addChainSuggestedHandler(
    //   this.onChainSuggested.bind(this)
    // );
  }

  async getKeySelected(chainId: string): Promise<Key> {
    return this.keyRingCosmosService.getKeySelected(chainId);
  }

  async getKey(vaultId: string, chainId: string): Promise<Key> {
    return this.keyRingCosmosService.getKey(vaultId, chainId);
  }

  async signTronSelected(
    env: Env,
    origin: string,
    chainId: string,
    data: string
  ): Promise<{
    signingData: Uint8Array;
    signature?: any;
  }> {
    console.log("data signTronSelected", data);

    return await this.signTron(
      env,
      origin,
      this.keyRingService.selectedVaultId,
      chainId,
      data
    );
  }

  async signTron(
    env: Env,
    origin: string,
    vaultId: string,
    chainId: string,
    data: string
  ): Promise<{
    signingData: Uint8Array;
    signature?: any;
  }> {
    const chainInfo = this.chainsService.getChainInfoOrThrow(chainId);
    if (chainInfo.hideInUI) {
      throw new Error("Can't sign for hidden chain");
    }
    const isTronChain = this.chainsService.isTronChain(chainId);

    if (!isTronChain) {
      throw new Error("Invalid Tron chain");
    }

    const keyInfo = this.keyRingService.getKeyInfo(vaultId);
    if (!keyInfo) {
      throw new Error("Null key info");
    }

    if (keyInfo.type === "ledger") {
      KeyRingCosmosService.throwErrorIfEthermintWithLedgerButNotSupported(
        chainId
      );
    }

    const key = await this.getKey(vaultId, chainId);

    return await this.interactionService.waitApproveV2(
      env,
      "/sign-tron",
      "request-sign-tron",
      {
        origin,
        chainId,
        pubKey: key.pubKey,
        data,
        keyInsensitive: keyInfo.insensitive,
      },
      async (res: { signingData: Uint8Array; signature?: any }) => {
        return await (async () => {
          if (keyInfo.type === "ledger" || keyInfo.type === "keystone") {
            if (!res.signature) {
              throw new Error("Frontend should provide signature");
            }

            return {
              signingData: res.signingData,
              signature: res.signature,
            };
          } else {
            const signature = await this.keyRingTronBaseService.sign(
              chainId,
              vaultId,
              data
            );
            return {
              signingData: res.signingData,
              signature: signature,
            };
          }
        })();
      }
    );
  }
}
