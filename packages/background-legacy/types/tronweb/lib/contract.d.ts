export default class Contract {
  constructor(tronWeb?: boolean, abi?: any[], address?: boolean);
  tronWeb: true;
  injectPromise: any;
  address: boolean;
  abi: any[];
  eventListener: boolean;
  bytecode: boolean;
  deployed: boolean;
  lastBlock: boolean;
  methods: {};
  methodInstances: {};
  props: any[];
  _getEvents(options?: {}): Promise<any>;
  _startEventListener(options: {}, callback: any): Promise<void>;
  eventCallback: any;
  _stopEventListener(): void;
  hasProperty(property: any): any;
  loadAbi(abi: any): void;
  decodeInput(data: any): {
    name: any;
    params: any;
  };
  new(options: any, privateKey?: any, callback?: boolean): Promise<any>;
  at(contractAddress: any, callback?: boolean): Promise<any>;
  events(
    options?: {},
    callback?: boolean
  ): {
    start(startCallback?: boolean): any;
    stop(): void;
  };
}
