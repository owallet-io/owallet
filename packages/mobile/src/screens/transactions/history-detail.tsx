import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";

import { OWEmpty } from "@src/components/empty";
import { useStore } from "@src/stores";
import { ChainIdEnum } from "@owallet/common";
import { EvmDetailTx } from "@src/screens/transactions/evm/evm-detail-tx-screen";
import { BtcDetailTx } from "@src/screens/transactions/btc/btc-detail-tx-screen";
import { OasisDetailTx } from "@src/screens/transactions/oasis/oasis-detail-tx-screen";
import { TronDetailTx } from "@src/screens/transactions/tron/tron-detail-tx-screen";
import { OraichainDetailTx } from "@src/screens/transactions/oraichain/oraichain-detail-tx-screen";

const mappingChainIdToHistoryDetail = (network: ChainIdEnum) => {
  switch (network) {
    case ChainIdEnum.Bitcoin:
      return <BtcDetailTx />;
    case ChainIdEnum.Oasis:
    case ChainIdEnum.OasisSapphire:
    case ChainIdEnum.OasisEmerald:
      return <OasisDetailTx />;
    case ChainIdEnum.TRON:
      return <TronDetailTx />;
    case ChainIdEnum.Ethereum:
    case ChainIdEnum.BNBChain:
      return <EvmDetailTx />;
    case ChainIdEnum.Oraichain:
      return <OraichainDetailTx />;
    default:
      return <OWEmpty />;
  }
};
export const HistoryDetail: FunctionComponent = observer((props) => {
  const { chainStore } = useStore();
  const { chainId } = chainStore.current;
  return <>{mappingChainIdToHistoryDetail(chainId as ChainIdEnum)}</>;
});
