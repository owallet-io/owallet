export type StringifiedBigInt = string & PreserveAliasName;
// eslint-disable-next-line @typescript-eslint/ban-types
type PreserveAliasName = String;

export enum TransactionType {
  StakingTransfer = "staking.Transfer",
  StakingAddEscrow = "staking.AddEscrow",
  StakingReclaimEscrow = "staking.ReclaimEscrow",
  StakingAmendCommissionSchedule = "staking.AmendCommissionSchedule",
  StakingAllow = "staking.Allow",
  StakingWithdraw = "staking.Withdraw",
  StakingBurn = "staking.Burn",
  RoothashExecutorCommit = "roothash.ExecutorCommit",
  RoothashExecutorProposerTimeout = "roothash.ExecutorProposerTimeout",
  RoothashSubmitMsg = "roothash.SubmitMsg",
  RegistryDeregisterEntity = "registry.DeregisterEntity",
  RegistryRegisterEntity = "registry.RegisterEntity",
  RegistryRegisterNode = "registry.RegisterNode",
  RegistryRegisterRuntime = "registry.RegisterRuntime",
  RegistryUnfreezeNode = "registry.UnfreezeNode",
  GovernanceCastVote = "governance.CastVote",
  GovernanceSubmitProposal = "governance.SubmitProposal",
  BeaconPvssCommit = "beacon.PVSSCommit",
  BeaconPvssReveal = "beacon.PVSSReveal",
  BeaconVrfProve = "beacon.VRFProve",
  ConsensusMeta = "consensus.Meta",
  VaultCreate = "vault.Create",

  // ParaTime
  ConsensusDeposit = "consensus.Deposit",
  ConsensusWithdraw = "consensus.Withdraw",
  ConsensusAccountsParameters = "consensus.Parameters",
  ConsensusBalance = "consensus.Balance",
  ConsensusAccount = "consensus.Account",
}

export enum TransactionStatus {
  Failed,
  Successful,
  Pending,
}

export interface Transaction {
  amount: StringifiedBigInt | undefined;
  fee: StringifiedBigInt | undefined;
  from: string | undefined;
  hash: string;
  level: number | undefined;
  status: TransactionStatus | undefined;
  timestamp: number | undefined;
  to: string | undefined;
  type: TransactionType;
  nonce: StringifiedBigInt | undefined;
  // These are undefined on consensus transaction
  // Only appear on ParaTime transaction
  runtimeName: string | undefined;
  runtimeId: string | undefined;
  round: number | undefined;
}

export type NewTransactionType = "transfer" | "addEscrow" | "reclaimEscrow";
export type TransactionPayload =
  | TransferPayload
  | AddEscrowPayload
  | ReclaimEscrowPayload;

export interface TransactionPreview {
  transaction: TransactionPayload;
  fee?: StringifiedBigInt;
  gas?: StringifiedBigInt;
}

/**
 * Flow for a transaction to be sent.
 */
export enum TransactionStep {
  Building = "building",
  Preview = "preview",
  Signing = "signing",
  Submitting = "submitting",
  Sent = "sent",
}

export interface TransferPayload {
  type: "transfer";

  /* bech32 Address */
  to: string;

  /* Token amount */
  amount: StringifiedBigInt;
}

export interface AddEscrowPayload {
  type: "addEscrow";

  /* bech32 Address */
  validator: string;

  /* Token amount */
  amount: StringifiedBigInt;
}

export interface ReclaimEscrowPayload {
  type: "reclaimEscrow";

  /* bech32 Address */
  validator: string;

  /* Shares to be reclaimed */
  shares: StringifiedBigInt;

  /* Displayed token equivalent */
  amount: StringifiedBigInt;
}
