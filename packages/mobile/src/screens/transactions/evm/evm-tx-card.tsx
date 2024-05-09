import { OWEmpty } from "@src/components/empty";
import { useTheme } from "@src/themes/theme-provider";
import { observer } from "mobx-react-lite";
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

import { API } from "@src/common/api";
import { listSkeleton, SCREENS, urlTxHistory } from "@src/common/constants";
import { navigate } from "@src/router/root";
import FastImage from "react-native-fast-image";
import OWText from "@src/components/text/ow-text";

import { OWButton } from "@src/components/button";
import OWTransactionItem from "@src/screens/transactions/components/items/transaction-item";
import SkeletonPlaceholder from "react-native-skeleton-placeholder";
import { TxSkeleton } from "@src/components/page";
import { SearchFilter } from "@src/screens/transactions/tx-transaction-screen";
import { MapChainIdToNetwork } from "@src/utils/helper";
import { useStore } from "@src/stores";

export const EvmTxCard: FunctionComponent<{
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

      const res = await API.getEvmTxs(
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

  const styles = styling(colors);
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
      {/*<SearchFilter />*/}
      {histories?.length > 0 ? (
        histories.map((item, index) => {
          return (
            <OWTransactionItem
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
export const EmptyTx = () => {
  const { colors } = useTheme();
  return (
    <View
      style={{
        justifyContent: "center",
        alignItems: "center",
        marginVertical: 42,
        marginBottom: 0,
      }}
    >
      <FastImage
        source={require("../../assets/image/img_empty.png")}
        style={{
          width: 150,
          height: 150,
        }}
        resizeMode={"contain"}
      />
      <OWText color={colors["neutral-text-title"]} size={16} weight="700">
        {"NO TRANSACTIONS YET".toUpperCase()}
      </OWText>
    </View>
  );
};
const styling = (colors) =>
  StyleSheet.create({
    wrapHeaderTitle: {
      flexDirection: "row",
    },
    pl10: {
      paddingLeft: 10,
    },
    leftBoxItem: {
      flexDirection: "row",
      alignItems: "center",
    },
    rightBoxItem: {
      alignItems: "flex-end",
    },
    btnItem: {
      flexDirection: "row",
      // justifyContent: 'space-between',
      alignItems: "center",
      flexWrap: "wrap",
      gap: 16,

      // marginVertical: 8,
    },
    profit: {
      fontWeight: "400",
      lineHeight: 20,
    },
    iconWrap: {
      width: 32,
      height: 32,
      borderRadius: 32,
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
      backgroundColor: colors["neutral-text-action-on-dark-bg"],
    },
    chainWrap: {
      width: 18,
      height: 18,
      borderRadius: 32,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors["neutral-text-action-on-dark-bg"],
      position: "absolute",
      bottom: -6,
      left: 20,
    },
    active: {
      borderBottomColor: colors["primary-surface-default"],
      borderBottomWidth: 2,
    },
  });
