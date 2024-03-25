import React, { FunctionComponent, useEffect } from "react";
import { RouteProp, useRoute } from "@react-navigation/native";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import _ from "lodash";
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
import {
  capitalizedText,
  formatContractAddress,
  openLink,
} from "@src/utils/helper";
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
import { AppCurrency, StdFee } from "@owallet/types";
import { CoinPrimitive } from "@owallet/stores";
import { CoinPretty, Dec } from "@owallet/unit";
import { Bech32Address } from "@owallet/cosmos";

export const TxFailedResultScreen: FunctionComponent = observer(() => {
  const { chainStore, priceStore } = useStore();

  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          chainId?: string;
          // Hex encoded bytes.
          txHash: string;
          data?: {
            memo: string;
            fee: StdFee;
            fromAddress: string;
            toAddress: string;
            amount: CoinPrimitive;
            currency: AppCurrency;
          };
        }
      >,
      string
    >
  >();

  const { current } = chainStore;
  const chainId = current.chainId;
  const { params } = route;

  const { colors, images } = useTheme();
  const smartNavigation = useSmartNavigation();
  const chainInfo = chainStore.getChain(chainId);

  const onDone = () => {
    smartNavigation.dispatch(
      CommonActions.reset({
        index: 1,
        routes: [{ name: "MainTab" }],
      })
    );
  };
  const amount = new CoinPretty(
    params?.data?.currency,
    new Dec(params?.data?.amount?.amount)
  );
  const fee = new CoinPretty(
    chainInfo.stakeCurrency,
    new Dec(params?.data?.fee.amount?.[0]?.amount)
  );
  const dataItem =
    params?.data &&
    _.pickBy(params?.data, function (value, key) {
      return (
        key !== "memo" &&
        key !== "fee" &&
        key !== "amount" &&
        key !== "currency"
      );
    });

  return (
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
            onPressApprove={onDone}
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
              {`${amount?.shrink(true)?.trim(true)?.toString()}`}
            </Text>
            <Text
              color={colors["neutral-text-body"]}
              style={{
                textAlign: "center",
              }}
            >
              {priceStore.calculatePrice(amount)?.toString()}
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
            {dataItem &&
              Object.keys(dataItem).map(function (key) {
                return (
                  <ItemReceivedToken
                    label={capitalizedText(key)}
                    valueDisplay={
                      dataItem?.[key] &&
                      formatContractAddress(dataItem?.[key], 20)
                    }
                    value={dataItem?.[key]}
                  />
                );
              })}
            <ItemReceivedToken
              label={"Fee"}
              valueDisplay={`${fee
                ?.shrink(true)
                ?.trim(true)
                ?.toString()} (${priceStore.calculatePrice(fee)})`}
              btnCopy={false}
            />
            <ItemReceivedToken
              label={"Memo"}
              valueDisplay={params?.data?.memo || "-"}
              btnCopy={false}
            />
          </View>
        </ScrollView>
      </View>
    </PageWithBottom>
  );
});
