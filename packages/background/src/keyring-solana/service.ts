import { ChainsService } from "../chains";
import { KeyRingService } from "../keyring";
import { InteractionService } from "../interaction";
import { ChainsUIService } from "../chains-ui";
import { Key } from "@owallet/types";
import { KeyRingSvmBaseService } from "./keyring-base";
import { Env } from "@owallet/router";
import { deserializeTransaction } from "@owallet/common";
import { createSignInMessage } from "@solana/wallet-standard-util";
import { TransactionSvmType } from "@owallet/types/build/svm";
import { PublicKey, VersionedTransaction } from "@solana/web3.js";
import { decode, encode } from "bs58";
import { SolanaSignInInput } from "@solana/wallet-standard-features";

export class KeyRingSvmService {
  constructor(
    protected readonly chainsService: ChainsService,
    public readonly keyRingService: KeyRingService,
    protected readonly interactionService: InteractionService,
    protected readonly chainsUIService: ChainsUIService,
    protected readonly msgPrivilegedOrigins: string[],
    protected readonly keyRingSvmBaseService: KeyRingSvmBaseService
  ) {}

  async init() {
    // TODO: ?
  }

  // async requestSendAndConfirmTxSvm(
  //     env: Env,
  //     origin: string,
  //     chainId: string,
  //     signer: string,
  //     unsignedTx: Uint8Array
  // ): Promise<Uint8Array> {
  //     try {
  //         const key = await this.getKeySelected(chainId);
  //
  //         if (signer !== key.base58Address) {
  //             throw new Error("Signer mismatched");
  //         }
  //
  //         const newDataConfirm = await this.interactionService.waitApprove(
  //             env,
  //             "/sign-svm",
  //             "request-sign-svm",
  //             {
  //                 origin,
  //                 chainId,
  //                 signer,
  //                 unsignedTx,
  //             }
  //         );
  //         return await this.keyRing.sendAndConfirmSvm(
  //             chainId,
  //             (newDataConfirm as any).unsignedTx
  //         );
  //     }
  // }

  async requestSignTransactionSvm(
    env: Env,
    origin: string,
    chainId: string,
    signer: string,
    tx: string
  ): Promise<{
    signature: string;
    signedTx: string;
  }> {
    const key = await this.getKeySelected(chainId);
    const keyInfo = this.keyRingService.getKeyInfo(
      this.keyRingService.selectedVaultId
    );
    if (signer !== key.base58Address) {
      throw new Error("Signer mismatched");
    }
    return await this.interactionService.waitApproveV2(
      env,
      "/sign-svm",
      "request-sign-svm",
      {
        origin,
        chainId,
        signer,
        pubKey: new PublicKey(key.base58Address),
        message: tx,
        signType: TransactionSvmType.SIGN_TRANSACTION,
        keyType: keyInfo.type,
        keyInsensitive: keyInfo.insensitive,
      },
      async (res: { signingData: string; signature?: string }) => {
        return await (async () => {
          if (keyInfo.type === "ledger" || keyInfo.type === "keystone") {
            if (!res.signature) {
              throw new Error("Frontend should provide signature");
            }

            // return {
            //     // signingData: res.signingData,
            //     // signature: res.signature,
            // };
            return;
          } else {
            const transaction = deserializeTransaction(res.signingData);
            const message = transaction.message.serialize();
            const txMessage = encode(message);
            const signature = await this.keyRingSvmBaseService.sign(
              chainId,
              this.keyRingService.selectedVaultId,
              txMessage
            );
            const signedTx = VersionedTransaction.deserialize(
              decode(res.signingData)
            );
            //@ts-ignore
            signedTx.addSignature(new PublicKey(signer), decode(signature));
            return {
              signature,
              signedTx: encode(signedTx.serialize()),
            };
          }
        })();
      }
    );
  }

  async requestSignAllTransactionSvm(
    env: Env,
    origin: string,
    chainId: string,
    signer: string,
    txs: Array<string>
  ): Promise<
    Array<{
      signature: string;
      signedTx: string;
    }>
  > {
    const key = await this.getKeySelected(chainId);
    const keyInfo = this.keyRingService.getKeyInfo(
      this.keyRingService.selectedVaultId
    );
    if (signer !== key.base58Address) {
      throw new Error("Signer mismatched");
    }
    return await this.interactionService.waitApproveV2(
      env,
      "/sign-svm",
      "request-sign-svm",
      {
        origin,
        chainId,
        signer,
        pubKey: new PublicKey(key.base58Address),
        message: txs,
        signType: TransactionSvmType.SIGN_ALL_TRANSACTIONS,
        keyType: keyInfo.type,
        keyInsensitive: keyInfo.insensitive,
      },
      async (res: { signingDatas: string; signature?: string }) => {
        return await (async () => {
          if (keyInfo.type === "ledger" || keyInfo.type === "keystone") {
            if (!res.signature) {
              throw new Error("Frontend should provide signature");
            }

            // return {
            //     signingData: res.signingData,
            //     signature: res.signature,
            // };
            return;
          } else {
            const signatures: { signedTx: string; signature: string }[] = [];

            for (let i = 0; i < res.signingDatas.length; i++) {
              const tx = res.signingDatas[i];
              try {
                const transaction = deserializeTransaction(tx);
                const message = transaction.message.serialize();
                const txMessage = encode(message);
                const signature = await this.keyRingSvmBaseService.sign(
                  chainId,
                  this.keyRingService.selectedVaultId,
                  txMessage
                );
                const signedTx = VersionedTransaction.deserialize(decode(tx));
                //@ts-ignore
                signedTx.addSignature(new PublicKey(signer), decode(signature));
                signatures.push({
                  signedTx: encode(signedTx.serialize()),
                  signature,
                });
              } catch (e) {
                console.error(e);
                throw Error(JSON.stringify(e));
              }
            }
            return signatures;
          }
        })();
      }
    );
  }

