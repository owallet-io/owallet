import React, {
  FC,
  FunctionComponent,
  useEffect,
  useRef,
  useState,
} from "react";
import { observer } from "mobx-react-lite";
import { StyleSheet } from "react-native";
import { _keyExtract } from "../../utils/helper";

import { PageWithView } from "../../components/page";
import { useTheme } from "@src/themes/theme-provider";

import { OWBox } from "@src/components/card";

import { useStore } from "@src/stores";

import OWFlatList from "@src/components/page/ow-flat-list";
import { PageHeader } from "@src/components/header/header-new";
import { RouteProp, useRoute } from "@react-navigation/native";
import { ChainInfo } from "@owallet/types";
import { NftItem } from "./components/nft-item";
import { API } from "@src/common/api";
import { OWEmpty } from "@src/components/empty";
import { urlAiRight } from "@src/common/constants";
import { processDataOraiNft, processDataStargazeNft } from "./hooks/useNfts";
import { SkeletonNft } from "./components/nft-skeleton";
import { ChainIdEnum } from "@owallet/common";
import { useQuery } from "@apollo/client";
import { OwnedTokens } from "@src/graphql/queries";
export const NftsScreen: FunctionComponent = observer((props) => {
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
  const { colors } = useTheme();
  const chainInfo = route.params?.chainInfo;
  const styles = styling(colors);
  return (
    <PageWithView>
      <PageHeader title="My NFTs" subtitle={chainInfo?.chainName} />
      <OWBox style={[styles.container]}>
        {chainInfo.chainId === ChainIdEnum.Oraichain ? (
          <NftsOraiScreen chainInfo={chainInfo} />
        ) : (
          <NftsStargazeScreen chainInfo={chainInfo} />
        )}
      </OWBox>
    </PageWithView>
  );
});

const NftsStargazeScreen: FC<{
  chainInfo: ChainInfo;
}> = observer(({ chainInfo }) => {
  const { accountStore } = useStore();
  const perPage = 10;
  const { colors } = useTheme();
  const styles = styling(colors);
  const renderItem = ({ item, index }) => {
    return <NftItem key={`item-${index + 1}-${index}`} item={item} />;
  };
  const account = accountStore.getAccount(ChainIdEnum.Stargaze);
  const address = account.bech32Address;
  const [loadMore, setLoadMore] = useState(false);
  const { loading, error, data, refetch, fetchMore } = useQuery(OwnedTokens, {
    variables: {
      filterForSale: null,
      owner: address,
      limit: perPage,
      filterByCollectionAddrs: null,
      sortBy: "ACQUIRED_DESC",
      offset: 0,
    },
    fetchPolicy: "cache-and-network",
  });
  const [refreshing, setRefreshing] = useState(false);
  const nfts = (data?.tokens?.tokens || [])
    .filter((item, index) => item?.media?.type === "image")
    .map((nft, index) => processDataStargazeNft(nft, chainInfo.stakeCurrency));
  const onEndReached = async () => {
    try {
      setLoadMore(true);
      await fetchMore({
        variables: {
          offset: data?.tokens?.tokens?.length || 0,
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          console.log(prev, "prev");
          if (!fetchMoreResult) return prev;
          console.log(fetchMoreResult, "fetchMoreResult");
          return {
            ...prev,
            tokens: {
              ...prev.tokens,
              tokens: [...prev.tokens.tokens, ...fetchMoreResult.tokens.tokens],
            },
          };
        },
      });
    } catch (error) {
      console.error("err loadmore nfts", error);
    } finally {
      setLoadMore(false);
    }
  };
  return (
    <OWFlatList
      containerSkeletonStyle={styles.containerSkeleton}
      SkeletonComponent={<SkeletonNft />}
      skeletonStyle={{}}
      data={error ? [] : nfts}
      onEndReached={onEndReached}
      renderItem={renderItem}
      columnWrapperStyle={styles.row}
      contentContainerStyle={{
        gap: 16,
      }}
      numColumns={2}
      loadMore={loadMore}
      loading={loading}
      onRefresh={async () => {
        try {
          setRefreshing(true);
          await refetch();
        } catch (error) {
          console.error("err nfts", error);
        } finally {
          setRefreshing(false);
        }
      }}
      ListEmptyComponent={<OWEmpty type="nft" label="NO NFTs YET" />}
      refreshing={refreshing}
    />
  );
});
const NftsOraiScreen: FC<{
  chainInfo: ChainInfo;
}> = observer(({ chainInfo }) => {
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
    <OWFlatList
      containerSkeletonStyle={styles.containerSkeleton}
      SkeletonComponent={<SkeletonNft />}
      skeletonStyle={{}}
      data={data}
      onEndReached={onEndReached}
      renderItem={renderItem}
      columnWrapperStyle={styles.row}
      contentContainerStyle={{
        gap: 16,
      }}
      numColumns={2}
      loadMore={loadMore}
      loading={loading}
      onRefresh={onRefresh}
      ListEmptyComponent={<OWEmpty type="nft" label="NO NFTs YET" />}
      refreshing={refreshing}
    />
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
    containerSkeleton: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 16,
      justifyContent: "space-between",
    },
  });
