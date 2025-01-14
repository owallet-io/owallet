import { ChainGetter } from "@owallet/stores";
import {
  AppCurrency,
  EthTxReceipt,
  // ItemSvmScan,
  OWallet,
  TransactionType,
} from "@owallet/types";
import { action, flow, makeObservable, observable } from "mobx";
import { AccountSvmSharedContext } from "./context";
import {
  _getPriorityFeeSolana,
  API,
  DenomHelper,
  Network,
  retry,
  urlTxHistory,
} from "@owallet/common";
import { simpleFetch } from "@owallet/simple-fetch";
import {
  createAssociatedTokenAccountInstruction,
  createTransferCheckedInstruction,
  createTransferInstruction,
  getAssociatedTokenAddress,
  TOKEN_2022_PROGRAM_ID,
} from "@solana/spl-token";
import {
  clusterApiUrl,
  ComputeBudgetProgram,
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import { encode, decode } from "bs58";
import { confirmTransaction } from "@owallet/provider";
import { Dec } from "@owallet/unit";
import { createMemoInstruction } from "@solana/spl-memo";

// import { ListSvmScan } from "@owallet/types";

export interface UnsignedSvmTransaction {
  amount: string;
  to: string;
  coinMinimalDenom: string;
  chainId: string;
}

export class SvmAccountBase {
  @observable
  protected _isSendingTx: boolean = false;
  @observable
  protected _name: string = "";

  @observable
  protected _bech32Address: string = "";
  @observable
  protected _base58Address: string = "";
  @observable
  protected _ethereumHexAddress: string = "";
  @observable
  protected _isNanoLedger: boolean = false;
  @observable
  protected _isKeystone: boolean = false;
  protected _pubKey: Uint8Array;

  constructor(
    protected readonly eventListener: {
      addEventListener: (type: string, fn: () => unknown) => void;
      removeEventListener: (type: string, fn: () => unknown) => void;
    },
    protected readonly chainGetter: ChainGetter,
    protected readonly chainId: string,
    protected readonly sharedContext: AccountSvmSharedContext,
    protected readonly getOWallet: () => Promise<OWallet | undefined>
  ) {
    makeObservable(this);
    this._pubKey = new Uint8Array();
    this.init();
  }

  @action
  setIsSendingTx(value: boolean) {
    this._isSendingTx = value;
  }

  get name(): string {
    return this._name;
  }

  get bech32Address(): string {
    return this._bech32Address;
  }

  get pubKey(): Uint8Array {
    return this._pubKey.slice();
  }

  protected hasInited = false;

  get isNanoLedger(): boolean {
    return this._isNanoLedger;
  }

  private readonly handleInit = () => this.init();

  @flow
  public *init() {
    if (!this.hasInited) {
      // If key store in the owallet extension is changed, this event will be dispatched.
      this.eventListener.addEventListener(
        "keplr_keystorechange",
        this.handleInit
      );
    }
    this.hasInited = true;
    yield this.sharedContext.getKey(this.chainId, (res) => {
      if (res.status === "fulfilled") {
        const key = res.value;
        this._bech32Address = key.bech32Address;
        this._base58Address = key.base58Address;
        this._ethereumHexAddress = key.ethereumHexAddress;
        this._isNanoLedger = key.isNanoLedger;
        this._isKeystone = key.isKeystone;
        this._name = key.name;
        this._pubKey = key.pubKey;
      } else {
        // Caught error loading key
        // Reset properties, and set status to Rejected
        this._bech32Address = "";
        this._base58Address = "";
        this._ethereumHexAddress = "";
        this._isNanoLedger = false;
        this._isKeystone = false;
        this._name = "";
        this._pubKey = new Uint8Array(0);
      }
    });
  }

  get addressDisplay(): string {
    return this._base58Address;
  }

  get base58Address(): string {
    return this._base58Address;
  }

  @action
  public disconnect(): void {
    this.hasInited = false;
    this.eventListener.removeEventListener(
      "keplr_keystorechange",
      this.handleInit
    );
    this._bech32Address = "";
    this._base58Address = "";
    this._ethereumHexAddress = "";
    this._isNanoLedger = false;
    this._isKeystone = false;
    this._name = "";
    this._pubKey = new Uint8Array(0);
  }

  get isSendingTx(): boolean {
    return this._isSendingTx;
  }

  async makeSendTokenTx({
    currency,
    amount,
    to,
    memo,
  }: {
    currency: AppCurrency;
    amount: string;
    to: string;
    memo: string;
  }): Promise<Transaction> {
    const chainInfo = this.chainGetter.getChain(this.chainId);
    const isSvm = chainInfo.features.includes("svm");
    if (!isSvm) {
      throw new Error("No Svm chain info provided");
    }
    const denomHelper = new DenomHelper(currency.coinMinimalDenom);
    const connection = new Connection(chainInfo.rpc, "confirmed");

    const recipientPublicKey = new PublicKey(to);
    const senderPublicKey = new PublicKey(this.base58Address);

    let transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: senderPublicKey,
        toPubkey: recipientPublicKey,
        lamports: BigInt(amount),
      })
    );
    if (denomHelper.type.includes("spl")) {
      const isToken2020 = denomHelper.type.includes("spl20");
      const tokenMintAddress = new PublicKey(denomHelper.contractAddress);
      const senderTokenAccount = await getAssociatedTokenAddress(
        tokenMintAddress, // Token mint
        senderPublicKey, // Owner of the sender account
        isToken2020 ? true : undefined, // Allow Token2022
        isToken2020 ? TOKEN_2022_PROGRAM_ID : undefined // Token2022 Program ID
      );

      const recipientTokenAccount = await getAssociatedTokenAddress(
        tokenMintAddress, // Token mint
        recipientPublicKey, // Owner of the recipient account
        isToken2020 ? true : undefined, // Allow Token2022
        isToken2020 ? TOKEN_2022_PROGRAM_ID : undefined // Token2022 Program ID
      );
      transaction = new Transaction(); // Check if sender's token account exists (not usually required since sender owns the token)
      const senderAccountInfo = await connection.getAccountInfo(
        senderTokenAccount
      );
      if (!senderAccountInfo) {
        transaction.add(
          createAssociatedTokenAccountInstruction(
            senderPublicKey, // Payer
            senderTokenAccount, // Associated token account to create
            senderPublicKey, // Owner of the account
            tokenMintAddress, // Token mint
            isToken2020 ? TOKEN_2022_PROGRAM_ID : undefined // Token2022 Program ID
          )
        );
      }

      // Check if recipient's token account exists
      const recipientAccountInfo = await connection.getAccountInfo(
        recipientTokenAccount
      );
      if (!recipientAccountInfo) {
        transaction.add(
          createAssociatedTokenAccountInstruction(
            senderPublicKey, // Payer
            recipientTokenAccount, // Associated token account to create
            recipientPublicKey, // Owner of the account
            tokenMintAddress, // Token mint
            isToken2020 ? TOKEN_2022_PROGRAM_ID : undefined // Token2022 Program ID
          )
        );
      }
      transaction.add(
        createTransferCheckedInstruction(
          senderTokenAccount, // Source token account
          tokenMintAddress,
          recipientTokenAccount, // Destination token account
          senderPublicKey, // Owner of the source account
          BigInt(amount), // Amount to transfer
          currency.coinDecimals,
          undefined, // Multi-signers (if any)
          isToken2020 ? TOKEN_2022_PROGRAM_ID : undefined // Token2022 Program ID
        )
      );
    }
    if (memo) {
      transaction.add(createMemoInstruction(memo));
    }
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = senderPublicKey;
    const message = transaction.compileMessage();
    const feeInLamports = await connection.getFeeForMessage(message);
    if (feeInLamports === null) {
      throw new Error("Unable to estimate the fee");
    }
    // const txStr = encode(
    //   transaction.serialize({requireAllSignatures:true})
    // );
    // const dynamicMicroLamports = await _getPriorityFeeSolana(txStr);
    const simulationResult = await connection.simulateTransaction(transaction);
    if (!simulationResult.value.unitsConsumed)
      throw new Error("Unable to estimate the fee");
    const DefaultUnitLimit = new Dec(200_000);
    const unitsConsumed = new Dec(simulationResult.value.unitsConsumed);
    const units = unitsConsumed.lte(DefaultUnitLimit)
      ? DefaultUnitLimit
      : unitsConsumed.mul(new Dec(1.2)); // Request up to 1,000,000 compute units
    const microLamports = new Dec(50000);

    transaction.add(
      // Request a specific number of compute units
      ComputeBudgetProgram.setComputeUnitLimit({
        units: Number(units.roundUp().toString()),
      }),
      // Attach a priority fee (in lamports)
      ComputeBudgetProgram.setComputeUnitPrice({
        microLamports: Number(microLamports.roundUp().toString()), // Set priority fee per compute unit in micro-lamports
      })
    );
    return transaction;
  }

  async sendTx(
    sender: string,
    unsignedTx: Transaction,
    onTxEvents?: {
      onBroadcastFailed?: (e?: Error) => void;
      onBroadcasted?: (txHash: string) => void;
      onFulfill?: (txReceipt: any) => void;
    }
  ) {
    try {
      console.log(this.chainId, "this.chainId");
      const chainInfo = this.chainGetter.getChain(this.chainId);
      if (!this.chainId.startsWith("solana")) {
        throw new Error("No Svm info provided");
      }
      const connection = new Connection(chainInfo.rpc, "confirmed");
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const owallet = (await this.getOWallet())!;
      const result = await owallet.solana.signTransaction({
        //@ts-ignore
        tx: unsignedTx,
        publicKey: new PublicKey(sender),
      });
      //@ts-ignore
      const signedTx = VersionedTransaction.deserialize(
        //@ts-ignore
        decode(result.signedTx)
      ) as Transaction;
      console.log(signedTx, "signedTx");
      const serializedTransaction = signedTx.serialize();

      const signature = await connection.sendRawTransaction(
        serializedTransaction,
        {
          preflightCommitment: "confirmed",
        }
      );
      if (!signature) {
        throw new Error("No tx hash responded");
      }

      if (onTxEvents?.onBroadcasted) {
        onTxEvents.onBroadcasted(signature);
      }
      await confirmTransaction(connection, signature, "confirmed");

      return signature;
    } catch (e) {
      if (onTxEvents?.onBroadcastFailed) {
        onTxEvents.onBroadcastFailed(e);
      }

      throw e;
    }
  }
}
