import { ReactNode } from 'react';
import { TouchableOpacityProps } from 'react-native';

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
}
interface IOWTransactionItem extends TouchableOpacityProps {
  data?: any;
  time?: string;
}

declare var isCancel: boolean = false;
