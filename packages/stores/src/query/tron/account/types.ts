// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Delegated {}

export interface Representative {
  lastWithDrawTime: number;
  allowance: number;
  enabled: boolean;
  url: string;
}

export interface Frozen {
  total: number;
  balances: any[];
}

export interface WithPriceToken {
  amount: string;
  tokenPriceInTrx: number;
  tokenId: string;
  balance: string;
  tokenName: string;
  tokenDecimal: number;
  tokenAbbr: string;
  tokenCanShow: number;
  tokenType: string;
  vip: boolean;
  tokenLogo: string;
}

export interface Bandwidth {
  energyRemaining: number;
  totalEnergyLimit: number;
  totalEnergyWeight: number;
  netUsed: number;
  storageLimit: number;
  storagePercentage: number;
  assets: Assets;
  netPercentage: number;
  storageUsed: number;
  storageRemaining: number;
  freeNetLimit: number;
  energyUsed: number;
  freeNetRemaining: number;
  netLimit: number;
  netRemaining: number;
  energyLimit: number;
  freeNetUsed: number;
  totalNetWeight: number;
  freeNetPercentage: number;
  energyPercentage: number;
  totalNetLimit: number;
}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Assets {}

export interface AccountResource {
  frozen_balance_for_energy: FrozenBalanceForEnergy;
}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface FrozenBalanceForEnergy {}
export interface AuthAccountTron {
  totalFrozenV2: number;
  transactions_out: number;
  frozenForEnergyV2: number;
  rewardNum: number;
  delegatedFrozenV2BalanceForBandwidth: number;
  redTag: string;
  delegateFrozenForEnergy: number;
  balance: number;
  frozenForBandWidthV2: number;
  canWithdrawAmountV2: number;
  delegated: Delegated;
  transactions_in: number;
  totalTransactionCount: number;
  representative: Representative;
  announcement: string;
  allowExchange: any[];
  accountType: number;
  exchanges: any[];
  frozen: Frozen;
  transactions: number;
  delegatedFrozenV2BalanceForEnergy: number;
  name: string;
  frozenForEnergy: number;
  energyCost: number;
  activePermissions: any[];
  acquiredDelegatedFrozenV2BalanceForBandwidth: number;
  netCost: number;
  acquiredDelegateFrozenForBandWidth: number;
  greyTag: string;
  publicTag: string;
  withPriceTokens: WithPriceToken[];
  unfreezeV2: number;
  feedbackRisk: boolean;
  voteTotal: number;
  totalFrozen: number;
  latest_operation_time: number;
  frozenForBandWidth: number;
  reward: number;
  addressTagLogo: string;
  address: string;
  frozen_supply: any[];
  bandwidth: Bandwidth;
  date_created: number;
  acquiredDelegatedFrozenV2BalanceForEnergy: number;
  accountResource: AccountResource;
  blueTag: string;
  witness: number;
  freezing: number;
  delegateFrozenForBandWidth: number;
  activated: boolean;
  acquiredDelegateFrozenForEnergy: number;
}
