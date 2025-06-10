import { AppCurrency } from "@owallet/types";

export interface RecentSendHistory {
  timestamp: number;
  sender: string;
  recipient: string;
  amount: {
    amount: string;
    denom: string;
  }[];
  memo: string;

  ibcChannels:
    | {
        portId: string;
        channelId: string;
        counterpartyChainId: string;
      }[]
    | undefined;
}

export type IBCHistory = {
  id: string;
  chainId: string;
  destinationChainId: string;
  timestamp: number;
  sender: string;

  amount: {
    amount: string;
    denom: string;
  }[];
  memo: string;

  txHash: string;

  txFulfilled?: boolean;
  txError?: string;
  packetTimeout?: boolean;

  ibcHistory:
    | {
        portId: string;
        channelId: string;
        counterpartyChainId: string;

        sequence?: string;
        // The channel id above is the src channel id
        // This is the dst channel id
        // It's added from events each time tracking is completed.
        dstChannelId?: string;

        completed: boolean;
        error?: string;
        rewound?: boolean;
        // Since rewinding is not possible after a swap,
        // this value may be true in swap operations
        rewoundButNextRewindingBlocked?: boolean;
      }[];

  // Already notified to user
  notified?: boolean;
  notificationInfo?: {
    currencies: AppCurrency[];
  };
} & (IBCTransferHistory | IBCSwapHistory);

export interface IBCTransferHistory {
  recipient: string;
}

export interface IBCSwapHistory {
  swapType: "amount-in" | "amount-out";
  swapChannelIndex: number;
  swapReceiver: string[];

  destinationAsset: {
    chainId: string;
    denom: string;
  };

  resAmount: {
    amount: string;
    denom: string;
  }[][];

  swapRefundInfo?: {
    chainId: string;
    amount: {
      amount: string;
      denom: string;
    }[];
  };
}
