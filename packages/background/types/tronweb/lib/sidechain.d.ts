export default class SideChain {
    constructor(sideOptions: any, TronWeb?: boolean, mainchain?: boolean, privateKey?: boolean);
    mainchain: boolean;
    sidechain: any;
    isAddress: any;
    utils: any;
    injectPromise: any;
    validator: any;
    setMainGatewayAddress(mainGatewayAddress: any): void;
    mainGatewayAddress: any;
    setSideGatewayAddress(sideGatewayAddress: any): void;
    sideGatewayAddress: any;
    setChainId(sideChainId: any): void;
    chainId: any;
    signTransaction(priKeyBytes: any, transaction: any): any;
    multiSign(transaction?: boolean, privateKey?: any, permissionId?: boolean, callback?: boolean): Promise<any>;
    sign(transaction?: boolean, privateKey?: any, useTronHeader?: boolean, multisig?: boolean, callback?: boolean): Promise<any>;
    /**
    * deposit asset to sidechain
    */
    depositTrx(callValue: any, depositFee: any, feeLimit: any, options?: {}, privateKey?: any, callback?: boolean): Promise<any>;
    depositTrc10(tokenId: any, tokenValue: any, depositFee: any, feeLimit: any, options?: {}, privateKey?: any, callback?: boolean): Promise<any>;
    depositTrc(functionSelector: any, num: any, fee: any, feeLimit: any, contractAddress: any, options?: {}, privateKey?: any, callback?: boolean): Promise<any>;
    approveTrc20(num: any, feeLimit: any, contractAddress: any, options?: {}, privateKey?: any, callback?: boolean): Promise<any>;
    approveTrc721(id: any, feeLimit: any, contractAddress: any, options?: {}, privateKey?: any, callback?: boolean): Promise<any>;
    depositTrc20(num: any, depositFee: any, feeLimit: any, contractAddress: any, options?: {}, privateKey?: any, callback?: boolean): Promise<any>;
    depositTrc721(id: any, depositFee: any, feeLimit: any, contractAddress: any, options?: {}, privateKey?: any, callback?: boolean): Promise<any>;
    /**
     * mapping asset TRC20 or TRC721 to DAppChain
     */
    mappingTrc(trxHash: any, mappingFee: any, feeLimit: any, functionSelector: any, options: {}, privateKey: any, callback: any): Promise<any>;
    mappingTrc20(trxHash: any, mappingFee: any, feeLimit: any, options?: {}, privateKey?: any, callback?: boolean): Promise<any>;
    mappingTrc721(trxHash: any, mappingFee: any, feeLimit: any, options?: {}, privateKey?: any, callback?: boolean): Promise<any>;
    /**
     * withdraw trx from sidechain to mainchain
     */
    withdrawTrx(callValue: any, withdrawFee: any, feeLimit: any, options?: {}, privateKey?: any, callback?: boolean): Promise<any>;
    withdrawTrc10(tokenId: any, tokenValue: any, withdrawFee: any, feeLimit: any, options?: {}, privateKey?: any, callback?: boolean): Promise<any>;
    withdrawTrc(functionSelector: any, numOrId: any, withdrawFee: any, feeLimit: any, contractAddress: any, options?: {}, privateKey?: any, callback?: boolean): Promise<any>;
    withdrawTrc20(num: any, withdrawFee: any, feeLimit: any, contractAddress: any, options: any, privateKey?: any, callback?: boolean): Promise<any>;
    withdrawTrc721(id: any, withdrawFee: any, feeLimit: any, contractAddress: any, options: any, privateKey?: any, callback?: boolean): Promise<any>;
    injectFund(num: any, feeLimit: any, options: any, privateKey?: any, callback?: boolean): Promise<any>;
    retryWithdraw(nonce: any, retryWithdrawFee: any, feeLimit: any, options?: {}, privateKey?: any, callback?: boolean): Promise<any>;
    retryDeposit(nonce: any, retryDepositFee: any, feeLimit: any, options?: {}, privateKey?: any, callback?: boolean): Promise<any>;
    retryMapping(nonce: any, retryMappingFee: any, feeLimit: any, options?: {}, privateKey?: any, callback?: boolean): Promise<any>;
}
