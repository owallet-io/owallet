import { StyleSheet, View } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { PageWithView } from "@src/components/page";
import { useTheme } from "@src/themes/theme-provider";
import { observer } from "mobx-react-lite";
import { useStore } from "@src/stores";
import { OWBox } from "@src/components/card";
import { spacing } from "@src/themes";

import OWFlatList from "@src/components/page/ow-flat-list";
import { API } from "@src/common/api";
import get from "lodash/get";

import OWButtonIcon from "@src/components/button/ow-button-icon";
import { OWSearchInput } from "@src/components/ow-search-input";
import { EmptyTx } from "@src/screens/transactions/components/empty-tx";

import {
  ChainIdEnum,
  getOasisAddress,
  MapChainIdToNetwork,
  urlTxHistory,
} from "@owallet/common";
import { AllNetworkTxItem } from "@src/screens/transactions/all-network/all-network-tx-item";
import { convertObjChainAddressToString } from "@src/screens/transactions/all-network/all-network.helper";
import { useRoute } from "@react-navigation/native";

const AllNetworkTxsScreen = observer(() => {
  const {
    hugeQueriesStore,
    chainStore,
    accountStore,
    keyRingStore,
    appInitStore,
  } = useStore();
  const params = useRoute().params;
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadMore, setLoadMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const page = useRef(0);
  const hasMore = useRef(true);
  const perPage = 10;
  const { chainId } = chainStore.current;
  const mapChainNetwork = MapChainIdToNetwork[chainId];
  const account = accountStore.getAccount(chainId);
  const address = account.addressDisplay;
  const allArr = appInitStore.getInitApp.isAllNetworks
    ? hugeQueriesStore.getAllAddrByChain
    : {
        [mapChainNetwork]:
          chainId === ChainIdEnum.OasisSapphire ||
          chainId === ChainIdEnum.OasisEmerald
            ? getOasisAddress(address)
            : address,
      };
  const fetchData = async (addrByNetworks, isLoadMore = false) => {
    try {
      if (!isLoadMore) setLoading(true);
      if (!hasMore.current) throw Error("Failed");

      let res = await API.getTxsAllNetwork(
        {
          addrByNetworks: convertObjChainAddressToString(addrByNetworks),
          offset: !isLoadMore ? 0 : page.current * perPage,
          limit: perPage,
        },
        {
          baseURL: urlTxHistory,
        }
      );
      if (params?.tokenAddr) {
        res = await API.getTxsByToken(
          {
            tokenAddr: params.tokenAddr,
            userAddr: params.userAddress,
            network: params.network,
            offset: !isLoadMore ? 0 : page.current * perPage,
            limit: perPage,
          },
          {
            baseURL: urlTxHistory,
          }
        );
      }
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
    if (!allArr) return;
    page.current = 0;
    hasMore.current = true;
    fetchData(allArr, false);
    return () => {
      setData([]);
    };
  }, [chainId, appInitStore.getInitApp.isAllNetworks]);

  const styles = styling();

  const onEndReached = () => {
    if (page.current !== 0 && data.length > 0) {
      setLoadMore(true);
      fetchData(allArr, true);
      return;
    }
  };
  const onRefresh = () => {
    setRefreshing(true);
    page.current = 0;
    hasMore.current = true;
    fetchData(allArr, false);
  };
  const setAllLoading = () => {
    setLoadMore(false);
    setLoading(false);
    setRefreshing(false);
  };
  const renderItem = ({ item, index }) => {
    return (
      <AllNetworkTxItem
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
        {/*<SearchFilter />*/}
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

export const SearchFilter = () => {
  const { colors } = useTheme();
  const styles = styling();
  return (
    <View style={styles.containerTop}>
      {/* <OWSearchInput placeHolder={"Search for a chain"} /> */}
      <OWButtonIcon
        fullWidth={false}
        name={"tdesignfilter"}
        sizeIcon={20}
        colorIcon={colors["neutral-text-action-on-light-bg"]}
        style={styles.iconFilter}
      />
    </View>
  );
};
export default AllNetworkTxsScreen;

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
      paddingTop: 16,
      borderBottomLeftRadius: 0,
      borderBottomRightRadius: 0,
      marginTop: 8,
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
    containerTop: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    iconFilter: {
      height: 44,
      width: 44,
      backgroundColor: colors["neutral-surface-action"],
      borderRadius: 44,
    },
  });
};
