import { Buffer } from "buffer/";
import { Hash, PrivKeySecp256k1, PubKeySecp256k1 } from "@owallet/crypto";
import { KeyRingPrivateKeyService } from "../../keyring-private-key";
import { Vault, VaultService } from "../../vault";
import { HDKey, TW } from "@owallet/common";
import { KeyRingOasis } from "../../keyring";
import { ChainInfo, TransactionType } from "@owallet/types";
import { types } from "@oasisprotocol/client";

export class KeyRingOasisPrivateKeyService implements KeyRingOasis {
  constructor(
    protected readonly vaultService: VaultService,
    protected readonly baseKeyringService: KeyRingPrivateKeyService
  ) {}
  supportedKeyRingType(): string {
    return this.baseKeyringService.supportedKeyRingType();
  }
  createKeyRingVault(privateKey: Uint8Array) {
    if (!privateKey || privateKey.length === 0) {
      throw new Error("Invalid arguments");
    }
    const keyPair = HDKey.getAccountSignerFromPrivateKey(privateKey);
    if (!keyPair) throw new Error("KeyPair from Private Key Invalid");
    const publicKey = Buffer.from(keyPair.publicKey).toString("hex");
    return Promise.resolve({
      insensitive: {
        publicKey,
      },
      sensitive: {
        privateKey: Buffer.from(privateKey).toString("hex"),
      },
    });
  }

  getPubKey(vault: Vault, coinType: number, chainInfo: ChainInfo): Uint8Array {
    if (
      !chainInfo?.features.includes("gen-address") ||
      !chainInfo?.features.includes("oasis")
    ) {
      throw new Error(`${chainInfo.chainId} not support get pubKey from base`);
    }
    const publicKeyBytes = Buffer.from(
      vault.insensitive["publicKey"] as string,
      "hex"
    );

    return publicKeyBytes;
  }

  sign(
    vault: Vault,
    _coinType: number,
    data: Uint8Array
  ): types.SignatureSigned {
    // const privateKeyText = this.vaultService.decrypt(vault.sensitive)[
    //     "privateKey"
    //     ] as string;
    // const privateKey = new PrivKeySecp256k1(Buffer.from(privateKeyText, "hex"));
    //
    // let digest = new Uint8Array();
    // switch (digestMethod) {
    //     case "sha256":
    //         digest = Hash.sha256(data);
    //         break;
    //     case "keccak256":
    //         digest = Hash.keccak256(data);
    //         break;
    //     default:
    //         throw new Error(`Unknown digest method: ${digestMethod}`);
    // }
    //
    // return privateKey.signDigest32(digest);
    return;
  }
}
