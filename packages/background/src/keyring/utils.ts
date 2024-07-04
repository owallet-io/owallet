import { ChainInfo } from "@owallet/types";
import { PrivKeySecp256k1 } from "@owallet/crypto";
import { Transaction, TransactionOptions } from "ethereumjs-tx";
import Common from "@ethereumjs/common";
import { privateToAddress } from "ethereumjs-util";
import { getChainInfoOrThrow, isEthermintLike } from "@owallet/common";

export class KeyringHelper {
  static convertEthSignature(signature: {
    s: string;
    r: string;
    recoveryParam?: number;
  }) {
    return Buffer.concat([
      Buffer.from(signature.r.replace("0x", ""), "hex"),
      Buffer.from(signature.s.replace("0x", ""), "hex"),
      // The metamask doesn't seem to consider the chain id in this case... (maybe bug on metamask?)
      signature.recoveryParam
        ? Buffer.from("1c", "hex")
        : Buffer.from("1b", "hex"),
    ]);
  }
  static getHexAddressEvm(privKey: PrivKeySecp256k1) {
    // For Ethereum Key-Gen Only:
    const ethereumAddress = privateToAddress(Buffer.from(privKey.toBytes()));
    return ["0x" + Buffer.from(ethereumAddress).toString("hex"), "latest"];
  }

  static validateChainId(chainId: string): number {
    // chain id example: kawaii_6886-1. If chain id input is already a number in string => parse it immediately
    if (isNaN(parseInt(chainId))) {
      const firstSplit = chainId.split("_")[1];
      if (firstSplit) {
        const chainId = parseInt(firstSplit.split("-")[0]);
        return chainId;
      }
      throw new Error("Invalid chain id. Please try again");
    }
    return parseInt(chainId);
  }
  static getRawTxEvm(
    privKey: PrivKeySecp256k1,
    chainId: string,
    nonce: string,
    message: object
  ) {
    const chainIdNumber = this.validateChainId(chainId);
    const customCommon = Common.custom({
      name: chainId,
      networkId: chainIdNumber,
      chainId: chainIdNumber,
    });

    let finalMessage: any = {
      ...message,
      gas: (message as any)?.gasLimit,
      gasPrice: (message as any)?.gasPrice,
      nonce,
      chainId,
    };
    delete finalMessage?.from;
    delete finalMessage?.type;

    const opts: TransactionOptions = { common: customCommon } as any;
    const tx = new Transaction(finalMessage, opts);
    // here
    tx.sign(Buffer.from(privKey.toBytes()));

    const serializedTx = tx.serialize();
    const rawTxHex = "0x" + serializedTx.toString("hex");
    return rawTxHex;
  }
  static isEthermintByChainInfo(chainInfo: ChainInfo) {
    // const chainInfo = getChainInfoOrThrow(chainId);
    const isEthermint = isEthermintLike(chainInfo);
    return isEthermint;
  }
}
