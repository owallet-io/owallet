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

export const HistoryDetail: FunctionComponent = observer((props) => {
  const { chainStore } = useStore();
  const { chainId } = chainStore.current;
  if (chainId === ChainIdEnum.BNBChain || chainId === ChainIdEnum.Ethereum)
    return <EvmDetailTx />;
  if (chainId === ChainIdEnum.Bitcoin) return <BtcDetailTx />;
  if (chainId === ChainIdEnum.TRON) return <TronDetailTx />;
  if (chainId === ChainIdEnum.Oraichain) return <OraichainDetailTx />;
  if (
    chainId === ChainIdEnum.Oasis ||
    chainId === ChainIdEnum.OasisSapphire ||
    chainId === ChainIdEnum.OasisEmerald
  )
    return <OasisDetailTx />;
  return <OWEmpty />;
});
