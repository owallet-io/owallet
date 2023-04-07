interface IDataTransaction {
  eventType?: string;
  amount?: string;
  denom?: string;
  countEvent?:string;
  hash?:string;
  timestamp?:string;
  isRecipient?:boolean;
  status?:'success' | 'failed';
}
