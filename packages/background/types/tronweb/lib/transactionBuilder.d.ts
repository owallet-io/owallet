export default class TransactionBuilder {
  constructor(tronWeb?: boolean);
  tronWeb: true;
  injectPromise: any;
  validator: any;
  sendTrx(
    to: string,
    amount: any,
    from: any,
    options?: any,
    callback?: boolean
  ): any;
  sendToken(
    to: boolean,
    amount: any,
    tokenID: boolean,
    from: any,
    options: any,
    callback?: boolean
  ): any;
  purchaseToken(
    issuerAddress: boolean,
    tokenID: boolean,
    amount: number,
    buyer: any,
    options: any,
    callback?: boolean
  ): any;
  freezeBalance(
    amount: number,
    duration: number,
    resource: string,
    address: any,
    receiverAddress: any,
    options: any,
    callback?: boolean
  ): any;
  unfreezeBalance(
    resource: string,
    address: any,
    receiverAddress: any,
    options: any,
    callback?: boolean
  ): any;
  freezeBalanceV2(
    amount: number,
    resource: string,
    address: any,
    options: any,
    callback?: boolean
  ): any;
  unfreezeBalanceV2(
    amount: number,
    resource: string,
    address: any,
    options: any,
    callback?: boolean
  ): any;
  delegateResource(
    amount: number,
    receiverAddress: any,
    resource: string,
    address: any,
    lock: boolean,
    options: any,
    callback?: boolean
  ): any;
  undelegateResource(
    amount: number,
    receiverAddress: any,
    resource: string,
    address: any,
    options: any,
    callback?: boolean
  ): any;
  withdrawExpireUnfreeze(address: any, options: any, callback?: boolean): any;
  withdrawBlockRewards(address: any, options: any, callback?: boolean): any;
  applyForSR(address: any, url: boolean, options: any, callback?: boolean): any;
  vote(votes: {}, voterAddress: any, options: any, callback?: boolean): any;
  createSmartContract(
    options?: {},
    issuerAddress?: any,
    callback?: boolean
  ): any;
  triggerSmartContract(...params: any[]): any;
  triggerConstantContract(...params: any[]): any;
  triggerConfirmedConstantContract(...params: any[]): any;
  estimateEnergy(...params: any[]): any;
  _triggerSmartContract(
    contractAddress: any,
    functionSelector: any,
    options?: {},
    parameters?: any[],
    issuerAddress?: any,
    callback?: boolean
  ): any;
  clearABI(contractAddress: any, ownerAddress?: any, callback?: boolean): any;
  updateBrokerage(brokerage: any, ownerAddress?: any, callback?: boolean): any;
  createToken(options?: {}, issuerAddress?: any, callback?: boolean): any;
  createAccount(
    accountAddress: any,
    address: any,
    options: any,
    callback?: boolean
  ): any;
  updateAccount(
    accountName: boolean,
    address: any,
    options: any,
    callback?: boolean
  ): any;
  setAccountId(accountId: any, address?: any, callback?: boolean): any;
  updateToken(options?: {}, issuerAddress?: any, callback?: boolean): any;
  sendAsset(...args: any[]): any;
  purchaseAsset(...args: any[]): any;
  createAsset(...args: any[]): any;
  updateAsset(...args: any[]): any;
  /**
   * Creates a proposal to modify the network.
   * Can only be created by a current Super Representative.
   */
  createProposal(
    parameters: boolean,
    issuerAddress: any,
    options: any,
    callback?: boolean
  ): any;
  /**
   * Deletes a network modification proposal that the owner issued.
   * Only current Super Representative can vote on a proposal.
   */
  deleteProposal(
    proposalID: boolean,
    issuerAddress: any,
    options: any,
    callback?: boolean
  ): any;
  /**
   * Adds a vote to an issued network modification proposal.
   * Only current Super Representative can vote on a proposal.
   */
  voteProposal(
    proposalID: boolean,
    isApproval: boolean,
    voterAddress: any,
    options: any,
    callback?: boolean
  ): any;
  /**
   * Create an exchange between a token and TRX.
   * Token Name should be a CASE SENSITIVE string.
   * PLEASE VERIFY THIS ON TRONSCAN.
   */
  createTRXExchange(
    tokenName: any,
    tokenBalance: any,
    trxBalance: any,
    ownerAddress: any,
    options: any,
    callback?: boolean
  ): any;
  /**
   * Create an exchange between a token and another token.
   * DO NOT USE THIS FOR TRX.
   * Token Names should be a CASE SENSITIVE string.
   * PLEASE VERIFY THIS ON TRONSCAN.
   */
  createTokenExchange(
    firstTokenName: any,
    firstTokenBalance: any,
    secondTokenName: any,
    secondTokenBalance: any,
    ownerAddress: any,
    options: any,
    callback?: boolean
  ): any;
  /**
   * Adds tokens into a bancor style exchange.
   * Will add both tokens at market rate.
   * Use "_" for the constant value for TRX.
   */
  injectExchangeTokens(
    exchangeID: boolean,
    tokenName: boolean,
    tokenAmount: number,
    ownerAddress: any,
    options: any,
    callback?: boolean
  ): any;
  /**
   * Withdraws tokens from a bancor style exchange.
   * Will withdraw at market rate both tokens.
   * Use "_" for the constant value for TRX.
   */
  withdrawExchangeTokens(
    exchangeID: boolean,
    tokenName: boolean,
    tokenAmount: number,
    ownerAddress: any,
    options: any,
    callback?: boolean
  ): any;
  /**
   * Trade tokens on a bancor style exchange.
   * Expected value is a validation and used to cap the total amt of token 2 spent.
   * Use "_" for the constant value for TRX.
   */
  tradeExchangeTokens(
    exchangeID: boolean,
    tokenName: boolean,
    tokenAmountSold: number,
    tokenAmountExpected: number,
    ownerAddress: any,
    options: any,
    callback?: boolean
  ): any;
  /**
   * Update userFeePercentage.
   */
  updateSetting(
    contractAddress: boolean,
    userFeePercentage: boolean,
    ownerAddress: any,
    options: any,
    callback?: boolean
  ): any;
  /**
   * Update energy limit.
   */
  updateEnergyLimit(
    contractAddress: boolean,
    originEnergyLimit: boolean,
    ownerAddress: any,
    options: any,
    callback?: boolean
  ): any;
  checkPermissions(permissions: any, type: any): boolean;
  updateAccountPermissions(
    ownerAddress?: any,
    ownerPermissions?: boolean,
    witnessPermissions?: boolean,
    activesPermissions?: boolean,
    callback?: boolean
  ): any;
  newTxID(transaction: any, callback: any): Promise<any>;
  alterTransaction(
    transaction: any,
    options?: {},
    callback?: boolean
  ): Promise<any>;
  extendExpiration(
    transaction: any,
    extension: any,
    callback?: boolean
  ): Promise<any>;
  addUpdateData(
    transaction: any,
    data: any,
    dataFormat?: string,
    callback?: boolean
  ): Promise<any>;
}
