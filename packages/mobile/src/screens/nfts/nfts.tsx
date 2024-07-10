import React, { FunctionComponent, useEffect, useRef, useState } from "react";
import { observer } from "mobx-react-lite";
import {
  FlatList,
  TouchableOpacity,
  StyleSheet,
  View,
  SectionList,
} from "react-native";
import { metrics, spacing, typography } from "../../themes";
import { _keyExtract } from "../../utils/helper";
import { DownArrowIcon } from "../../components/icon";
import {
  PageWithViewInBottomTabView,
  PageWithView,
} from "../../components/page";
import Accordion from "react-native-collapsible/Accordion";
import { useSmartNavigation } from "../../navigation.provider";
import ProgressiveImage from "../../components/progessive-image";
import { useTheme } from "@src/themes/theme-provider";
import { Text } from "@src/components/text";
import { OWBox } from "@src/components/card";
import { OWSubTitleHeader } from "@src/components/header";

import { useStore } from "@src/stores";
import images from "@src/assets/images";
// import { useSoulbound } from "./hooks/useSoulboundNft";
import OWFlatList from "@src/components/page/ow-flat-list";
import { PageHeader } from "@src/components/header/header-new";
import { RouteProp, useRoute } from "@react-navigation/native";
import { ChainInfo } from "@owallet/types";
import { NftItem } from "./components/nft-item";
import { API } from "@src/common/api";
import { OWEmpty } from "@src/components/empty";
import { urlAiRight } from "@src/common/constants";
import { processDataOraiNft } from "./hooks/useNfts";
// import { SkeletonNft } from "../home/tokens-card";
export const NftsScreen: FunctionComponent = observer((props) => {
  const { accountStore } = useStore();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadMore, setLoadMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const page = useRef(0);
  const hasMore = useRef(true);
  const perPage = 10;
  const { colors } = useTheme();
  const styles = styling(colors);

  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          chainInfo: ChainInfo;
        }
      >,
      string
    >
  >();

  const chainInfo = route.params?.chainInfo;
  const account = accountStore.getAccount(chainInfo.chainId);

  const renderItem = ({ item, index }) => {
    return <NftItem key={`item-${index + 1}-${index}`} item={item} />;
  };
  const fetchData = async (address, isLoadMore = false) => {
    try {
      if (!isLoadMore) setLoading(true);
      if (!hasMore.current) throw Error("Failed");

      let res = await API.getNftsOraichain(
        {
          offset: !isLoadMore ? 0 : page.current * perPage,
          size: perPage,
          address: address,
        },
        {
          baseURL: urlAiRight,
        }
      );

      if (res && res.status !== 200) throw Error("Failed");
      page.current += 1;
      console.log(res?.data, "res?.data");
      const totalPage = Math.ceil(res?.data?.total / perPage);
      if (page.current === totalPage) {
        hasMore.current = false;
      }
      if (res?.data?.items?.length < 1) {
        hasMore.current = false;
      }
      const nfts = (res?.data?.items || []).map((nft, index) =>
        processDataOraiNft(nft, chainInfo.currencies)
      );
      setData((prevData) => {
        if (isLoadMore) return [...prevData, ...nfts];
        return nfts;
      });
      setAllLoading();
    } catch (error) {
      setAllLoading();
    }
  };
  const setAllLoading = () => {
    setLoadMore(false);
    setLoading(false);
    setRefreshing(false);
  };
  useEffect(() => {
    if (!account.bech32Address) return;
    page.current = 0;
    hasMore.current = true;
    fetchData(account.bech32Address, false);
    return () => {
      setData([]);
    };
  }, [account.bech32Address]);
  const onEndReached = () => {
    if (page.current !== 0 && data.length > 0) {
      setLoadMore(true);
      fetchData(account.bech32Address, true);
      return;
    }
  };
  const onRefresh = () => {
    setRefreshing(true);
    page.current = 0;
    hasMore.current = true;
    fetchData(account.bech32Address, false);
  };

  return (
    <PageWithView>
      <PageHeader title="My NFTs" subtitle={chainInfo?.chainName} />
      <OWBox style={[styles.container]}>
        <OWFlatList
          data={data}
          onEndReached={onEndReached}
          renderItem={renderItem}
          columnWrapperStyle={styles.row}
          numColumns={2}
          loadMore={loadMore}
          loading={loading}
          onRefresh={onRefresh}
          ListEmptyComponent={<OWEmpty type="nft" label="NO NFTs YET" />}
          refreshing={refreshing}
        />
      </OWBox>
    </PageWithView>
  );
});

const styling = (colors) =>
  StyleSheet.create({
    container: {
      paddingTop: 16,
      marginTop: 0,
      backgroundColor: colors["neutral-surface-card"],
      paddingHorizontal: 16,
    },
    row: {
      flex: 1,
      justifyContent: "space-between",
    },
  });
