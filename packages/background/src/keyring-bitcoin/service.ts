import { ChainsService } from "../chains";
import { KeyRingService } from "../keyring";
import { InteractionService } from "../interaction";
import { ChainsUIService } from "../chains-ui";
import { Key } from "@owallet/types";
import { Bech32Address } from "@owallet/cosmos";
import { KeyRingBtcBaseService } from "./keyring-base";
import * as bitcoin from "bitcoinjs-lib";
import { Buffer } from "buffer";
import { Env } from "@owallet/router";
import { KeyRingCosmosService } from "../keyring-cosmos";
import { BtcAccountBase } from "@owallet/stores-btc";

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
    const chainInfo = this.chainsService.getChainInfoOrThrow(chainId);

    const pubKey = await this.keyRingBtcBaseService.getPubKey(chainId, vaultId);

    const legacyAddress = bitcoin.payments.p2pkh({
      pubkey: Buffer.from(
        pubKey.toKeyPair().getPublic().encodeCompressed("hex"),
        "hex"
      ),
    }).address;

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
  }

  async signBtcSelected(
    env: Env,
    origin: string,
    chainId: string,
    signer: string,
    message: Uint8Array,
    signType: "legacy" | "bech32"
  ): Promise<{
    signingData: Uint8Array;
    signature?: string;
  }> {
    return await this.signBtc(
      env,
      origin,
      this.keyRingService.selectedVaultId,
      chainId,
      signer,
      message,
      signType
    );
  }

  async signBtc(
    env: Env,
    origin: string,
    vaultId: string,
    chainId: string,
    signer: string,
    message: Uint8Array,
    signType: "legacy" | "bech32"
  ): Promise<{
    signingData: Uint8Array;
    signature?: string;
  }> {
    const chainInfo = this.chainsService.getChainInfoOrThrow(chainId);
    if (chainInfo.hideInUI) {
      throw new Error("Can't sign for hidden chain");
    }
    const isBtcChain = this.chainsService.isBtcChain(chainId);

    if (!isBtcChain) {
      throw new Error("Invalid Btc chain");
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
      const isValid = BtcAccountBase.isBtcAddress(signer);
      if (!isValid) {
        throw Error("Invalid Btc Address");
      }
    } catch {
      throw Error("Invalid Btc Address");
    }

    const key = await this.getKey(vaultId, chainId);
    if (
      (signType === "bech32" && signer !== key.bech32Address) ||
      (signType === "legacy" && signer !== key.btcLegacyAddress)
    ) {
      throw new Error("Signer mismatched");
    }
    return await this.interactionService.waitApproveV2(
      env,
      "/sign-btc",
      "request-sign-btc",
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
        signature?: string;
        inputs: any;
        outputs: any;
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
            console.log(res.inputs, res.outputs, "res.inputs");
            const signature = await this.keyRingBtcBaseService.sign(
              chainId,
              vaultId,
              res.signingData,
              res.inputs,
              res.outputs,
              signType
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
