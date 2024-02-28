import Transport from "@ledgerhq/hw-transport";
import CosmosApp from "@ledgerhq/hw-app-cosmos";
import EthApp from "@ledgerhq/hw-app-eth";
import TrxApp from "@ledgerhq/hw-app-trx";
import BtcApp from "@ledgerhq/hw-app-btc";
import TransportWebHID from "@ledgerhq/hw-transport-webhid";
import TransportWebUSB from "@ledgerhq/hw-transport-webusb";
import { signatureImport } from "secp256k1";
import { Buffer } from "buffer";
import { OWalletError } from "@owallet/router";
import {
  EIP712MessageValidator,
  stringifyPath,
  ethSignatureToBytes,
  domainHash,
  messageHash,
} from "../utils/helper";
import { LedgerAppType, keyDerivationToAddressType } from "@owallet/common";
import * as Bitcoin from "bitcoinjs-lib";
import {
  buildTx,
  getAddressTypeByAddress,
  getCoinNetwork,
} from "@owallet/bitcoin";
import { AddressBtcType, KeyDerivationTypeEnum } from "@owallet/types";
import { Transaction } from "@ledgerhq/hw-app-btc/lib/types";
export type TransportIniter = (...args: any[]) => Promise<Transport>;
export interface UTXO {
  txid: string;
  value: number;
  vout: number;
  addr: string;

  key(): string;
}

export enum LedgerInitErrorOn {
  Transport,
  App,
  Unknown,
}

export class LedgerInitError extends Error {
  constructor(public readonly errorOn: LedgerInitErrorOn, message?: string) {
    super(message);

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, LedgerInitError.prototype);
  }
}

export type TransportMode = "webusb" | "webhid" | "ble";

export class LedgerInternal {
  constructor(
    private readonly ledgerApp: CosmosApp | EthApp | TrxApp | BtcApp,
    private readonly type: LedgerAppType
  ) {}

  static transportIniters: Record<TransportMode, TransportIniter> = {
    webusb: TransportWebUSB.create.bind(TransportWebUSB),
    webhid: TransportWebHID.create.bind(TransportWebHID),
    // implemented in ReactNative
    ble: () => Promise.resolve(null),
  };

  static async init(
    mode: TransportMode,
    initArgs: any[] = [],
    ledgerAppType: LedgerAppType
  ): Promise<LedgerInternal> {
    const transportIniter = LedgerInternal.transportIniters[mode];
    if (!transportIniter) {
      throw new OWalletError("ledger", 112, `Unknown mode: ${mode}`);
    }

    let app: CosmosApp | EthApp | TrxApp | BtcApp;

    const transport = await transportIniter(...initArgs);

    try {
      if (ledgerAppType === "trx") {
        app = new TrxApp(transport);
      } else if (ledgerAppType === "eth") {
        app = new EthApp(transport);
      } else if (ledgerAppType === "btc") {
        app = new BtcApp(transport);
      } else {
        app = new CosmosApp(transport);
      }

      const ledger = new LedgerInternal(app, ledgerAppType);

      if (ledgerAppType === "cosmos") {
        const versionResponse = await ledger.getVersion();

        // In this case, device is on screen saver.
        // However, it is almost same as that the device is not unlocked to user-side.
        // So, handle this case as initializing failed in `Transport`.
        if (versionResponse.deviceLocked) {
          throw new Error("Device is on screen saver");
        }
      }

      return ledger;
    } catch (e) {
      if (transport) {
        await transport.close();
      }
      if (e.message === "Device is on screen saver") {
        throw new LedgerInitError(LedgerInitErrorOn.Transport, e.message);
      }

      throw new LedgerInitError(LedgerInitErrorOn.App, e.message);
    }
  }

  async getVersion(): Promise<{
    deviceLocked: boolean;
    major: number;
    version: string;
    testMode: boolean;
  }> {
    const app = this.ledgerApp as CosmosApp;
    if (!app) {
      throw new Error("Cosmos App not initialized");
    }

    const { version, device_locked, major, test_mode } =
      await app.getAppConfiguration();

    return {
      deviceLocked: device_locked,
      major,
      version,
      testMode: test_mode,
    };
  }

