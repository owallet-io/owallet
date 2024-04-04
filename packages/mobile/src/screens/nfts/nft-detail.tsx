import React, { FunctionComponent, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { StyleSheet, View, ActivityIndicator, FlatList } from "react-native";
import { useSmartNavigation } from "../../navigation.provider";
import { EthereumEndpoint } from "@owallet/common";
import { metrics, spacing, typography } from "../../themes";
import { convertAmount, _keyExtract, checkImageURL } from "../../utils/helper";
import { QuantityIcon } from "../../components/icon";
import {
  TransactionItem,
  TransactionSectionTitle,
} from "../transactions/components";
import { PageWithScrollViewInBottomTabView } from "../../components/page";
import { API } from "../../common/api";
import { RouteProp, useRoute } from "@react-navigation/native";
import { useSendTxConfig } from "@owallet/hooks";
import ProgressiveImage from "../../components/progessive-image";
import { Text } from "@src/components/text";
import { useTheme } from "@src/themes/theme-provider";
import { OWBox } from "@src/components/card";
import { OWButton } from "@src/components/button";
import { OWEmpty } from "@src/components/empty";
import OWIcon from "@src/components/ow-icon/ow-icon";
import images from "@src/assets/images";

const ORAI = "oraichain-token";
const AIRI = "airight";

const commonDenom = { ORAI, AIRI };

export const NftDetailScreen: FunctionComponent = observer((props) => {
  const smartNavigation = useSmartNavigation();
  // const { chainStore, accountStore, queriesStore, modalStore } = useStore();
  const { colors } = useTheme();
  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          chainId?: string;
          currency?: string;
          recipient?: string;
        }
      >,
      string
    >
  >();
  const { item } = props.route?.params;
  const styles = styling();

  return (
    <PageWithScrollViewInBottomTabView>
      <View style={styles.container}>
        <OWBox type="gradient">
          <View
            style={{
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                ...typography.h5,
                color: colors["white"],
                fontWeight: "700",
              }}
              numberOfLines={1}
            >
              {item.name}
            </Text>

            <Text
              style={{
                ...typography.h7,
                color: colors["purple-400"],
                fontWeight: "700",
              }}
            >
              {`#${item.id}`}
            </Text>
          </View>

          <View style={styles.containerImage}>
            <ProgressiveImage
              source={{
                uri: item.picture,
              }}
              style={{
                width: metrics.screenWidth - 110,
                height: metrics.screenWidth - 110,
                borderRadius: spacing["6"],
              }}
              resizeMode="contain"
            />
            <View
              style={{
                marginTop: spacing["12"],
                width: "100%",
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <View>
                <Text
                  style={{
                    ...typography.h6,
                    fontWeight: "700",
                  }}
                >
                  0
                </Text>

                <Text
                  style={{
                    ...typography.h7,
                    color: colors["gray-500"],
                    fontWeight: "700",
                  }}
                >
                  $ 0
                </Text>
              </View>

              <View style={styles.containerQuantity}>
                <View
                  style={{
                    marginTop: spacing["6"],
                  }}
                >
                  <QuantityIcon size={24} color={colors["gray-150"]} />
                </View>
                <Text
                  style={{
                    color: colors["gray-150"],
                  }}
                >
                  0
                </Text>
              </View>
            </View>
          </View>
        </OWBox>
      </View>

      <View
        style={{
          backgroundColor: colors["neutral-surface-bg2"],
          borderRadius: spacing["24"],
          paddingBottom: spacing["24"],
          height: metrics.screenHeight / 2,
        }}
      >
        <TransactionSectionTitle title={"Transaction list"} />
        <FlatList
          data={[]}
          renderItem={({ item, index }) => (
            <TransactionItem
              containerStyle={{
                backgroundColor: colors["background-item-list"],
              }} // customize item transaction
              type={"native"}
              item={item}
              key={index}
              address={""}
            />
          )}
          keyExtractor={_keyExtract}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={() => (
            <View
              style={{
                height: 12,
              }}
            />
          )}
          ListEmptyComponent={<OWEmpty />}
        />
      </View>
    </PageWithScrollViewInBottomTabView>
  );
});

const styling = () => {
  const { colors } = useTheme();
  return StyleSheet.create({
    container: {
      marginHorizontal: spacing["24"],
      marginBottom: spacing["12"],
    },
    containerImage: {
      marginTop: spacing["8"],
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors["neutral-surface-bg2"],
      paddingHorizontal: 12,
      borderRadius: spacing["12"],
      padding: spacing["8"],
      marginBottom: spacing["24"],
    },
    containerQuantity: {
      backgroundColor: colors["blue/Border-50"],
      borderRadius: spacing["6"],
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      height: "50%",
      paddingHorizontal: 6,
    },
    containerBtn: {
      display: "flex",
      flexDirection: "row",
      paddingTop: spacing["6"],
      paddingLeft: spacing[22],
      paddingRight: spacing["22"],
      justifyContent: "center",
      // paddingBottom: spacing['24']
    },
    btn: {
      backgroundColor: colors["primary-surface-default"],
      borderRadius: spacing["8"],
      marginLeft: 10,
      marginRight: 10,
    },
    btnTransfer: {
      flexDirection: "row",
      alignItems: "center",
      paddingTop: spacing["6"],
      paddingBottom: spacing["6"],
      paddingLeft: spacing["12"],
      paddingRight: spacing["12"],
    },
    transactionListEmpty: {
      justifyContent: "center",
      alignItems: "center",
    },
  });
};
