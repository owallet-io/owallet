export default class Trx {
  static verifySignature(message: any, address: any, signature: any, useTronHeader?: boolean): boolean;
  static verifyMessageV2(message: any, signature: any): any;
  static verifyTypedData(domain: any, types: any, value: any, signature: any, address: any): boolean;
  static signString(message: any, privateKey: any, useTronHeader?: boolean): string;
  static signMessageV2(message: any, privateKey: any): any;
  static _signTypedData(domain: any, types: any, value: any, privateKey: any): any;
  constructor(tronWeb?: boolean);
  tronWeb: true;
  injectPromise: any;
  cache: {
    contracts: {};
  };
  validator: Validator;
  _parseToken(token: any): any;
  getCurrentBlock(callback?: boolean): any;
  getConfirmedCurrentBlock(callback?: boolean): any;
  getBlock(block?: any, callback?: boolean): any;
  getBlockByHash(blockHash: any, callback?: boolean): any;
  getBlockByNumber(blockID: any, callback?: boolean): any;
  getBlockTransactionCount(block?: any, callback?: boolean): any;
  getTransactionFromBlock(block: any, index: any, callback?: boolean): any;
  getTransaction(transactionID: any, callback?: boolean): any;
  getConfirmedTransaction(transactionID: any, callback?: boolean): any;
  getUnconfirmedTransactionInfo(transactionID: any, callback?: boolean): any;
  getTransactionInfo(transactionID: any, callback?: boolean): any;
  _getTransactionInfoById(transactionID: any, options: any, callback?: boolean): any;
  getTransactionsToAddress(address?: any, limit?: number, offset?: number, callback?: boolean): any;
  getTransactionsFromAddress(address?: any, limit?: number, offset?: number, callback?: boolean): any;
  getTransactionsRelated(address?: any, direction?: string, limit?: number, offset?: number, callback?: boolean): any;
  getAccount(address?: any, callback?: boolean): any;
  getAccountById(id?: boolean, callback?: boolean): any;
  getAccountInfoById(id: any, options: any, callback: any): void;
  getBalance(address?: any, callback?: boolean): any;
  getUnconfirmedAccount(address?: any, callback?: boolean): any;
  getUnconfirmedAccountById(id: any, callback?: boolean): any;
  getUnconfirmedBalance(address?: any, callback?: boolean): any;
  getBandwidth(address?: any, callback?: boolean): any;
  getTokensIssuedByAddress(address?: any, callback?: boolean): any;
  getTokenFromID(tokenID?: boolean, callback?: boolean): any;
  listNodes(callback?: boolean): any;
  getBlockRange(start?: number, end?: number, callback?: boolean): any;
  listSuperRepresentatives(callback?: boolean): any;
  listTokens(limit?: number, offset?: number, callback?: boolean): any;
  timeUntilNextVoteCycle(callback?: boolean): any;
  getContract(contractAddress: any, callback?: boolean): any;
  verifyMessage(
    message?: any,
    signature?: boolean,
    address?: any,
    useTronHeader?: boolean,
    callback?: boolean
  ): Promise<any>;
  verifyMessageV2(message?: any, signature?: boolean, options?: {}, callback?: boolean): any;
  verifyTypedData(domain: any, types: any, value: any, signature: any, address?: any, callback?: boolean): any;
  sign(
    transaction?: any,
    privateKey?: any,
    useTronHeader?: boolean,
    multisig?: boolean,
    callback?: boolean
  ): Promise<any>;
  /**
   * sign message v2 for verified header length
   *
   * @param {message to be signed, should be Bytes or string} message
   * @param {privateKey for signature} privateKey
   * @param {reserved} options
   * @param {callback function} callback
   */
  signMessageV2(message: any, privateKey?: any, options?: {}, callback?: boolean): any;
  _signTypedData(domain: any, types: any, value: any, privateKey?: any, callback?: boolean): any;
  multiSign(transaction?: any, privateKey?: any, permissionId?: boolean, callback?: boolean): Promise<any>;
  getApprovedList(transaction: any, callback?: boolean): Promise<any>;
  getSignWeight(transaction: any, permissionId: any, callback?: boolean): Promise<any>;
  sendRawTransaction(signedTransaction?: any, options?: {}, callback?: boolean): any;
  sendHexTransaction(signedHexTransaction?: any, options?: {}, callback?: boolean): any;
  sendTransaction(to?: any, amount?: boolean, options?: {}, callback?: boolean): Promise<any>;
  sendToken(to?: any, amount?: boolean, tokenID?: boolean, options?: {}, callback?: boolean): Promise<any>;
  /**
   * Freezes an amount of TRX.
   * Will give bandwidth OR Energy and TRON Power(voting rights)
   * to the owner of the frozen tokens.
   *
   * @param amount - is the number of frozen trx
   * @param duration - is the duration in days to be frozen
   * @param resource - is the type, must be either "ENERGY" or "BANDWIDTH"
   * @param options
   * @param callback
   */
  freezeBalance(
    amount?: number,
    duration?: number,
    resource?: string,
    options?: {},
    receiverAddress?: any,
    callback?: boolean
  ): Promise<any>;
  /**
   * Unfreeze TRX that has passed the minimum freeze duration.
   * Unfreezing will remove bandwidth and TRON Power.
   *
   * @param resource - is the type, must be either "ENERGY" or "BANDWIDTH"
   * @param options
   * @param callback
   */
  unfreezeBalance(resource?: string, options?: {}, receiverAddress?: any, callback?: boolean): Promise<any>;
  /**
   * Modify account name
   * Note: Username is allowed to edit only once.
   *
   * @param privateKey - Account private Key
   * @param accountName - name of the account
   * @param callback
   *
   * @return modified Transaction Object
   */
  updateAccount(accountName?: boolean, options?: {}, callback?: boolean): Promise<any>;
  signMessage(...args: any[]): Promise<any>;
  sendAsset(...args: any[]): Promise<any>;
  send(...args: any[]): Promise<any>;
  sendTrx(...args: any[]): Promise<any>;
  broadcast(...args: any[]): any;
  broadcastHex(...args: any[]): any;
  signTransaction(...args: any[]): Promise<any>;
  /**
   * Gets a network modification proposal by ID.
   */
  getProposal(proposalID?: boolean, callback?: boolean): any;
  /**
   * Lists all network modification proposals.
   */
  listProposals(callback?: boolean): any;
  /**
   * Lists all parameters available for network modification proposals.
   */
  getChainParameters(callback?: boolean): any;
  /**
   * Get the account resources
   */
  getAccountResources(address?: any, callback?: boolean): any;
  /**
   * Query the amount of resources of a specific resourceType delegated by fromAddress to toAddress
   */
  getDelegatedResourceV2(
    fromAddress?: any,
    toAddress?: any,
    options?: {
      confirmed: boolean;
    },
    callback?: boolean
  ): any;
  /**
   * Query the resource delegation index by an account
   */
  getDelegatedResourceAccountIndexV2(
    address?: any,
    options?: {
      confirmed: boolean;
    },
    callback?: boolean
  ): any;
  /**
   * Query the amount of delegatable resources of the specified resource Type for target address, unit is sun.
   */
  getCanDelegatedMaxSize(
    address?: any,
    resource?: string,
    options?: {
      confirmed: boolean;
    },
    callback?: boolean
  ): any;
  /**
   * Remaining times of available unstaking API
   */
  getAvailableUnfreezeCount(
    address?: any,
    options?: {
      confirmed: boolean;
    },
    callback?: boolean
  ): any;
  /**
   * Query the withdrawable balance at the specified timestamp
   */
  getCanWithdrawUnfreezeAmount(
    address?: any,
    timestamp?: number,
    options?: {
      confirmed: boolean;
    },
    callback?: boolean
  ): any;
  /**
   * Get the exchange ID.
   */
  getExchangeByID(exchangeID?: boolean, callback?: boolean): any;
  /**
   * Lists the exchanges
   */
  listExchanges(callback?: boolean): any;
  /**
   * Lists all network modification proposals.
   */
  listExchangesPaginated(limit?: number, offset?: number, callback?: boolean): any;
  /**
   * Get info about thre node
   */
  getNodeInfo(callback?: boolean): any;
  getTokenListByName(tokenID?: boolean, callback?: boolean): any;
  getTokenByID(tokenID?: boolean, callback?: boolean): any;
  getReward(address: any, options?: {}, callback?: boolean): Promise<any>;
  getUnconfirmedReward(address: any, options?: {}, callback?: boolean): Promise<any>;
  getBrokerage(address: any, options?: {}, callback?: boolean): Promise<any>;
  getUnconfirmedBrokerage(address: any, options?: {}, callback?: boolean): Promise<any>;
  _getReward(address: any, options: any, callback?: boolean): Promise<any>;
  _getBrokerage(address: any, options: any, callback?: boolean): Promise<any>;
}
import Validator from '../paramValidator';