  public get LedgerAppTypeDesc(): string {
    switch (this.type) {
      case "cosmos":
        return "Cosmos App";
      case "eth":
        return "Ethereum App";
      case "trx":
        return "Tron App";
      case "btc":
        return "Bitcoin App";
    }
  }

  async getPublicKey(path: number[]): Promise<object> {
    if (!this.ledgerApp) {
      throw new Error(`${this.LedgerAppTypeDesc} not initialized`);
    }

    if (this.ledgerApp instanceof CosmosApp) {
      // make compartible with ledger-cosmos-js
      const { publicKey, address } = await this.ledgerApp.getAddress(
        stringifyPath(path),
        "cosmos"
      );
      return { publicKey: Buffer.from(publicKey, "hex"), address };
    } else if (this.ledgerApp instanceof EthApp) {
      const { publicKey, address } = await this.ledgerApp.getAddress(
        stringifyPath(path)
      );

      const pubKey = Buffer.from(publicKey, "hex");
      // Compress the public key
      return {
        // publicKey: publicKeyConvert(pubKey, true),
        address,
        publicKey: pubKey,
      };
    } else if (this.ledgerApp instanceof BtcApp) {
      try {
        const pathBtc = stringifyPath(path);
        const keyDerivation = path[0].toString() as KeyDerivationTypeEnum;
        const format = keyDerivationToAddressType(keyDerivation);
        const { publicKey, bitcoinAddress } =
          await this.ledgerApp.getWalletPublicKey(pathBtc, {
            format: format,
            verify: false,
          });
        const pubKey = Buffer.from(publicKey, "hex");
        // Compress the public key
        return {
          // publicKey: publicKeyConvert(pubKey, true),
          address: bitcoinAddress,
          publicKey: pubKey,
        };
      } catch (error) {
        console.log(
          "🚀 ~ file: ledger-internal.ts:182 ~ LedgerInternal ~ getPublicKey ~ error:",
          error
        );
      }
    } else {
      const { publicKey, address } = await this.ledgerApp.getAddress(
        stringifyPath(path)
      );
      // Compress the public key
      return { publicKey: Buffer.from(publicKey, "hex"), address };
    }
  }

  async sign(path: number[], message: any): Promise<Uint8Array | any> {
    if (!this.ledgerApp) {
      throw new Error(`${this.LedgerAppTypeDesc} not initialized`);
    }

    if (this.ledgerApp instanceof CosmosApp) {
      const { signature } = await this.ledgerApp.sign(
        stringifyPath(path),
        message
      );

      // Parse a DER ECDSA signature
      return signatureImport(signature);
    } else if (this.ledgerApp instanceof EthApp) {
      const rawTxHex = Buffer.from(message).toString("hex");

      const signDoc = (() => {
        try {
          return JSON.parse(Buffer.from(message).toString());
        } catch (error) {
          return null;
        }
      })();

      if (
        signDoc &&
        signDoc?.chain_id &&
        signDoc?.chain_id?.startsWith("injective")
      ) {
        const eip712 = { ...signDoc?.eip712 };
        delete signDoc.eip712;
        let data: any;
        try {
          const message = Buffer.from(
            JSON.stringify({
              types: eip712.types,
              domain: eip712.domain,
              primaryType: eip712.primaryType,
              message: signDoc,
            })
          );
          data = await EIP712MessageValidator.validateAsync(
            JSON.parse(Buffer.from(message).toString())
          );
        } catch (e) {
          console.log(
            "🚀 ~ file: ledger-internal.ts:188 ~ LedgerInternal ~ sign ~ e:",
            e
          );
          throw new Error(e.message || e.toString());
        }
        try {
          // Unfortunately, signEIP712Message not works on ledger yet.
          return ethSignatureToBytes(
            await this.ledgerApp.signEIP712HashedMessage(
              stringifyPath(path),
              domainHash(data),
              messageHash(data)
            )
          );
        } catch (e) {
          if (e?.message.includes("(0x6985)")) {
            throw new Error("User rejected signing");
          }
          throw new Error(e.message || e.toString());
        }
      }

      const signature = await this.ledgerApp.signTransaction(
        stringifyPath(path),
        rawTxHex
      );
      return signature;
      // return convertEthSignature(signature);
    } else if (this.ledgerApp instanceof BtcApp) {
      const messageStr = Buffer.from(message).toString("utf-8");
      if (!messageStr) {
        throw new Error("Not found messageStr for ledger app type BTC");
      }
      const msgObject = JSON.parse(messageStr);
      const data = (await this.getPublicKey(path)) as {
        address: string;
        publicKey: Buffer;
      };

      try {
        const keyPair = Bitcoin.ECPair.fromPublicKey(data.publicKey, {
          network: getCoinNetwork(msgObject.msgs.selectedCrypto),
        });

        return await this.signTransactionBtc(
          stringifyPath(path),
          msgObject.msgs.amount,
          msgObject.utxos,
          msgObject.msgs.address,
          msgObject.msgs.selectedCrypto,
          msgObject.msgs.changeAddress,
          msgObject.msgs.totalFee,
          msgObject.msgs.message,
          msgObject.msgs.feeRate,
          keyPair
        );
      } catch (error) {
        console.log(
          "🚀 ~ file: ledger-internal.ts:240 ~ LedgerInternal ~ sign ~ error:",
          error
        );
      }
    } else {
      const trxSignature = await this.ledgerApp.signTransactionHash(
        stringifyPath(path),
        message //rawTxHex
      );

      return Buffer.from(trxSignature, "hex");
    }
  }

