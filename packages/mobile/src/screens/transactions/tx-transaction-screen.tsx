import { StyleSheet } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { PageWithView } from "@src/components/page";
import { useTheme } from "@src/themes/theme-provider";
import { observer } from "mobx-react-lite";
import { useStore } from "@src/stores";
import { MapChainIdToNetwork } from "@src/utils/helper";
import { OWBox } from "@src/components/card";
import { spacing } from "@src/themes";
import OWTransactionItem from "./components/items/transaction-item";
import { SCREENS, urlTxHistory } from "@src/common/constants";
import OWFlatList from "@src/components/page/ow-flat-list";
import { API } from "@src/common/api";
import get from "lodash/get";
import { navigate } from "@src/router/root";
import { EmptyTx } from "@src/screens/home/history-card";

const TxTransactionsScreen = observer(() => {
  const { chainStore, accountStore, keyRingStore } = useStore();
  const { colors } = useTheme();
  const account = accountStore.getAccount(chainStore.current.chainId);
  const address = account.getAddressDisplay(
    keyRingStore.keyRingLedgerAddresses,
    false
  );
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadMore, setLoadMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const page = useRef(0);
  const hasMore = useRef(true);
  const perPage = 10;

  const fetchData = async (address, isLoadMore = false) => {
    try {
      if (!isLoadMore) setLoading(true);
      if (!hasMore.current) throw Error("Failed");
      const res = await API.getEvmTxs(
        {
          address,
          offset: !isLoadMore ? 0 : page.current * perPage,
          limit: perPage,
          network: MapChainIdToNetwork[chainStore.current.chainId],
        },
        {
          baseURL: urlTxHistory,
        }
      );
      if (res && res.status !== 200) throw Error("Failed");
      page.current += 1;
      const totalPage = Math.ceil(res.data.totalRecord / perPage);
      if (page.current === totalPage) {
        hasMore.current = false;
      }
      if (get(res, "data.data.length") < 1) {
        hasMore.current = false;
      }

      setData((prevData) => {
        if (isLoadMore) return [...prevData, ...res.data.data];
        return res.data.data;
      });
      setAllLoading();
    } catch (error) {
      setAllLoading();
    }
  };

  useEffect(() => {
    if (!address) return;
    page.current = 0;
    hasMore.current = true;
    fetchData(address, false);
    return () => {
      setData([]);
    };
  }, [address]);

  const styles = styling();

  const onEndReached = () => {
    if (page.current !== 0 && data.length > 0) {
      setLoadMore(true);
      fetchData(address, true);
      return;
    }
  };
  const onRefresh = () => {
    setRefreshing(true);
    page.current = 0;
    hasMore.current = true;
    fetchData(address, false);
  };
  const setAllLoading = () => {
    setLoadMore(false);
    setLoading(false);
    setRefreshing(false);
  };
  const renderItem = ({ item, index }) => {
    return (
      <OWTransactionItem
        key={`item-${index + 1}-${index}`}
        data={data}
        item={item}
        index={index}
      />
    );
  };

  return (
    <PageWithView>
      <OWBox style={[styles.container]}>
        <OWFlatList
          data={data}
          onEndReached={onEndReached}
          renderItem={renderItem}
          loadMore={loadMore}
          loading={loading}
          onRefresh={onRefresh}
          ListEmptyComponent={<EmptyTx />}
          refreshing={refreshing}
        />
      </OWBox>
    </PageWithView>
  );
});

export default TxTransactionsScreen;

const styling = () => {
  const { colors } = useTheme();
  return StyleSheet.create({
    containerBtnPage: {
      flexDirection: "row",
      // justifyContent: 'space-around',
      marginVertical: 20,
      justifyContent: "center",
      paddingVertical: 6,
      paddingHorizontal: 8,
      marginHorizontal: 24,
    },
    fixedScroll: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
    },
    footer: {
      height: 20,
    },
    container: {
      flex: 1,
      backgroundColor: colors["neutral-surface-card"],
      paddingHorizontal: 16,
      paddingTop: 12,
      borderBottomLeftRadius: 0,
      borderBottomRightRadius: 0,
    },
    containerFilter: {
      flexDirection: "row",
      paddingBottom: spacing["page-pad"],
      justifyContent: "space-between",
    },
    item: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: spacing["page-pad"],
      height: 65,
      backgroundColor: colors["background-item-list"],
      marginVertical: 8,
      alignItems: "center",
      borderRadius: 8,
    },
  });
};
