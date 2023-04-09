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
}