  async close(): Promise<void> {
    if (this.ledgerApp) {
      await this.ledgerApp.transport.close();
    }
  }

  async signTransactionBtc(
    path: string,
    amount: number,
    utxosData: Array<UTXO & { hex: string }>,
    toAddress: string,
    selectCrypto: string,
    changeAddress: string,
    feeAmount: number,
    message: string,
    transactionFee: number,
    keyPair: any
  ): Promise<string> {
    const { psbt, utxos } = await buildTx({
      recipient: toAddress,
      amount: amount,
      utxos: utxosData,
      sender: changeAddress,
      memo: message,
      selectedCrypto: selectCrypto,
      totalFee: feeAmount,
      transactionFee,
      keyPair,
      isLedger: true,
    });
    const addressType = getAddressTypeByAddress(
      changeAddress
    ) as AddressBtcType;

    const inputs: Array<[Transaction, number, string | null, number | null]> =
      utxos.map(({ hex, txid, vout }) => {
        if (!hex) {
          throw Error(`Missing 'txHex' for UTXO (txHash ${txid})`);
        }
        // const utxoTx = Bitcoin.Transaction.fromHex(txid);

        const splittedTx = this.ledgerApp.splitTransaction(
          hex,
          addressType === AddressBtcType.Bech32 /* no segwit support */
        );
        return [splittedTx, vout, null, null];
      });

    // const associatedKeysets: string[] = inputs.map((_) => path);
    const associatedKeysets = utxos.map((tx) => path);
    const newTxHex = psbt.data.globalMap.unsignedTx.toBuffer().toString("hex");
    const newTx: Transaction = this.ledgerApp.splitTransaction(newTxHex, true);
    const outputScriptHex = this.ledgerApp
      .serializeTransactionOutputs(newTx)
      .toString("hex");
    const extraData =
      addressType === AddressBtcType.Legacy
        ? {
            // no additionals - similar to https://github.com/shapeshift/hdwallet/blob/a61234eb83081a4de54750b8965b873b15803a03/packages/hdwallet-ledger/src/bitcoin.ts#L222
            additionals: [],
          }
        : {
            segwit: true,
            useTrustedInputForSegwit: true,
            additionals: ["bech32"],
          };
    const txHex = await this.ledgerApp.createPaymentTransactionNew({
      inputs,
      associatedKeysets,
      outputScriptHex,
      ...extraData,
    });

    return txHex;
  }
  static async isWebHIDSupported(): Promise<boolean> {
    return await TransportWebHID.isSupported();
  }
}
