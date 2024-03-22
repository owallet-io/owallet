import React, { FunctionComponent, useEffect } from "react";
import { RouteProp, useRoute } from "@react-navigation/native";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";

import {
  View,
  Animated,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Text } from "@src/components/text";
import { useSmartNavigation } from "../../navigation.provider";
import { RightArrowIcon } from "../../components/icon";
import { Card, OWBox } from "../../components/card";
import { metrics } from "../../themes";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CommonActions } from "@react-navigation/native";
import { useTheme } from "@src/themes/theme-provider";
import { PageWithView } from "@src/components/page";
import imagesAssets from "@src/assets/images";
import { openLink } from "@src/utils/helper";
import { OWButton } from "@src/components/button";
import { PageHeader } from "@src/components/header/header-new";
import image from "@src/assets/images";
import OWCard from "@src/components/card/ow-card";
import ItemReceivedToken from "@src/screens/transactions/components/item-received-token";
import { PageWithBottom } from "@src/components/page/page-with-bottom";
import OWText from "@src/components/text/ow-text";
import OWButtonGroup from "@src/components/button/OWButtonGroup";
import owIcon from "@src/components/ow-icon/ow-icon";
import OWIcon from "@src/components/ow-icon/ow-icon";

export const TxFailedResultScreen: FunctionComponent = observer(() => {
  // const { chainStore } = useStore();
  //
  // const route = useRoute<
  //   RouteProp<
  //     Record<
  //       string,
  //       {
  //         chainId?: string;
  //         // Hex encoded bytes.
  //         txHash: string;
  //       }
  //     >,
  //     string
  //   >
  // >();
  //
  // const chainId = route.params?.chainId
  //   ? route.params?.chainId
  //   : chainStore.current.chainId;
  // const txHash = route.params?.txHash;
  // const { colors, images } = useTheme();
  // const smartNavigation = useSmartNavigation();
  // const chainInfo = chainStore.getChain(chainId);
  // const { bottom } = useSafeAreaInsets();
  const { colors } = useTheme();
  return (
    // <PageWithView>
    //   <OWBox>
    //     <View
    //       style={{
    //         height: metrics.screenHeight - bottom - 74,
    //         paddingTop: 80,
    //       }}
    //     >
    //       <View
    //         style={{
    //           display: "flex",
    //           flexDirection: "row",
    //           alignItems: "center",
    //         }}
    //       >
    //         <Image
    //           style={{
    //             width: 24,
    //             height: 2,
    //           }}
    //           fadeDuration={0}
    //           resizeMode="stretch"
    //           source={images.line_fail_short}
    //         />
    //         <Image
    //           style={{
    //             width: 140,
    //             height: 32,
    //             marginLeft: 8,
    //             marginRight: 9,
    //           }}
    //           fadeDuration={0}
    //           resizeMode="stretch"
    //           source={images.fail}
    //         />
    //         <Image
    //           style={{
    //             width: metrics.screenWidth - 185,
    //             height: 2,
    //           }}
    //           fadeDuration={0}
    //           resizeMode="stretch"
    //           source={images.line_fail_long}
    //         />
    //       </View>
    //       <View
    //         style={{
    //           paddingLeft: 32,
    //           paddingRight: 72,
    //         }}
    //       >
    //         <Text
    //           style={{
    //             fontWeight: "700",
    //             fontSize: 24,
    //             lineHeight: 34,
    //             paddingTop: 44,
    //             paddingBottom: 16,
    //           }}
    //           color={colors["text-title-login"]}
    //         >
    //           Transaction fail
    //         </Text>
    //         <Text
    //           style={{
    //             fontWeight: "400",
    //             fontSize: 14,
    //             lineHeight: 20,
    //             color: colors["primary-text"],
    //           }}
    //         >
    //           Please try again!
    //         </Text>
    //         <Text
    //           style={{
    //             fontWeight: "400",
    //             fontSize: 14,
    //             lineHeight: 20,
    //             color: colors["primary-text"],
    //             paddingTop: 6,
    //           }}
    //         >
    //           The transaction cannot be completed.
    //         </Text>
    //         {chainInfo.raw.txExplorer ? (
    //           <TouchableOpacity
    //             style={{
    //               paddingTop: 32,
    //               display: "flex",
    //               flexDirection: "row",
    //               alignItems: "center",
    //             }}
    //             onPress={async () => {
    //               if (chainInfo.raw.txExplorer) {
    //                 await openLink(
    //                   chainInfo.raw.txExplorer.txUrl.replace(
    //                     "{txHash}",
    //                     txHash.toUpperCase()
    //                   )
    //                 );
    //               }
    //             }}
    //           >
    //             <Image
    //               style={{
    //                 width: 22,
    //                 height: 22,
    //                 tintColor: colors["background-btn-primary"],
    //               }}
    //               fadeDuration={0}
    //               resizeMode="stretch"
    //               source={imagesAssets.eye}
    //             />
    //             <Text
    //               style={{
    //                 paddingLeft: 6,
    //                 color: colors["background-btn-primary"],
    //                 fontWeight: "400",
    //                 fontSize: 16,
    //                 lineHeight: 22,
    //               }}
    //             >
    //               View on Explorer
    //             </Text>
    //           </TouchableOpacity>
    //         ) : null}
    //       </View>
    //       <TouchableOpacity
    //         style={{
    //           marginTop: 32,
    //           marginLeft: 25,
    //           marginRight: 25,
    //           backgroundColor: colors["background-btn-primary"],
    //           borderRadius: 8,
    //         }}
    //         onPress={() => {
    //           smartNavigation.dispatch(
    //             CommonActions.reset({
    //               index: 1,
    //               routes: [{ name: "MainTab" }],
    //             })
    //           );
    //         }}
    //       >
    //         <Text
    //           style={{
    //             color: "white",
    //             textAlign: "center",
    //             fontWeight: "700",
    //             fontSize: 16,
    //             padding: 16,
    //           }}
    //         >
    //           Go Home
    //         </Text>
    //       </TouchableOpacity>
    //     </View>
    //   </OWBox>
    // </PageWithView>
    <PageWithBottom
      bottomGroup={
        <View
          style={{
            width: "100%",
            paddingHorizontal: 16,
            paddingTop: 16,
          }}
        >
          <OWButtonGroup
            labelApprove={"Retry"}
            labelClose={"Contact Us"}
            iconClose={<OWIcon name={"send"} />}
            styleApprove={{
              borderRadius: 99,
              backgroundColor: colors["primary-surface-default"],
            }}
            // onPressClose={_onPressReject}
            // onPressApprove={_onPressApprove}
            styleClose={{
              borderRadius: 99,
              backgroundColor: colors["neutral-surface-action3"],
            }}
          />
        </View>
      }
    >
      <View
        style={{
          flex: 1,
        }}
      >
        <PageHeader
          title={"Transaction detail"}
          colors={colors["neutral-text-title"]}
        />
        <ScrollView showsVerticalScrollIndicator={false}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 8,
            }}
          >
            <Image
              source={image.logo_owallet}
              style={{
                width: 20,
                height: 20,
              }}
            />
            <Text
              color={colors["neutral-text-title"]}
              size={18}
              weight={"600"}
              style={{
                paddingLeft: 8,
              }}
            >
              OWallet
            </Text>
          </View>
          <OWCard
            style={{
              paddingVertical: 20,
              borderRadius: 24,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 2,
            }}
          >
            <Text
              style={{
                textAlign: "center",
                paddingBottom: 8,
              }}
              color={colors["neutral-text-title"]}
              size={16}
              weight={"500"}
            >
              Send
            </Text>
            <View
              style={{
                backgroundColor: colors["error-surface-subtle"],
                width: "100%",
                paddingHorizontal: 12,
                paddingVertical: 2,
                borderRadius: 99,
                alignSelf: "center",
              }}
            >
              <OWText
                weight={"500"}
                size={14}
                color={colors["error-text-body"]}
              >
                Failed
              </OWText>
            </View>
            <Text
              color={colors["neutral-text-title"]}
              style={{
                textAlign: "center",
                paddingTop: 16,
              }}
              size={28}
              weight={"500"}
            >
              -157,088.99 ORAI
            </Text>
            <Text
              color={colors["neutral-text-body"]}
              style={{
                textAlign: "center",
              }}
            >
              $524.23
            </Text>
          </OWCard>
          <View
            style={{
              padding: 16,
              borderRadius: 24,
              marginHorizontal: 16,
              backgroundColor: colors["neutral-surface-card"],
            }}
          >
            <ItemReceivedToken
              label={"From"}
              valueDisplay={"orai1gh8...kszasmp"}
              value={"orai1gh8...kszasmp"}
            />
            <ItemReceivedToken
              label={"To"}
              valueDisplay={"orai1gh8...kszasmp"}
              value={"orai1gh8...kszasmp"}
            />
            <ItemReceivedToken
              label={"Fee"}
              valueDisplay={"0.006 ORAI ($0.042)"}
              value={"orai1gh8...kszasmp"}
              btnCopy={false}
            />
            <ItemReceivedToken
              label={"Memo"}
              valueDisplay={"-"}
              value={"orai1gh8...kszasmp"}
              btnCopy={false}
            />
          </View>
        </ScrollView>
      </View>
    </PageWithBottom>
  );
});
