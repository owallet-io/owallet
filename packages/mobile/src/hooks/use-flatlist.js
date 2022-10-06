import React, { useRef, useCallback, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import { useRequest } from '@umijs/hooks';

const useFlatlist = (service, options) => {
  const [reload, setReload] = useState(false);
  const request = useRequest(service, {
    loadMore: true,
    debounceInterval: 250,
    isNoMore: e => {
      return e?.offset - e?.list?.length > 0;
    },
    onError: () => {
      setReload(true);
    },
    ...options
  });

  const onEndReachedCalledDuringMomentum = useRef(false);
  const onMomentumScrollBegin = useCallback(() => {
    onEndReachedCalledDuringMomentum.current = false;
  }, []);

  const onEndReached = useCallback(() => {
    if (!onEndReachedCalledDuringMomentum.current) {
      !request?.loadingMore && request?.loadMore();
      onEndReachedCalledDuringMomentum.current = true;
    }
  }, [request]);

  const loadMore = useCallback(() => {
    if (!onEndReachedCalledDuringMomentum.current) {
      !request?.loadingMore && request?.loadMore();
      onEndReachedCalledDuringMomentum.current = true;
    }
  }, [request]);

  const keyExtractor = useCallback((item, index) => `${item.id}${index}`, []);

  const flatListProps = {
    onMomentumScrollBegin,
    scrollEventThrottle: 16,
    keyExtractor,
    onEndReached,
    loadMore,
    refreshing: request?.loading,
    onRefresh: request?.refresh,
    data: request?.data?.list,
    onEndReachedThreshold: 0.5,
    ListFooterComponent: !request.loading && request?.loadingMore && (
      <ActivityIndicator />
    )
  };

  return { ...request, flatListProps, reload, setReload };
};

export default useFlatlist;
