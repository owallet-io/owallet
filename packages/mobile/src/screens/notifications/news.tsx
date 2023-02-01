import React, { FunctionComponent, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  View
} from 'react-native';
import FastImage from 'react-native-fast-image';
import { CText as Text } from '../../components/text';
import { colors, metrics, spacing, typography } from '../../themes';
import { _keyExtract } from '../../utils/helper';
import crashlytics from '@react-native-firebase/crashlytics';
import { API } from '../../common/api';
import { useIsFocused } from '@react-navigation/native';
import moment from 'moment';

const limit = 5;

export const NewsTab: FunctionComponent<{}> = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [loadMore, setLoadMore] = useState(false);
  const _handleRefresh = () => {
    page.current = 1;
    setLoading(true);
    fetchData();
  };

  const page = useRef(1);
  const hasMore = useRef(true);
  const fetchData = async (isLoadMore = false) => {
    crashlytics().log('transactions - home - fetchData');
    // const isRecipient = indexChildren === 1;
    // const isAll = indexChildren === 0;
    try {
      const res = await API.getNews(
        {
          page: page.current,
          limit: limit
        },
        { baseURL: 'https://tracking-tx.orai.io' }
      );

      const value = res.data?.news || [];
      let newData = isLoadMore ? [...data, ...value] : value;
      hasMore.current = value?.length === limit;
      let pageCurrent = +page.current;
      page.current = pageCurrent + 1;
      if (newData.length === res.data?.count) {
        hasMore.current = false;
      }
      setData(newData);
      setLoading(false);
      setLoadMore(false);
    } catch (error) {
      crashlytics().recordError(error);
      setLoading(false);
      setLoadMore(false);
      console.error(error);
    }
  };

  const isFocused = useIsFocused();

  useEffect(() => {
    page.current = 1;
    fetchData();
  }, [isFocused]);

  const _renderItem = ({ item, index }) => {
    return (
      <View
        style={{
          padding: 8,
          flexDirection: 'row',
          backgroundColor: '#F3F1F5',
          marginVertical: 8,
          borderRadius: 8
        }}
        key={item.id}
      >
        <View>
          <FastImage
            style={{
              width: 70,
              height: 70,
              borderRadius: 8,
              backgroundColor: colors['white']
            }}
            source={require('../../assets/image/webpage/orai_logo.png')}
          />
        </View>
        <View style={{ paddingLeft: 12, maxWidth: '75%' }}>
          <Text
            style={{
              fontWeight: '700',
              fontSize: 16
            }}
            numberOfLines={2}
          >
            {item.title}
          </Text>
          <Text
            style={{
              color: colors['blue-300'],
              paddingTop: 8
            }}
            numberOfLines={3}
          >
            {item.body}
          </Text>
          <Text
            style={{
              color: colors['blue-300'],
              paddingTop: 8,
              fontWeight: '700'
            }}
          >
            {moment(item.created_at).format('MMM DD, YYYY [at] HH:mm')}
          </Text>
        </View>
      </View>
    );
  };
  return (
    <View style={{ height: metrics.screenHeight }}>
      <View
        style={{
          backgroundColor: '#fff',
          borderRadius: 16,
          padding: 16,
          paddingBottom: metrics.screenHeight / 4.2
        }}
      >
        <FlatList
          showsVerticalScrollIndicator={false}
          keyExtractor={_keyExtract}
          data={data}
          renderItem={_renderItem}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={_handleRefresh} />
          }
          onEndReached={() => {
            setLoadMore(true);
            fetchData(true);
          }}
          ListFooterComponent={<View style={{ height: spacing['12'] }} />}
          ListEmptyComponent={
            <View
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: metrics.screenHeight / 4
              }}
            >
              <Text
                style={{
                  ...typography.subtitle1,
                  color: colors['gray-300']
                }}
              >
                {'Nothing new'}
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
};
