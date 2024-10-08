interface IDataTransaction {
  eventType?: string;
  amount?: string;
  denom?: string;
  countEvent?: number;
  hash?: string;
  timestamp?: string;
  isRecipient?: boolean;
  status?: "success" | "failed";
  isPlus?: boolean;
  isMinus?: boolean;
  recipient?: string;
  sender?: string;
  txHash?: string;
  dataEvents?: any[];
}
interface IOWTransactionItem {
  item?: ResTxsInfo;
  time?: string;
  onPress?: () => void;
}
type itemOptions = {
  title: string;
  showTabBar?: boolean;
};

type IScreenOption = {
  [key in string]: itemOptions;
};

declare var isCancel: boolean = false;
