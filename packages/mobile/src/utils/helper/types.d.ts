
interface IDataTransaction {
  eventType?: string;
  amount?: string;
  denom?: string;
  countEvent?: number;
  hash?: string;
  timestamp?: string;
  isRecipient?: boolean;
  status?: 'success' | 'failed';
  isPlus?: boolean;
  isMinus?: boolean;
  recipient?: string;
  sender?: string;
  txHash?:string;
  dataEvents?:any[];
}
interface IOWTransactionItem {
  data?: any;
  time?: string;
}

declare var isCancel: boolean = false;
