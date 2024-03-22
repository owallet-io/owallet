import React, { FunctionComponent } from "react";
import { RouteProp, useRoute } from "@react-navigation/native";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { PageWithView } from "../../components/page";
import { View, Image, TouchableOpacity, ScrollView } from "react-native";
import { Text } from "@src/components/text";
import { useSmartNavigation } from "../../navigation.provider";
import { OWBox } from "../../components/card";
import { metrics } from "../../themes";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CommonActions } from "@react-navigation/native";
import { useTheme } from "@src/themes/theme-provider";
import { openLink } from "../../utils/helper";
import imagesAssets from "@src/assets/images";
import { TRON_ID } from "@owallet/common";
import { PageWithBottom } from "@src/components/page/page-with-bottom";
import OWButtonGroup from "@src/components/button/OWButtonGroup";
import OWIcon from "@src/components/ow-icon/ow-icon";
import { PageHeader } from "@src/components/header/header-new";
import image from "@src/assets/images";
import OWCard from "@src/components/card/ow-card";
import OWText from "@src/components/text/ow-text";
import ItemReceivedToken from "@src/screens/transactions/components/item-received-token";
import OWButtonIcon from "@src/components/button/ow-button-icon";

export const TxSuccessResultScreen: FunctionComponent = observer(() => {
  const { chainStore } = useStore();
  // // const [successAnimProgress] = React.useState(new Animated.Value(0));
  // // const [pangpareAnimProgress] = React.useState(new Animated.Value(0));
  const { colors, images } = useTheme();
  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          chainId?: string;
          // Hex encoded bytes.
          txHash?: string;
        }
      >,
      string
    >
  >();

  const chainId = route.params?.chainId
    ? route.params?.chainId
    : chainStore.current?.chainId;
  const txHash = route.params?.txHash;

  const smartNavigation = useSmartNavigation();

  const chainInfo = chainStore.getChain(chainId);

  const onExplorer = () => {
    alert("on explorer");
  };
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
            labelApprove={"Done"}
            labelClose={"View on Explorer"}
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
                backgroundColor: colors["hightlight-surface-subtle"],
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
                color={colors["hightlight-text-title"]}
              >
                Success
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
              label={"Network"}
              valueDisplay={
                <View
                  style={{
                    flexDirection: "row",
                    paddingTop: 6,
                  }}
                >
                  <Image
                    style={{
                      height: 20,
                      width: 20,
                    }}
                    source={{
                      uri: "https://s2.coinmarketcap.com/static/img/coins/64x64/7533.png",
                    }}
                  />
                  <Text
                    size={16}
                    color={colors["neutral-text-body"]}
                    weight={"400"}
                    style={{
                      paddingLeft: 3,
                    }}
                  >
                    Oraichain
                  </Text>
                </View>
              }
              value={"orai1gh8...kszasmp"}
              btnCopy={false}
            />
            <ItemReceivedToken
              label={"Fee"}
              valueDisplay={"0.006 ORAI ($0.042)"}
              value={"orai1gh8...kszasmp"}
              btnCopy={false}
            />
            <ItemReceivedToken
              label={"Time"}
              valueDisplay={"Dec 8, 2023 at 05:43"}
              value={"orai1gh8...kszasmp"}
              btnCopy={false}
            />
            <ItemReceivedToken
              label={"Memo"}
              valueDisplay={"-"}
              value={"orai1gh8...kszasmp"}
              btnCopy={false}
            />
            <ItemReceivedToken
              label={"Hash"}
              valueDisplay={"38DH83O...D92H9KL"}
              value={"orai1gh8...kszasmp"}
              btnCopy={false}
              IconRightComponent={
                <View>
                  <OWButtonIcon
                    name="copy"
                    // style={{
                    //   width: 20,
                    //   height: 20
                    // }}
                    sizeIcon={20}
                    fullWidth={false}
                    onPress={onExplorer}
                    colorIcon={colors["neutral-text-action-on-light-bg"]}
                  />
                </View>
              }
            />
          </View>
        </ScrollView>
      </View>
    </PageWithBottom>
  );
});
