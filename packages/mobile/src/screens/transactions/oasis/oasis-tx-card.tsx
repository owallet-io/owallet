import { useTheme } from "@src/themes/theme-provider";
import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useEffect, useState } from "react";
import { View, ViewStyle } from "react-native";

import { API } from "@src/common/api";
import { listSkeleton, SCREENS, urlTxHistory } from "@src/common/constants";
import { navigate } from "@src/router/root";

import { OWButton } from "@src/components/button";

import { TxSkeleton } from "@src/components/page";
import { MapChainIdToNetwork } from "@src/utils/helper";
import { useStore } from "@src/stores";
import { EmptyTx } from "@src/screens/transactions/components/empty-tx";
import { TxEvmItem } from "@src/screens/transactions/components/items/tx-evm-item";
import { TxOasisItem } from "@src/screens/transactions/components/items/tx-oasis-item";

export const OasisTxCard: FunctionComponent<{
  containerStyle?: ViewStyle;
}> = observer(({ containerStyle }) => {
  const { accountStore, appInitStore, chainStore, priceStore, keyRingStore } =
    useStore();
  const { colors } = useTheme();

  const [histories, setHistories] = useState([]);
  const [loading, setLoading] = useState(false);

  const accountInfo = accountStore.getAccount(chainStore.current.chainId);
  const address = accountInfo.getAddressDisplay(
    keyRingStore.keyRingLedgerAddresses,
    false
  );
  const getWalletHistory = async (address) => {
    try {
      setLoading(true);

      const res = await API.getOasisTxs(
        {
          address,
          offset: 0,
          limit: 10,
          network: MapChainIdToNetwork[chainStore.current.chainId],
        },
        {
          baseURL: urlTxHistory,
        }
      );
      if (res && res.status !== 200) throw Error("Failed");

      setHistories(res.data.data);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.log("getWalletHistory err", err);
    }
  };

  useEffect(() => {
    setHistories([]);
    if (!address || appInitStore.getInitApp.isAllNetworks) return;
    getWalletHistory(address);
  }, [
    address,
    chainStore.current.chainId,
    appInitStore.getInitApp.isAllNetworks,
  ]);

  const fiat = priceStore.defaultVsCurrency;

  const price = priceStore.getPrice(
    chainStore.current.stakeCurrency.coinGeckoId,
    fiat
  );
  if (!price) return <EmptyTx />;
  return (
    <View
      style={{
        paddingHorizontal: 16,
      }}
    >
      {histories?.length > 0 ? (
        histories.map((item, index) => {
          return (
            <TxOasisItem
              key={`item-${index + 1}-${index}`}
              data={histories}
              item={item}
              index={index}
            />
          );
        })
      ) : loading ? (
        <View>
          {listSkeleton.map((item, index) => (
            <TxSkeleton key={index.toString()} />
          ))}
        </View>
      ) : (
        <EmptyTx />
      )}
      {histories?.length > 9 && (
        <OWButton
          style={{
            marginTop: 16,
          }}
          label={"View all"}
          size="medium"
          type="secondary"
          onPress={() => {
            // setMore(!more);
            navigate(SCREENS.STACK.Others, {
              screen: SCREENS.Transactions,
            });
            return;
          }}
        />
      )}
    </View>
  );
});
