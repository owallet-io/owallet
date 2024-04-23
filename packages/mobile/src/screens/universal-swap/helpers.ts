import { TypeTextAndCustomizeComponent } from "./types";
import {
  Networks,
  BSC_SCAN,
  ETHEREUM_SCAN,
  TRON_SCAN,
  KWT_SCAN,
  network,
  NetworkChainId,
} from "@oraichain/oraidex-common";
import { showToast } from "@src/utils/helper";

export const checkFnComponent = (
  titleRight: TypeTextAndCustomizeComponent,
  Element: React.ReactNode
) => {
  if (!!titleRight) {
    if (typeof titleRight === "string") {
      return Element;
    } else if (typeof titleRight === "function") {
      return titleRight();
    }
    return titleRight;
  }
  return null;
};

export const floatToPercent = (value: number): number => {
  return Number(value) * 100;
};

export const handleErrorSwap = (message: string) => {
  let formatedMessage = message;
  if (message.includes("of undefined")) {
    formatedMessage = "Transaction Rejected!";
  }
  showToast({
    message: formatedMessage,
    type: "danger",
  });
};

export const getTransactionUrl = (
  chainId: NetworkChainId | string,
  transactionHash: string
) => {
  switch (Number(chainId)) {
    case Networks.bsc:
      return `${BSC_SCAN}/tx/${transactionHash}`;
    case Networks.mainnet:
      return `${ETHEREUM_SCAN}/tx/${transactionHash}`;
    case Networks.tron:
      return `${TRON_SCAN}/#/transaction/${transactionHash.replace(/^0x/, "")}`;
    default:
      // raw string
      switch (chainId) {
        case "kawaii_6886-1":
          return `${KWT_SCAN}/tx/${transactionHash}`;
        case "Oraichain":
          return `${network.explorer}/txs/${transactionHash}`;
      }
      return null;
  }
};