  async requestSignMessageSvm(
    env: Env,
    origin: string,
    chainId: string,
    signer: string,
    tx: string
  ): Promise<{
    signedMessage: string;
  }> {
    const key = await this.getKeySelected(chainId);
    const keyInfo = this.keyRingService.getKeyInfo(
      this.keyRingService.selectedVaultId
    );
    if (signer !== key.base58Address) {
      throw new Error("Signer mismatched");
    }
    return await this.interactionService.waitApproveV2(
      env,
      "/sign-svm",
      "request-sign-svm",
      {
        origin,
        chainId,
        signer,
        pubKey: new PublicKey(key.base58Address),
        message: tx,
        signType: TransactionSvmType.SIGN_MESSAGE,
        keyType: keyInfo.type,
        keyInsensitive: keyInfo.insensitive,
      },
      async (res: { signingData: string; signature?: string }) => {
        return await (async () => {
          if (keyInfo.type === "ledger" || keyInfo.type === "keystone") {
            if (!res.signature) {
              throw new Error("Frontend should provide signature");
            }

            // return {
            //     signingData: res.signingData,
            //     signature: res.signature,
            // };
            return;
          } else {
            const signature = await this.keyRingSvmBaseService.sign(
              chainId,
              this.keyRingService.selectedVaultId,
              res.signingData
            );
            return {
              signedMessage: signature,
            };
          }
        })();
      }
    );
  }

  async requestSignInSvm(
    env: Env,
    origin: string,
    chainId: string,
    signer: string,
    inputs: SolanaSignInInput
  ): Promise<{
    publicKey: string;
    signedMessage: string;
    signature: string;
    connectionUrl: string;
  }> {
    const key = await this.getKeySelected(chainId);
    const keyInfo = this.keyRingService.getKeyInfo(
      this.keyRingService.selectedVaultId
    );
    const chainInfo = await this.chainsService.getChainInfo(chainId);
    if (signer !== key.base58Address) {
      throw new Error("Signer mismatched");
    }
    return await this.interactionService.waitApproveV2(
      env,
      "/sign-svm",
      "request-sign-svm",
      {
        origin,
        chainId,
        signer,
        pubKey: new PublicKey(key.base58Address),
        message: inputs,
        signType: TransactionSvmType.SIGN_IN,
        keyType: keyInfo.type,
        keyInsensitive: keyInfo.insensitive,
      },
      async (res: { signingData: string; signature?: string }) => {
        return await (async () => {
          if (keyInfo.type === "ledger" || keyInfo.type === "keystone") {
            if (!res.signature) {
              throw new Error("Frontend should provide signature");
            }

            // return {
            //     signingData: res.signingData,
            //     signature: res.signature,
            // };
            return;
          } else {
            const message = createSignInMessage({
              domain: origin,
              address: signer,
              ...(inputs ?? {}),
            });

            const encodedMessage = encode(message);
            const signature = await this.keyRingSvmBaseService.sign(
              chainId,
              this.keyRingService.selectedVaultId,
              encodedMessage
            );
            return {
              signedMessage: encodedMessage,
              signature,
              publicKey: key.base58Address,
              connectionUrl: chainInfo.rpc,
            };
          }
        })();
      }
    );
  }

  async getKeySelected(chainId: string): Promise<Key> {
    return await this.getKey(this.keyRingService.selectedVaultId, chainId);
  }

  async getKey(vaultId: string, chainId: string): Promise<Key> {
    const pubKey = await this.keyRingSvmBaseService.getPubKey(chainId, vaultId);
    const keyInfo = this.keyRingService.getKeyInfo(vaultId);

    return {
      name: this.keyRingService.getKeyRingName(vaultId),
      algo: "",
      pubKey: pubKey.toBytes(),
      address: pubKey.toBytes(),
      base58Address: pubKey.toBase58(),
      ethereumHexAddress: "",
      isNanoLedger: keyInfo.type === "ledger",
      isKeystone: keyInfo.type === "keystone",
      bech32Address: "",
    };
  }
}
