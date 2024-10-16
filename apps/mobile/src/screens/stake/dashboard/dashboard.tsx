import OWCard from "@src/components/card/ow-card";
import OWIcon from "@src/components/ow-icon/ow-icon";
import OWText from "@src/components/text/ow-text";
import { EarningCardNew } from "@src/screens/home/components/earning-card-new";
import { useTheme } from "@src/themes/theme-provider";
import { observer } from "mobx-react-lite";
import React, { FunctionComponent } from "react";
import { Image, StyleSheet, View } from "react-native";
import { PageWithScrollViewInBottomTabView } from "../../../components/page";
import { useStore } from "../../../stores";
import { ValidatorList } from "../validator-list/new-list";
import { metrics } from "@src/themes";
import { OWButton } from "@src/components/button";
import { UndelegationsCard } from "./undelegations-card";
import { NetworkModal } from "@src/screens/home/components";
import { StakingInfraScreen } from "./stake-infra";
import { RouteProp, useRoute } from "@react-navigation/native";
import { ECOSYSTEM_NFT_CHAIN } from "@screens/nfts/hooks/useNfts";

export const StakingDashboardScreen: FunctionComponent = observer(() => {
  const {
    chainStore,
    accountStore,
    queriesStore,
    priceStore,
    modalStore,
    appInitStore,
  } = useStore();
  useRoute();
  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          chainId: string;
        }
      >,
      string
    >
  >();
  const { colors } = useTheme();
  const styles = styling(colors);
  const account = accountStore.getAccount(route.params?.chainId);
  const queries = queriesStore.get(route.params?.chainId);

  const queryDelegated = queries.cosmos.queryDelegations.getQueryBech32Address(
    account.bech32Address
  );
  const delegated = queryDelegated.total;

  // const _onPressNetworkModal = () => {
  //     modalStore.setOptions({
  //         bottomSheetModalConfig: {
  //             enablePanDownToClose: false,
  //             enableOverDrag: false,
  //         },
  //     });
  //     modalStore.setChildren(<NetworkModal/>);
  // };

  return (
    <PageWithScrollViewInBottomTabView
      showsVerticalScrollIndicator={false}
      backgroundColor={colors["neutral-surface-bg"]}
    >
      <>
        <OWCard
          style={{
            padding: 24,
            borderBottomLeftRadius: 8,
            borderBottomRightRadius: 8,
            backgroundColor: colors["neutral-surface-card"],
          }}
        >
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <View>
              <View style={{ flexDirection: "row" }}>
                <View style={styles["claim-title"]}>
                  <OWIcon
                    name={"tdesignmoney"}
                    size={14}
                    color={colors["neutral-text-title"]}
                  />
                </View>
                <OWText style={[{ ...styles["text-earn"] }]}>Staked</OWText>
              </View>

              <OWText
                style={[
                  {
                    ...styles["text-amount"],
                    paddingTop: 8,
                  },
                ]}
              >
                {priceStore.calculatePrice(delegated)?.toString() ?? 0}
              </OWText>
              <OWText style={[styles["amount"]]}>
                {delegated
                  .shrink(true)
                  .maxDecimals(6)
                  .trim(true)
                  .upperCase(true)
                  .toString()}
              </OWText>
            </View>
            <Image
              style={{
                width: 120,
                height: 68,
              }}
              source={require("../../../assets/images/img_invest.png")}
              resizeMode="contain"
              fadeDuration={0}
            />
          </View>
          <UndelegationsCard />
        </OWCard>

        <EarningCardNew />
        <ValidatorList />
      </>
      {/* <View*/}
      {/*//   style={{*/}
      {/*//     position: "relative",*/}
      {/*//   }}*/}
      {/*// >*/}
      {/*//   <Image*/}
      {/*//     style={{*/}
      {/*//       width: metrics.screenWidth,*/}
      {/*//       height: metrics.screenHeight / 3,*/}
      {/*//       position: "absolute",*/}
      {/*//       top: 0,*/}
      {/*//     }}*/}
      {/*//     source={require("../../../assets/image/img-bg.png")}*/}
      {/*//   />*/}
      {/*//   <View*/}
      {/*//     style={{*/}
      {/*//       justifyContent: "center",*/}
      {/*//       alignItems: "center",*/}
      {/*//       width: metrics.screenWidth,*/}
      {/*//       height: metrics.screenHeight / 1.4,*/}
      {/*//     }}*/}
      {/*//   >*/}
      {/*//     <Image*/}
      {/*//       style={{*/}
      {/*//         width: 140,*/}
      {/*//         height: 140,*/}
      {/*//       }}*/}
      {/*//       source={require("../../../assets/image/img_search.png")}*/}
      {/*//       resizeMode="contain"*/}
      {/*//       fadeDuration={0}*/}
      {/*//     />*/}
      {/*//     <View*/}
      {/*//       style={{ alignItems: "center", margin: 24, marginBottom: 32 }}*/}
      {/*//     >*/}
      {/*//       <OWText size={22} weight={"700"}>*/}
      {/*//         {appInitStore.getInitApp.isAllNetworks*/}
      {/*//           ? `Looking for Validators?`.toUpperCase()*/}
      {/*//           : `NOT SUPPORTED YET`}*/}
      {/*//       </OWText>*/}
      {/*//       <OWText*/}
      {/*//         size={14}*/}
      {/*//         color={colors["neutral-text-body"]}*/}
      {/*//         weight={"500"}*/}
      {/*//         style={{*/}
      {/*//           textAlign: "center",*/}
      {/*//           paddingTop: 4,*/}
      {/*//         }}*/}
      {/*//       >{`${*/}
      {/*//         appInitStore.getInitApp.isAllNetworks*/}
      {/*//           ? "Please choose a network."*/}
      {/*//           : "Please try switching networks or exploring other functions."*/}
      {/*//       }`}</OWText>*/}
      {/*//     </View>*/}
      {/*//*/}
      {/*//     <OWButton*/}
      {/*//       textStyle={{*/}
      {/*//         color: colors["neutral-text-action-on-dark-bg"],*/}
      {/*//         fontSize: 14,*/}
      {/*//         fontWeight: "500",*/}
      {/*//       }}*/}
      {/*//       style={{*/}
      {/*//         width: metrics.screenWidth / 2.5,*/}
      {/*//         borderRadius: 999,*/}
      {/*//         padding: 8,*/}
      {/*//       }}*/}
      {/*//       label="Choose network"*/}
      {/*//       onPress={() => {*/}
      {/*//         _onPressNetworkModal();*/}
      {/*//       }}*/}
      {/*//     />*/}
      {/*//   </View>*/}
      {/*// </View>*/}
    </PageWithScrollViewInBottomTabView>
  );
});

const styling = (colors) =>
  StyleSheet.create({
    containerEarnStyle: {
      backgroundColor: colors["neutral-surface-bg2"],
      margin: 0,
    },
    "text-earn": {
      fontWeight: "600",
      fontSize: 16,
      lineHeight: 24,
      color: colors["neutral-text-title"],
    },
    "claim-title": {
      width: 24,
      height: 24,
      borderRadius: 24,
      backgroundColor: colors["neutral-surface-action"],
      marginRight: 5,
      alignItems: "center",
      justifyContent: "center",
    },

    "text-amount": {
      fontWeight: "500",
      fontSize: 28,
      lineHeight: 34,
    },

    amount: {
      fontWeight: "400",
      fontSize: 14,
      lineHeight: 20,
      color: colors["neutral-text-title"],
    },
  });
