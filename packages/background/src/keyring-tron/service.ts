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
import { KeyRingTronBaseService } from "./keyring-base";

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
}
