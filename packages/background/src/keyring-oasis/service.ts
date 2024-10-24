import { ChainsService } from "../chains";
import { KeyRing, KeyRingService } from "../keyring";

import { InteractionService } from "../interaction";
import { ChainsUIService } from "../chains-ui";
import { ChainInfo, Key } from "@owallet/types";
import { KeyRingCosmosService } from "../keyring-cosmos";
import { Bech32Address, ChainIdHelper } from "@owallet/cosmos";
import { PubKeySecp256k1 } from "@owallet/crypto";
import { Vault, VaultService } from "../vault";
import * as oasis from "@oasisprotocol/client";
import { KeyRingOasisBaseService } from "./keyring-base";

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
    // this.chainsService.addChainSuggestedHandler(
    //   this.onChainSuggested.bind(this)
    // );
  }

  async getKeySelected(chainId: string): Promise<Key> {
    return await this.getKey(this.keyRingService.selectedVaultId, chainId);
  }

  async getKey(vaultId: string, chainId: string): Promise<Key> {
    try {
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
    } catch (e) {
      console.error(e, "err get key oasis");
    }
  }
}
