import { StyleSheet, View, TouchableOpacity } from "react-native";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { PageWithView } from "@src/components/page";
import { useTheme } from "@src/themes/theme-provider";
import { observer } from "mobx-react-lite";
import { useStore } from "@src/stores";
import {
  _keyExtract,
  limitString,
  MapChainIdToNetwork,
} from "@src/utils/helper";
import crashlytics from "@react-native-firebase/crashlytics";
import { OWBox } from "@src/components/card";
import { metrics, spacing } from "@src/themes";
import OWTransactionItem from "./components/items/transaction-item";
import { SCREENS, defaultAll, urlTxHistory } from "@src/common/constants";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import OWFlatList from "@src/components/page/ow-flat-list";
import SkeletonPlaceholder from "react-native-skeleton-placeholder";
import { ChainIdEnum } from "@owallet/common";
import TypeModal from "./components/type-modal";
import ButtonFilter from "./components/button-filter";
import { TendermintTxTracer } from "@owallet/cosmos";
import { Text } from "@src/components/text";
import { API } from "@src/common/api";
import { has } from "lodash";
import get from "lodash/get";
import { navigate } from "@src/router/root";

const TxTransactionsScreen = observer(() => {
  const { chainStore, accountStore, txsStore, modalStore, keyRingStore } =
    useStore();
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
  // const txs = txsStore(
  //   chainStore.current.chainId === ChainIdEnum.KawaiiEvm
  //     ? chainStore.getChain(ChainIdEnum.KawaiiCosmos)
  //     : chainStore.current
  // );

  const fetchData = async (address, isLoadMore = false) => {
    try {
      console.log(isLoadMore, "isLoadMore");
      if (!isLoadMore) setRefreshing(true);

      if (hasMore.current) {
        console.log(isLoadMore, "isLoadMore");
        // const rs = await requestData(
        //   isLoadMore,
        //   {
        //     addressAccount: params?.address,
        //     action: params?.action,
        //   },
        // );

        // const newData = isLoadMore ? [...data, ...rs.result] : rs?.result;
        // page.current = rs?.current_page + 1;
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
        console.log(res, "res");
        if (res && res.status !== 200) throw Error("Failed");
        page.current += 1;
        const totalPage = Math.ceil(res.data.totalRecord / perPage);
        console.log(totalPage, page.current, "page.current");
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
      } else {
        setAllLoading();
      }
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

  const onEndReached = useCallback(() => {
    if (page.current !== 0 && data.length > 0) {
      setLoadMore(true);
      fetchData(address, true);
      return;
    }
  }, [data]);
  const onRefresh = useCallback(() => {
    // setRefreshing(true);
    // setActiveType(defaultAll);
    page.current = 0;
    hasMore.current = true;
    fetchData(address, false);
  }, []);
  const setAllLoading = () => {
    setLoadMore(false);
    setLoading(false);
    setRefreshing(false);
  };
  const onTransactionDetail = (item) => {
    navigate(SCREENS.STACK.Others, {
      screen: SCREENS.HistoryDetail,
      params: {
        item,
      },
    });

    return;
  };
  const renderItem = ({ item, index }) => {
    return (
      <OWTransactionItem
        key={`item-${index + 1}-${index}`}
        data={data}
        onPress={() => onTransactionDetail(item)}
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
