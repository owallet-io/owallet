import React, { FunctionComponent, useMemo } from "react";
import { Button, OWButton } from "../../../components/button";
import { Share, StyleSheet, View } from "react-native";
import { CardModal } from "../../../modals/card";
import { AddressCopyable } from "../../../components/address-copyable";
import QRCode from "react-native-qrcode-svg";
import { colors, spacing, typography } from "../../../themes";
import { AccountWithAll, KeyRingStore } from "@owallet/stores";
import { Text } from "@src/components/text";
export const AddressQRCodeModal: FunctionComponent<{
  account?: AccountWithAll;
  address?: string;
  chainStore?: any;
  keyRingStore?: KeyRingStore;
}> = ({ account, address, keyRingStore }) => {
  const addressToShow = account.getAddressDisplay(
    keyRingStore.keyRingLedgerAddresses
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
