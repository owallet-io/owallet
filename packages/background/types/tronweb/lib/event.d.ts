export default class Event {
    constructor(tronWeb?: boolean);
    tronWeb: true;
    injectPromise: any;
    setServer(eventServer?: boolean, healthcheck?: string): boolean;
    getEventsByContractAddress(contractAddress?: boolean, options?: {}, callback?: boolean): any;
    getEventsByTransactionID(transactionID?: boolean, options?: {}, callback?: boolean): any;
}
