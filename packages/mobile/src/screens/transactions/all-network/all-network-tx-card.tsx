import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useEffect, useState } from "react";
import { View, ViewStyle } from "react-native";
import { API } from "@src/common/api";
import { listSkeleton, SCREENS, urlTxHistory } from "@src/common/constants";
import { navigate } from "@src/router/root";
import { OWButton } from "@src/components/button";
import { TxSkeleton } from "@src/components/page";
import { useStore } from "@src/stores";
import { EmptyTx } from "@src/screens/transactions/components/empty-tx";
import { convertObjChainAddressToString } from "@src/screens/transactions/all-network/all-network.helper";
import { AllNetworkItemTx } from "@src/screens/transactions/all-network/all-network.types";
import { AllNetworkTxItem } from "@src/screens/transactions/all-network/all-network-tx-item";
import { MapChainIdToNetwork } from "@src/utils/helper";
import { ChainIdEnum, getOasisAddress } from "@owallet/common";

export const AllNetworkTxCard: FunctionComponent<{
  containerStyle?: ViewStyle;
}> = observer(({ containerStyle }) => {
  const {
    accountStore,
    appInitStore,
    hugeQueriesStore,
    chainStore,
    priceStore,
    keyRingStore,
  } = useStore();
  const { chainId } = chainStore.current;
  const mapChainNetwork = MapChainIdToNetwork[chainId];
  const account = accountStore.getAccount(chainId);
  const accountOrai = accountStore.getAccount(ChainIdEnum.Oraichain);
  const address = account.getAddressDisplay(
    keyRingStore.keyRingLedgerAddresses
  );
  const allArr = appInitStore.getInitApp.isAllNetworks
    ? hugeQueriesStore.getAllAddrByChain
    : {
        [mapChainNetwork]:
          chainId === ChainIdEnum.OasisSapphire ||
          chainId === ChainIdEnum.OasisEmerald
            ? getOasisAddress(address)
            : address,
      };
  const [histories, setHistories] = useState<AllNetworkItemTx[]>([]);
  const [loading, setLoading] = useState(false);
  const getWalletHistory = async (addrByNetworks) => {
    try {
      setLoading(true);
      const { status, data } = await API.getTxsAllNetwork(
        {
          addrByNetworks: addrByNetworks,
          offset: 0,
          limit: 10,
        },
        {
          baseURL: urlTxHistory,
        }
      );
      if (status !== 200) throw Error("Failed");
      setHistories(data.data);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.log("getWalletHistory err", err);
    }
  };

  useEffect(() => {
    setHistories([]);
    const allAddress = convertObjChainAddressToString(allArr);
    if (!allAddress) return;
    getWalletHistory(allAddress);
  }, [
    chainId,
    appInitStore.getInitApp.isAllNetworks,
    accountOrai.bech32Address,
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
            <AllNetworkTxItem
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
