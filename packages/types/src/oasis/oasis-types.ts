import * as oasis from "@oasisprotocol/client";
import * as oasisRT from "@oasisprotocol/client-rt";

type OasisClient = oasis.client.NodeInternal;
export class WalletError extends Error {
  constructor(
    public readonly type: WalletErrors,
    message: string,
    public readonly originalError?: Error
  ) {
    super(message);
  }
}

export enum WalletErrors {
  UnknownError = "unknown",
  UnknownGrpcError = "unknown_grpc",
  InvalidAddress = "invalid_address",
  InvalidPrivateKey = "invalid_private_key",
  InsufficientBalance = "insufficient_balance",
  CannotSendToSelf = "cannot_send_to_self",
  InvalidNonce = "invalid_nonce",
  DuplicateTransaction = "duplicate_transaction",
  NoOpenWallet = "no_open_wallet",
  USBTransportError = "usb_transport_error",
  USBTransportNotSupported = "usb_transport_not_supported",
  BluetoothTransportNotSupported = "bluetooth_transport_not_supported",
  LedgerUnknownError = "unknown_ledger_error",
  LedgerCannotOpenOasisApp = "cannot_open_oasis_app",
  LedgerOasisAppIsNotOpen = "oasis_app_is_not_open",
  LedgerNoDeviceSelected = "no_device_selected",
  LedgerTransactionRejected = "transaction_rejected",
  LedgerAppVersionNotSupported = "ledger_version_not_supported",
  LedgerDerivedDifferentAccount = "ledger_derived_different_account",
  IndexerAPIError = "indexer_api_error",
  DisconnectedError = "disconnected_error",
  ParaTimesUnknownError = "para_times_unknown_error",
}

/** Transaction Wrapper */
export type TW<T> = oasis.consensus.TransactionWrapper<T>;

/** Runtime Transaction Wrapper */
type RTW<T> = oasisRT.wrapper.TransactionWrapper<T, void>;

export interface ListOasisScan {
  code: number;
  message: string;
  data: DataOasisScan;
}

export interface DataOasisScan {
  list: ItemOasisScan[];
  page: number;
  size: number;
  maxPage: number;
  totalSize: number;
}

export interface ItemOasisScan {
  txHash: string;
  height: number;
  method: string;
  fee: string;
  amount: string;
  shares: string;
  add: boolean;
  timestamp: number;
  time: number;
  status: boolean;
  from: string;
  to: string;
}
