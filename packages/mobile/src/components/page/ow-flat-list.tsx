import {
  ActivityIndicator,
  Animated,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View
} from 'react-native';
import React, { FC, ReactNode, useEffect, useRef, useState } from 'react';
import { FlatListProps } from 'react-native';
import { OWEmpty } from '../empty';
import { _keyExtract } from '@src/utils/helper';
// import { Skeleton } from '@rneui/themed';
import { metrics } from '@src/themes';
import { useTheme } from '@src/themes/theme-provider';
import OWButtonIcon from '../button/ow-button-icon';
import delay from 'delay';
interface IOWFlatListProps extends FlatListProps<any> {
  loadMore?: boolean;
  loading?: boolean;
  SkeletonComponent?: FlatListProps<any>['ListHeaderComponent'];
}
const OWFlatList: FC<IOWFlatListProps> = (props) => {
  const { colors, images } = useTheme();
  const listRef = useRef(null);
  const {
    SkeletonComponent = (
      // <Skeleton
      //   animation="pulse"
      //   width={metrics.screenWidth - 48}
      //   height={65}
      //   style={{
      //     borderRadius: 12,
      //     backgroundColor: colors['background-item-list'],
      //     marginVertical: 8
      //   }}
      //   skeletonStyle={{
      //     backgroundColor: colors['skeleton']
      //   }}
      // />
      <View />
    ),
    loadMore,
    loading,
    onRefresh,
    refreshing,
    ...rest
  } = props;
  const onScrollToTop = () => {
    listRef.current.scrollToOffset({ offset: 0, animated: true });
  };
  const [offset, setOffset] = useState(0);
  const handleScroll = (event) => {
    const scrollOffset = event.nativeEvent.contentOffset.y;
    handleSetOffset(scrollOffset);
  };
  const handleSetOffset = async (scrollOffset) => {
    try {
      await delay(200);
      setOffset(scrollOffset);
    } catch (error) {}
  };
  const [opacity] = useState(new Animated.Value(0));
  useEffect(() => {
    if (offset > 350) {
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true
      }).start();
    } else {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true
      }).start();
    }
    return () => {};
  }, [offset]);
  //   useEffect(() => {
  //     onScrollToTop();
  //     return () => {};
  //   }, [loading, refreshing]);

  return (
    <>
      <FlatList
        ref={listRef}
        onScroll={handleScroll}
        ListEmptyComponent={
          loading ? (
            <>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((it, inde) => {
                return (
                  <View key={`SkeletonComponent-${inde}`}>
                    {SkeletonComponent}
                  </View>
                );
              })}
            </>
          ) : (
            <OWEmpty />
          )
        }
        keyExtractor={_keyExtract}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          <View>
            <View style={styles.footer}>
              {loadMore ? SkeletonComponent : null}
            </View>
          </View>
        }
        refreshControl={
          onRefresh ? (
            <RefreshControl
              tintColor={colors['text-title']}
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          ) : null
        }
        {...rest}
      />
      <Animated.View
        style={[
          styles.fixedScroll,
          {
            opacity
          }
        ]}
      >
        <OWButtonIcon
          onPress={onScrollToTop}
          typeIcon="images"
          source={images.scroll_to_top}
          sizeIcon={48}
        />
      </Animated.View>
    </>
  );
};

export default OWFlatList;

const styles = StyleSheet.create({
  footer: {
    height: 80
  },
  fixedScroll: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0
  }
});
