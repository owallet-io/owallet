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
import { KeyRingBtcBaseService } from "./keyring-base";
import { getAddress } from "@owallet/bitcoin";
import * as bitcoin from "bitcoinjs-lib";
import { Buffer } from "buffer";

export class KeyRingBtcService {
  constructor(
    protected readonly chainsService: ChainsService,
    public readonly keyRingService: KeyRingService,
    protected readonly interactionService: InteractionService,
    protected readonly chainsUIService: ChainsUIService,
    protected readonly msgPrivilegedOrigins: string[],
    protected readonly keyRingBtcBaseService: KeyRingBtcBaseService
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
      const pubKey = await this.keyRingBtcBaseService.getPubKey(
        chainId,
        vaultId
      );
      const legacyAddress = bitcoin.payments.p2pkh({
        pubkey: Buffer.from(
          pubKey.toKeyPair().getPublic().encodeCompressed("hex"),
          "hex"
        ),
      }).address;
      console.log(legacyAddress, "legacyAddress2");
      const pubKeyBip84 = await this.keyRingBtcBaseService.getPubKeyBip84(
        chainId,
        vaultId
      );
      const address = pubKeyBip84.getCosmosAddress();
      const bech32Address = new Bech32Address(address);
      const keyInfo = this.keyRingService.getKeyInfo(vaultId);

      return {
        name: this.keyRingService.getKeyRingName(vaultId),
        algo: "secp256k1",
        pubKey: pubKeyBip84.toBytes(),
        address,
        bech32Address: bech32Address.toBech32Btc(
          chainInfo.bech32Config?.bech32PrefixAccAddr ?? ""
        ),
        ethereumHexAddress: "",
        btcLegacyAddress: legacyAddress,
        isNanoLedger: keyInfo.type === "ledger",
        isKeystone: keyInfo.type === "keystone",
      };
    } catch (e) {
      console.error(e, "err get key btc");
    }
  }
}
