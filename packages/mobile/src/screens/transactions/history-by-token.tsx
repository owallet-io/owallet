import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useEffect, useState } from "react";
import { View, ViewStyle } from "react-native";
import { useStore } from "../../stores";
import { EmptyTx } from "@src/screens/transactions/components/empty-tx";
import { ChainIdEnum, getOasisAddress } from "@owallet/common";
import { metrics } from "@src/themes";
import { useGetHeightHeader } from "@src/hooks";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { AllNetworkTxItem } from "@src/screens/transactions/all-network/all-network-tx-item";
import { AllNetworkItemTx } from "@src/screens/transactions/all-network/all-network.types";
import { API } from "@src/common/api";
import { SCREENS, urlTxHistory } from "@src/common/constants";
import { MapChainIdToNetwork } from "@src/utils/helper";
import { OWButton } from "@src/components/button";
import { navigate } from "@src/router/root";

export const HistoryByToken: FunctionComponent<{
  chainId: string;
  tokenAddr: string;
}> = observer(({ chainId, tokenAddr }) => {
  const { keyRingStore, accountStore } = useStore();
  if (!tokenAddr || !chainId) return;
  const heightHeader = useGetHeightHeader();
  const heightBottom = useBottomTabBarHeight();
  const containerStyle = {
    minHeight: (metrics.screenHeight - (heightHeader + heightBottom + 100)) / 2,
  };
  const mapChainNetwork = MapChainIdToNetwork[chainId];
  const account = accountStore.getAccount(chainId);
  const address = account.getAddressDisplay(
    keyRingStore.keyRingLedgerAddresses
  );
  const allArr =
    chainId === ChainIdEnum.OasisSapphire ||
    chainId === ChainIdEnum.OasisEmerald
      ? getOasisAddress(address)
      : address;
  const [histories, setHistories] = useState<AllNetworkItemTx[]>([]);
  const [loading, setLoading] = useState(false);
  const getWalletHistory = async (userAddress) => {
    try {
      setLoading(true);
      const { status, data } = await API.getTxsByToken(
        {
          userAddr: userAddress,
          tokenAddr: tokenAddr,
          network: mapChainNetwork,
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

    if (!allArr) return;
    getWalletHistory(allArr);
  }, [allArr]);

  if (histories?.length <= 0 || !histories?.length)
    return (
      <View>
        <EmptyTx />
      </View>
    );

  return (
    <View style={containerStyle}>
      {histories?.length > 0
        ? histories.map((item, index) => {
            return (
              <AllNetworkTxItem
                key={`item-${index + 1}-${index}`}
                data={histories}
                item={item}
                index={index}
              />
            );
          })
        : null}
      {histories?.length > 9 && (
        <OWButton
          style={{
            marginTop: 16,
          }}
          label={"View all"}
          size="medium"
          type="secondary"
          onPress={() => {
            navigate(SCREENS.STACK.Others, {
              screen: SCREENS.Transactions,
              params: {
                network: mapChainNetwork,
                userAddress: allArr,
                tokenAddr,
              },
            });
            return;
          }}
        />
      )}
    </View>
  );
});
