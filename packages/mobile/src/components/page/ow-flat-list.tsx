import {
  ActivityIndicator,
  Animated,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import React, { FC, ReactNode, useEffect, useRef, useState } from "react";
import { FlatListProps } from "react-native";
import { OWEmpty } from "../empty";
import { _keyExtract } from "@src/utils/helper";
import SkeletonPlaceholder from "react-native-skeleton-placeholder";
import { metrics } from "@src/themes";
import { useTheme } from "@src/themes/theme-provider";
import OWButtonIcon from "../button/ow-button-icon";
import delay from "delay";
import { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import { OwLoading } from "@src/components/owallet-loading/ow-loading";

export const TxSkeleton = () => {
  const { colors, images } = useTheme();
  return (
    <SkeletonPlaceholder
      highlightColor={colors["skeleton"]}
      backgroundColor={colors["background-item-list"]}
      borderRadius={12}
    >
      <SkeletonPlaceholder.Item
        width={"100%"}
        marginVertical={8}
        height={65}
      ></SkeletonPlaceholder.Item>
    </SkeletonPlaceholder>
  );
};

interface IOWFlatListProps extends FlatListProps<any> {
  loadMore?: boolean;
  isBottomSheet?: boolean;
  loading?: boolean;
  hiddenButtonBottom?: boolean;
  containerSkeletonStyle?: ViewStyle;
  skeletonStyle?: ViewStyle;
  SkeletonComponent?: FlatListProps<any>["ListHeaderComponent"];
  ListEmptyComponent: FlatListProps<any>["ListEmptyComponent"];
}

const OWFlatList: FC<IOWFlatListProps> = (props) => {
  const { colors, images } = useTheme();
  const listRef = useRef(null);
  const {
    SkeletonComponent = <TxSkeleton />,
    loadMore,
    loading,
    onRefresh,
    refreshing,
    containerSkeletonStyle = {},
    skeletonStyle = {},
    isBottomSheet = false,
    hiddenButtonBottom,
    ListEmptyComponent = <OWEmpty />,
    ...rest
  } = props;
  // const onScrollToTop = () => {
  //   listRef.current.scrollToOffset({ offset: 0, animated: true });
  // };
  // const [offset, setOffset] = useState(0);
  // const handleScroll = (event) => {
  //   const scrollOffset = event.nativeEvent.contentOffset.y;
  //   handleSetOffset(scrollOffset);
  // };
  // const handleSetOffset = async (scrollOffset) => {
  //   try {
  //     await delay(200);
  //     setOffset(scrollOffset);
  //   } catch (error) {}
  // };
  // const [opacity] = useState(new Animated.Value(0));
  // useEffect(() => {
  //   if (offset > 350) {
  //     Animated.timing(opacity, {
  //       toValue: 1,
  //       duration: 200,
  //       useNativeDriver: true,
  //     }).start();
  //   } else {
  //     Animated.timing(opacity, {
  //       toValue: 0,
  //       duration: 200,
  //       useNativeDriver: true,
  //     }).start();
  //   }
  //   return () => {};
  // }, [offset]);
  //   useEffect(() => {
  //     onScrollToTop();
  //     return () => {};
  //   }, [loading, refreshing]);
  const ElementFlatlist = isBottomSheet ? BottomSheetFlatList : FlatList;
  return (
    <>
      <ElementFlatlist
        ref={listRef}
        // onScroll={handleScroll}
        ListEmptyComponent={
          loading ? (
            <View style={containerSkeletonStyle}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((it, inde) => {
                return (
                  <View style={skeletonStyle} key={`SkeletonComponent-${inde}`}>
                    {SkeletonComponent}
                  </View>
                );
              })}
            </View>
          ) : (
            ListEmptyComponent
          )
        }
        keyExtractor={_keyExtract}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        ListFooterComponent={
          <View>
            <View style={styles.footer}>{loadMore ? <OwLoading /> : null}</View>
          </View>
        }
        refreshControl={
          onRefresh ? (
            <RefreshControl
              tintColor={colors["text-title"]}
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          ) : null
        }
        {...rest}
      />
      {/*{!hiddenButtonBottom && (*/}
      {/*  <Animated.View*/}
      {/*    style={[*/}
      {/*      styles.fixedScroll,*/}
      {/*      {*/}
      {/*        opacity,*/}
      {/*      },*/}
      {/*    ]}*/}
      {/*  >*/}
      {/*    <OWButtonIcon*/}
      {/*      onPress={onScrollToTop}*/}
      {/*      typeIcon="images"*/}
      {/*      source={images.scroll_to_top}*/}
      {/*      sizeIcon={48}*/}
      {/*    />*/}
      {/*  </Animated.View>*/}
      {/*)}*/}
    </>
  );
};

export default OWFlatList;

const styles = StyleSheet.create({
  footer: {
    height: 90,
  },
  fixedScroll: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
});
