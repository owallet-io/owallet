import React, { FunctionComponent, useMemo, useState } from "react";
import { Clipboard, Image, Share, StyleSheet, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { AccountWithAll, KeyRingStore } from "@owallet/stores";
import { Text } from "@src/components/text";
import { metrics, spacing } from "@src/themes";
import { PageWithBottom } from "@src/components/page/page-with-bottom";
import { PageHeader } from "@src/components/header/header-new";
import { ScrollView } from "react-native-gesture-handler";
import OWCard from "@src/components/card/ow-card";
import OWText from "@src/components/text/ow-text";
import OWIcon from "@src/components/ow-icon/ow-icon";
import { TouchableOpacity } from "@gorhom/bottom-sheet";
import { OWButton } from "@src/components/button";
import { AddressCopyable } from "@src/components/address-copyable";
import { useStore } from "@src/stores";
import { useTheme } from "@src/themes/theme-provider";
import { CheckIcon, DownArrowIcon } from "@src/components/icon";
import { chainIcons } from "@oraichain/oraidex-common";
import { useSimpleTimer } from "@src/hooks";

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

export const AddressQRScreen: FunctionComponent<{}> = ({}) => {
  const { chainStore, keyRingStore, accountStore } = useStore();
  const account = accountStore.getAccount(chainStore.current.chainId);

  const addressToShow = account.getAddressDisplay(
    keyRingStore.keyRingLedgerAddresses
  );
  const [address, setAddress] = useState(addressToShow);
  const { colors } = useTheme();
  const styles = styling(colors);
  const { isTimedOut, setTimer } = useSimpleTimer();

  const chainIcon = chainIcons.find(
    (c) => c.chainId === chainStore.current.chainId
  );

  return (
    <PageWithBottom
      bottomGroup={
        <OWButton
          label="Share Address"
          loading={addressToShow === ""}
          disabled={addressToShow === ""}
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
          }}
        />
      }
    >
      <PageHeader title="Receive" colors={colors} />
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
              onPress={() => {}}
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
              <OWIcon
                type="images"
                source={{ uri: chainIcon?.Icon }}
                size={16}
              />
              <OWText style={{ paddingHorizontal: 4 }} weight="600" size={14}>
                {chainStore.current.chainName}
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
                    width: metrics.screenWidth / 1.6,
                    height: metrics.screenWidth / 1.6,
                  }}
                  source={require("../../assets/image/img_qr.png")}
                  resizeMode="contain"
                  fadeDuration={0}
                />
              </View>
              <View style={{ marginTop: 24 }}>
                <QRCode size={200} value={addressToShow} />
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

  return (
    <View
      style={{
        alignItems: "center",
      }}
    >
      <Text
        style={{
          ...typography.h6,
          fontWeight: "900",
        }}
      >{`Receive`}</Text>
      <View style={{ alignItems: "center" }}>
        <Text
          style={{
            ...typography.h6,
            color: colors["gray-400"],
            fontWeight: "900",
            marginVertical: spacing["16"],
          }}
        >{`Scan QR Code or copy below address`}</Text>
        <AddressCopyable
          address={address ?? addressToShow}
          maxCharacters={22}
        />
        <View style={{ marginVertical: spacing["32"] }}>
          {!!addressToShow ? (
            <QRCode size={200} value={address ?? addressToShow} />
          ) : (
            <View
              style={{
                height: 200,
                width: 200,
                backgroundColor: colors["disabled"],
              }}
            />
          )}
        </View>
        <View style={{ flexDirection: "row" }}>
          <OWButton
            label="Share Address"
            loading={addressToShow === ""}
            disabled={addressToShow === ""}
            onPress={() => {
              Share.share({
                message: address ?? addressToShow,
              }).catch((e) => {
                console.log(e);
              });
            }}
          />
        </View>
      </View>
    </View>
  );
};
