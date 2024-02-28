import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  View,
} from "react-native";
import FastImage from "react-native-fast-image";
import { Text } from "@src/components/text";
import { metrics, spacing, typography } from "../../themes";
import { _keyExtract } from "../../utils/helper";
import crashlytics from "@react-native-firebase/crashlytics";
import { API } from "../../common/api";
import { useIsFocused } from "@react-navigation/native";
import moment from "moment";
import { useStore } from "../../stores";
import { observer } from "mobx-react-lite";
import { useTheme } from "@src/themes/theme-provider";
const limit = 5;

export const NewsTab: FunctionComponent<{}> = observer(() => {
  const { notificationStore } = useStore();
  const [loading, setLoading] = useState(true);
  const { colors } = useTheme();
  const [data, setData] = useState([]);
  const [loadMore, setLoadMore] = useState(false);
  const _handleRefresh = () => {
    page.current = 1;
    setLoading(true);
    hasMore.current = true;
    fetchData();
  };

  const page = useRef(1);
  const hasMore = useRef(true);
  const fetchData = async (isLoadMore = false) => {
    crashlytics().log("transactions - home - fetchData");

    if (hasMore.current) {
      try {
        const res = await API.getNews(
          {
            page: page.current,
            limit: limit,
          },
          { baseURL: "https://tracking-tx.orai.io" }
        );

        const value = res.data?.news || [];
        let newData = isLoadMore ? [...data, ...value] : value;
        hasMore.current = value?.length === limit;
        let pageCurrent = +page.current;
        page.current = pageCurrent + 1;
        if (newData.length === res.data?.count) {
          hasMore.current = false;
        }
        if (res.data?.news.length < 1) {
          hasMore.current = false;
        }
        setData(newData);
        notificationStore?.updateTotal(res.data?.count ?? 0);
        setLoading(false);
        setLoadMore(false);
      } catch (error) {
        crashlytics().recordError(error);
        setLoading(false);
        setLoadMore(false);
        console.error(error);
      }
    } else {
      setLoadMore(false);
      setLoading(false);
    }
  };

  const isFocused = useIsFocused();

  useEffect(() => {
    page.current = 1;
    fetchData();
  }, [isFocused]);

  const _renderItem = useCallback(
    ({ item }) => {
      return (
        <TouchableOpacity
          style={{
            padding: 8,
            flexDirection: "row",
            backgroundColor: notificationStore?.getReadNotifications?.includes(
              item?.id
            )
              ? colors["primary"]
              : colors["background-item-list"],
            marginVertical: 8,
            borderRadius: 8,
          }}
          key={item?.id}
          onPress={() => {
            notificationStore?.updateReadNotifications(item?.id);
          }}
        >
          <View>
            <FastImage
              style={{
                width: 70,
                height: 70,
                borderRadius: 8,
                backgroundColor: colors["white"],
              }}
              source={require("../../assets/image/webpage/orai_logo.png")}
            />
          </View>
          <View style={{ paddingLeft: 12, maxWidth: "75%" }}>
            <Text
              style={{
                fontWeight: "700",
                fontSize: 16,
                color: colors["label"],
              }}
              numberOfLines={2}
            >
              {item?.title ?? "-"}
            </Text>
            <Text
              style={{
                color: colors["blue-300"],
                paddingTop: 8,
              }}
              numberOfLines={3}
            >
              {item?.body ?? "-"}
            </Text>
            <Text
              style={{
                color: colors["blue-300"],
                paddingTop: 8,
                fontWeight: "700",
              }}
            >
              {moment(item?.created_at).format("MMM DD, YYYY [at] HH:mm")}
            </Text>
          </View>
        </TouchableOpacity>
      );
    },
    [notificationStore]
  );

  return (
    <View style={{ height: metrics.screenHeight }}>
      <View
        style={{
          backgroundColor: colors["background"],
          borderRadius: 16,
          padding: 16,
          paddingBottom: metrics.screenHeight / 4.2,
        }}
      >
        <FlatList
          showsVerticalScrollIndicator={false}
          keyExtractor={_keyExtract}
          // data={data}
          data={[1]}
          renderItem={_renderItem}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={_handleRefresh} />
          }
          onEndReached={() => {
            setLoadMore(true);
            fetchData(true);
          }}
          ListFooterComponent={<View style={{ height: spacing["12"] }} />}
          ListEmptyComponent={
            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
                marginTop: metrics.screenHeight / 4,
              }}
            >
              <Text
                style={{
                  ...typography.subtitle1,
                  color: colors["gray-300"],
                }}
              >
                {"Nothing new"}
              </Text>
            </View>
          }
        />
        {loadMore ? (
          <View>
            <ActivityIndicator />
          </View>
        ) : null}
      </View>
    </View>
  );
});
