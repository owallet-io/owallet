import { ChainsService } from "../chains";
import { KeyRingService } from "../keyring";

import { InteractionService } from "../interaction";
import { ChainsUIService } from "../chains-ui";
import { Key, TransactionType } from "@owallet/types";
import { KeyRingCosmosService } from "../keyring-cosmos";
import { Bech32Address } from "@owallet/cosmos";
import * as oasis from "@oasisprotocol/client";
import { KeyRingOasisBaseService } from "./keyring-base";
import { Env } from "@owallet/router";

export class KeyRingOasisService {
  constructor(
    protected readonly chainsService: ChainsService,
    public readonly keyRingService: KeyRingService,
    protected readonly interactionService: InteractionService,
    protected readonly chainsUIService: ChainsUIService,
    protected readonly msgPrivilegedOrigins: string[],
    protected readonly keyRingOasisBaseService: KeyRingOasisBaseService
  ) {}

  async init() {
    // TODO: ?
  }

  async getKeySelected(chainId: string): Promise<Key> {
    return await this.getKey(this.keyRingService.selectedVaultId, chainId);
  }

  async getKey(vaultId: string, chainId: string): Promise<Key> {
    const chainInfo = this.chainsService.getChainInfoOrThrow(chainId);
    const pubKey = await this.keyRingOasisBaseService.getPubKey(
      chainId,
      vaultId
    );
    const address = await oasis.staking.addressFromPublicKey(pubKey);
    const bech32Address = new Bech32Address(address);
    const keyInfo = this.keyRingService.getKeyInfo(vaultId);
    return {
      name: this.keyRingService.getKeyRingName(vaultId),
      algo: "secp256k1",
      pubKey: pubKey,
      address,
      bech32Address: bech32Address.toBech32(
        chainInfo.bech32Config?.bech32PrefixAccAddr ?? ""
      ),
      ethereumHexAddress: "",
      isNanoLedger: keyInfo.type === "ledger",
      isKeystone: keyInfo.type === "keystone",
    };
  }
  async signOasisSelected(
    env: Env,
    origin: string,
    chainId: string,
    signer: string,
    message: Uint8Array,
    signType: TransactionType
  ): Promise<{
    signingData: Uint8Array;
    signature?: oasis.types.SignatureSigned;
  }> {
    return await this.signOasis(
      env,
      origin,
      this.keyRingService.selectedVaultId,
      chainId,
      signer,
      message,
      signType
    );
  }

  async signOasis(
    env: Env,
    origin: string,
    vaultId: string,
    chainId: string,
    signer: string,
    message: Uint8Array,
    signType: TransactionType
  ): Promise<{
    signingData: Uint8Array;
    signature?: oasis.types.SignatureSigned;
  }> {
    const chainInfo = this.chainsService.getChainInfoOrThrow(chainId);
    if (chainInfo.hideInUI) {
      throw new Error("Can't sign for hidden chain");
    }
    const isOasisChain = this.chainsService.isOasisChain(chainId);

    if (!isOasisChain) {
      throw new Error("Invalid Oasis chain");
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

    try {
      Bech32Address.validate(signer);
    } catch {
      console.error("Fail validate Bech32Address");
    }

    const key = await this.getKey(vaultId, chainId);
    if (signer !== key.bech32Address) {
      throw new Error("Signer mismatched");
    }

    return await this.interactionService.waitApproveV2(
      env,
      "/sign-oasis",
      "request-sign-oasis",
      {
        origin,
        chainId,
        signer,
        pubKey: key.pubKey,
        message,
        signType,
        keyType: keyInfo.type,
        keyInsensitive: keyInfo.insensitive,
      },
      async (res: {
        signingData: Uint8Array;
        signature?: oasis.types.SignatureSigned;
      }) => {
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
            switch (signType) {
              case TransactionType.StakingTransfer: {
                const signature = await this.keyRingOasisBaseService.sign(
                  chainId,
                  vaultId,
                  res.signingData
                );
                return {
                  signingData: res.signingData,
                  signature: signature,
                };
              }

              default:
                throw new Error(`Unknown sign type: ${signType}`);
            }
          }
        })();
      }
    );
  }
}
