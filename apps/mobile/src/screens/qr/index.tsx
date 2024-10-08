import React, { FunctionComponent, useEffect, useState } from "react";
import { Clipboard, Image, Share, StyleSheet, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { metrics, spacing } from "@src/themes";
import { PageWithBottom } from "@src/components/page/page-with-bottom";
import { ScrollView } from "react-native-gesture-handler";
import OWText from "@src/components/text/ow-text";
import OWIcon from "@src/components/ow-icon/ow-icon";
import { TouchableOpacity } from "@gorhom/bottom-sheet";
import { OWButton } from "@src/components/button";
import { useStore } from "@src/stores";
import { useTheme } from "@src/themes/theme-provider";
import { CheckIcon, DownArrowIcon } from "@src/components/icon";
import { chainIcons } from "@oraichain/oraidex-common";
import { useSimpleTimer } from "@src/hooks";
import { CopyAddressModal } from "../home/components/copy-address/copy-address-modal";
import { RouteProp, useRoute } from "@react-navigation/native";
import { observer } from "mobx-react-lite";
import { tracking } from "@src/utils/tracking";
import { ChainInfoInner } from "@owallet/stores";
import { ChainInfoWithEmbed } from "@owallet/background";
import { unknownToken } from "@owallet/common";

const styling = (colors) =>
  StyleSheet.create({
    sendInputRoot: {
      paddingHorizontal: spacing["20"],
      paddingVertical: spacing["24"],
      backgroundColor: colors["primary"],
      borderRadius: 24,
    },
    sendlabelInput: {
      fontSize: 14,
      fontWeight: "500",
      lineHeight: 20,
      color: colors["neutral-text-body"],
    },
    containerStyle: {
      backgroundColor: colors["neutral-surface-card"],
    },
    bottomBtn: {
      marginTop: 20,
      width: metrics.screenWidth / 2.3,
      borderRadius: 999,
    },
  });

export const AddressQRScreen: FunctionComponent<{}> = observer(({}) => {
  const { chainStore, keyRingStore, accountStore, modalStore } = useStore();

  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          chainId: any;
        }
      >,
      string
    >
  >();
  const params = route.params;
  const chainInfo = chainStore.getChain(
    params?.chainId ? params?.chainId : chainStore.current.chainId
  );

  const [network, setNetwork] =
    useState<ChainInfoInner<ChainInfoWithEmbed>>(chainInfo);
  const account = accountStore.getAccount(
    network?.chainId || params?.chainId || chainStore.current.chainId
  );
  const [isBtcLegacy, setIsBtcLegacy] = useState<boolean>(false);
  const addressToShow = isBtcLegacy
    ? account.legacyAddress
    : account.getAddressDisplay(keyRingStore.keyRingLedgerAddresses);
  const [isOpen, setModalOpen] = useState(false);

  const { colors } = useTheme();
  const styles = styling(colors);
  const { isTimedOut, setTimer } = useSimpleTimer();
  useEffect(() => {
    tracking(`Address QR Code Screen`);
    return () => {};
  }, []);

  const onPressAddress = (item) => {
    setNetwork(item);
    setModalOpen(false);
  };

  return (
    <PageWithBottom
      bottomGroup={
        <OWButton
          label="Share Address"
          disabled={!addressToShow ? true : false}
          onPress={() => {
            Share.share({
              message: addressToShow,
            }).catch((e) => {
              console.log(e);
            });
          }}
          style={[
            styles.bottomBtn,
            {
              width: metrics.screenWidth - 32,
            },
          ]}
          textStyle={{
            fontSize: 14,
            fontWeight: "600",
            color: colors["neutral-text-action-on-dark-bg"],
          }}
        />
      }
    >
      <CopyAddressModal
        copyable={false}
        close={() => setModalOpen(false)}
        isOpen={isOpen}
        onPress={(item, isBtcLegacy) => {
          onPressAddress(item);
          setIsBtcLegacy(isBtcLegacy);
        }}
        bottomSheetModalConfig={{
          enablePanDownToClose: false,
          enableOverDrag: false,
        }}
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ alignItems: "center", justifyContent: "center" }}>
          <OWText color={colors["neutral-text-title"]} size={14}>
            Scan QR code or share address to sender
          </OWText>
          <View
            style={{
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <TouchableOpacity
              onPress={() => {
                setModalOpen(true);
              }}
              style={{
                flexDirection: "row",
                backgroundColor: colors["neutral-surface-action3"],
                borderRadius: 999,
                paddingHorizontal: 14,
                paddingVertical: 12,
                maxWidth: metrics.screenWidth / 2,
                marginTop: 12,
                alignItems: "center",
              }}
            >
              <View
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 999,
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  backgroundColor: colors["neutral-icon-on-dark"],
                }}
              >
                <OWIcon
                  type="images"
                  source={{
                    uri:
                      network?.chainSymbolImageUrl || unknownToken.coinImageUrl,
                  }}
                  size={16}
                  style={{
                    borderRadius: 999,
                  }}
                />
              </View>

              <OWText style={{ paddingHorizontal: 4 }} weight="600" size={14}>
                {network?.chainName}
              </OWText>
              <DownArrowIcon height={11} color={colors["primary-text"]} />
            </TouchableOpacity>
            <View style={{ marginTop: 24 }}>
              <View
                style={{
                  position: "absolute",
                  alignSelf: "center",
                }}
              >
                <Image
                  style={{
                    width: metrics.screenHeight / 3.2,
                    height: metrics.screenHeight / 3.2,
                  }}
                  source={require("../../assets/image/img_qr.png")}
                  resizeMode="contain"
                  fadeDuration={0}
                />
              </View>
              <View style={{ marginTop: 24, alignSelf: "center" }}>
                {addressToShow ? (
                  <QRCode
                    size={metrics.screenHeight / 4.2}
                    value={addressToShow}
                  />
                ) : null}
              </View>
            </View>
          </View>

          <View
            style={{
              marginTop: metrics.screenHeight / 10,
              alignItems: "center",
            }}
          >
            <View
              style={{
                backgroundColor: colors["neutral-surface-bg"],
                borderRadius: 8,
                paddingHorizontal: 16,
                marginBottom: 16,
              }}
            >
              <OWText color={colors["neutral-text-body"]} size={13}>
                {addressToShow}
              </OWText>
            </View>

            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
              }}
              onPress={() => {
                Clipboard.setString(addressToShow);
                setTimer(2000);
              }}
            >
              {isTimedOut ? (
                <CheckIcon />
              ) : (
                <OWIcon
                  size={14}
                  name="copy"
                  color={colors["primary-text-action"]}
                />
              )}

              <OWText
                style={{ paddingHorizontal: 4 }}
                color={colors["primary-text-action"]}
                weight="600"
                size={14}
              >
                Copy address
              </OWText>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </PageWithBottom>
  );
});
