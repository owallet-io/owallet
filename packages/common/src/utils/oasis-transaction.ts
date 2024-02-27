import * as oasis from '@oasisprotocol/client';
import * as oasisRT from '@oasisprotocol/client-rt';
import { ContextSigner, Signer } from '@oasisprotocol/client/dist/signature';
import { addressToPublicKey, shortPublicKey } from './oasis-helper';

type OasisClient = oasis.client.NodeInternal;
export class WalletError extends Error {
  constructor(public readonly type: WalletErrors, message: string, public readonly originalError?: Error) {
    super(message);
  }
}

export enum WalletErrors {
  UnknownError = 'unknown',
  UnknownGrpcError = 'unknown_grpc',
  InvalidAddress = 'invalid_address',
  InvalidPrivateKey = 'invalid_private_key',
  InsufficientBalance = 'insufficient_balance',
  CannotSendToSelf = 'cannot_send_to_self',
  InvalidNonce = 'invalid_nonce',
  DuplicateTransaction = 'duplicate_transaction',
  NoOpenWallet = 'no_open_wallet',
  USBTransportError = 'usb_transport_error',
  USBTransportNotSupported = 'usb_transport_not_supported',
  BluetoothTransportNotSupported = 'bluetooth_transport_not_supported',
  LedgerUnknownError = 'unknown_ledger_error',
  LedgerCannotOpenOasisApp = 'cannot_open_oasis_app',
  LedgerOasisAppIsNotOpen = 'oasis_app_is_not_open',
  LedgerNoDeviceSelected = 'no_device_selected',
  LedgerTransactionRejected = 'transaction_rejected',
  LedgerAppVersionNotSupported = 'ledger_version_not_supported',
  LedgerDerivedDifferentAccount = 'ledger_derived_different_account',
  IndexerAPIError = 'indexer_api_error',
  DisconnectedError = 'disconnected_error',
  ParaTimesUnknownError = 'para_times_unknown_error'
}

export const signerFromPrivateKey = (privateKey: Uint8Array) => {
  return oasis.signature.NaclSigner.fromSecret(privateKey, 'this key is not important');
};

export const signerFromEthPrivateKey = (ethPrivateKey: Uint8Array) => {
  return oasisRT.signatureSecp256k1.EllipticSigner.fromPrivate(ethPrivateKey, 'this key is not important');
};

/** Transaction Wrapper */
export type TW<T> = oasis.consensus.TransactionWrapper<T>;

/** Runtime Transaction Wrapper */
type RTW<T> = oasisRT.wrapper.TransactionWrapper<T, void>;

export class OasisTransaction {
  protected static genesis?: oasis.types.GenesisDocument;

  public static async buildReclaimEscrow(
    nic: OasisClient,
    signer: Signer,
    account: string,
    shares: bigint
  ): Promise<TW<oasis.types.StakingReclaimEscrow>> {
    const tw = oasis.staking.reclaimEscrowWrapper();
    const nonce = await OasisTransaction.getNonce(nic, signer);
    tw.setNonce(nonce);
    //@ts-ignore
    tw.setFeeAmount(oasis.quantity.fromBigInt(0n));
    tw.setBody({
      account: await addressToPublicKey(account),
      shares: oasis.quantity.fromBigInt(shares)
    });

    const gas = await tw.estimateGas(nic, signer.public());
    tw.setFeeGas(gas);

    return tw;
  }

  public static async buildAddEscrow(
    nic: OasisClient,
    signer: Signer,
    account: string,
    amount: bigint
  ): Promise<TW<oasis.types.StakingEscrow>> {
    const tw = oasis.staking.addEscrowWrapper();
    const nonce = await OasisTransaction.getNonce(nic, signer);
    tw.setNonce(nonce);
    //@ts-ignore
    tw.setFeeAmount(oasis.quantity.fromBigInt(0n));
    tw.setBody({
      account: await addressToPublicKey(account),
      amount: oasis.quantity.fromBigInt(amount)
    });

    const gas = await tw.estimateGas(nic, signer.public());
    tw.setFeeGas(gas);

    return tw;
  }

  public static async buildTransfer(
    nic: OasisClient,
    signer: Signer,
    to: string,
    amount: bigint
  ): Promise<TW<oasis.types.StakingTransfer>> {
    const tw = oasis.staking.transferWrapper();
    const nonce = await OasisTransaction.getNonce(nic, signer);
    tw.setNonce(nonce);
    //@ts-ignore
    tw.setFeeAmount(oasis.quantity.fromBigInt(0n));
    tw.setBody({
      to: await addressToPublicKey(to),
      amount: oasis.quantity.fromBigInt(amount)
    });

    console.log('tw', tw);

    const gas = await tw.estimateGas(nic, signer.public());
    tw.setFeeGas(gas);

    return tw;
  }

  public static async buildStakingAllowTransfer(
    nic: OasisClient,
    signer: Signer,
    to: string,
    amount: bigint
  ): Promise<TW<oasis.types.StakingAllow>> {
    const tw = oasis.staking.allowWrapper();
    const nonce = await OasisTransaction.getNonce(nic, signer);
    const beneficiary = await addressToPublicKey(to);

    tw.setNonce(nonce);
    //@ts-ignore
    tw.setFeeAmount(oasis.quantity.fromBigInt(0n));
    tw.setBody({
      beneficiary,
      negative: false,
      amount_change: oasis.quantity.fromBigInt(amount)
    });

    const gas = await tw.estimateGas(nic, signer.public());
    tw.setFeeGas(gas);

    return tw;
  }

  public static async signUsingLedger<T>(chainContext: string, signer: ContextSigner, tw: TW<T>): Promise<void> {
    await tw.sign(signer, chainContext);

    // @todo Upstream bug in oasis-app, the signature is larger than 64 bytes
    tw.signedTransaction.signature.signature = tw.signedTransaction.signature.signature.slice(0, 64);
  }

  public static async sign<T>(chainContext: string, signer: Signer, tw: TW<T>): Promise<void> {
    return tw.sign(new oasis.signature.BlindContextSigner(signer), chainContext);
  }

  public static async signParaTime<T>(chainContext: string, signer: Signer, tw: RTW<T>): Promise<void> {
    return tw.sign([new oasis.signature.BlindContextSigner(signer)], chainContext);
  }

  public static async submit<T>(nic: OasisClient, tw: TW<T> | RTW<T>): Promise<void> {
    try {
      await tw.submit(nic);
    } catch (e: any) {
      const grpcError = e?.cause?.metadata?.['grpc-message'] || e.message;

      if (!grpcError) {
        throw new WalletError(WalletErrors.UnknownError, grpcError, e);
      }

      switch (grpcError) {
        case 'transaction: invalid nonce':
          throw new WalletError(WalletErrors.InvalidNonce, 'Invalid nonce');
        case 'consensus: duplicate transaction':
          throw new WalletError(WalletErrors.DuplicateTransaction, 'Duplicate transaction');
        default:
          throw new WalletError(WalletErrors.UnknownGrpcError, grpcError, e);
      }
    }
  }

  protected static async getNonce(nic: OasisClient, signer: Signer): Promise<bigint> {
    const nonce = await nic.consensusGetSignerNonce({
      account_address: await shortPublicKey(signer.public()),
      height: 0
    });

    return BigInt(nonce || 0);
  }
}
