import EventEmitter from "eventemitter3";
export class OwalletEvent {
  protected static eventListener = new EventEmitter();
  public static txHashEmit = (txHash: string, infoTx: any) =>
    OwalletEvent.eventListener.emit(txHash, infoTx);
  public static txHashListener = (txHash: string, callback: any) =>
    OwalletEvent.eventListener.addListener(txHash, callback);
}
