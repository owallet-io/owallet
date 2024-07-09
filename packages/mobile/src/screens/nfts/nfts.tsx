import React, { FunctionComponent, useEffect, useState } from "react";
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
// import { SkeletonNft } from "../home/tokens-card";
export const NftsScreen: FunctionComponent = observer((props) => {
  const { chainStore, accountStore } = useStore();
  const account = accountStore.getAccount(chainStore.current.chainId);

  const smartNavigation = useSmartNavigation();
  const { colors } = useTheme();
  const styles = styling(colors);

  return (
    // <PageWithView>
    //   <OWBox style={[styles.container]}>
    //     {/*<SearchFilter />*/}
    //     <OWFlatList
    //       data={data}
    //       onEndReached={onEndReached}
    //       renderItem={renderItem}
    //       loadMore={loadMore}
    //       loading={loading}
    //       onRefresh={onRefresh}
    //       ListEmptyComponent={<EmptyTx />}
    //       refreshing={refreshing}
    //     />
    //   </OWBox>
    // </PageWithView>
    <></>
  );
});

const styling = (colors) =>
  StyleSheet.create({
    wrapFlatlist: {
      flex: 1,
      paddingVertical: 10,
    },
    containerBox: {
      flex: 1,
      borderBottomLeftRadius: 0,
      borderBottomRightRadius: 0,
      paddingTop: 0,
    },
    container: {
      backgroundColor: colors["primary"],
      borderRadius: spacing["24"],
    },
    containerTab: {},
    title: {
      ...typography.h3,
      fontWeight: "700",
      textAlign: "center",
      color: colors["primary-text"],
      marginTop: spacing["12"],
      marginBottom: spacing["12"],
    },
    containerBtn: {
      backgroundColor: colors["primary-surface-default"],
      borderRadius: spacing["8"],
      marginHorizontal: spacing["24"],
      paddingVertical: spacing["16"],
      justifyContent: "center",
      alignItems: "center",
      marginTop: spacing["12"],
    },
    flatListItem: {
      backgroundColor: colors["sub-nft"],
      borderRadius: spacing["12"],
      paddingVertical: spacing["8"],
    },
    itemPhoto: {
      width: (metrics.screenWidth - 120) / 2,
      height: (metrics.screenWidth - 120) / 2,
      borderRadius: spacing["6"],
    },
    containerCollection: {
      marginHorizontal: spacing["24"],
      marginTop: spacing["32"],
    },
    containerSectionTitle: {
      flexDirection: "row",
      marginBottom: spacing["16"],
    },
    transactionListEmpty: {
      justifyContent: "center",
      alignItems: "center",
      paddingBottom: 200,
    },
    ContainerBtnNft: {
      margin: 12,
      marginLeft: 0,
    },
    titleNft: {
      paddingTop: 12,
    },
    subTextNft: {
      textAlign: "justify",
    },
    containerImgNft: {
      borderRadius: 6,
      width: 128,
      height: 128,
    },
    itemImg: {
      width: 128,
      height: 128,
    },
    wrapViewNft: {
      padding: 12,
      width: 150,
      height: 222,
      borderRadius: spacing["12"],
    },
    itemText: {
      ...typography.h7,
      // color: colors['gray-900'],
      fontWeight: "700",
    },
  });
