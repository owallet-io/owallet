import React, { FunctionComponent } from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "@src/components/text";
import { TouchableOpacity } from "react-native-gesture-handler";
import {
  SendBridgeIcon,
  SendCrossChainIcon,
  SendQRCodeIcon,
  SendWithinNetworkIcon,
} from "../../components/icon";
import { spacing } from "../../themes";
import { useSmartNavigation } from "../../navigation.provider";
import { useStore } from "../../stores";
import { useTheme } from "@src/themes/theme-provider";
import { OWBox } from "@src/components/card";
import { TRON_ID } from "@owallet/common";
import { useNavigation } from "@react-navigation/native";

const styling = (colors) =>
  StyleSheet.create({
    sendTokenCard: {
      borderRadius: spacing["24"],
    },
    sendTokenCardbody: {
      display: "flex",
      flexDirection: "row",
      flexWrap: "wrap",
      marginHorizontal: spacing["-6"],
      justifyContent: "space-between",
    },
    sendTokenCardContent: {
      width: "47%",
      padding: 0,
      marginTop: 12,
    },
    sendTokenCardText: {
      height: 130,
      alignItems: "center",
      justifyContent: "center",
    },
    iconSendToken: {
      marginBottom: spacing["6"],
    },
    textSendToken: {
      fontWeight: "800",
      fontSize: 14,
      color: colors["label"],
    },
  });

const tokenTransferInfo = [
  {
    icon: <SendWithinNetworkIcon />,
    titleLine1: "Send",
    type: "send",
    titleLine2: "within network",
  },
  {
    icon: <SendCrossChainIcon />,
    titleLine1: "Universal Swap",
    type: "send_cross",
  },
  // {
  //   icon: <SendBridgeIcon />,
  //   titleLine1: 'Bridge',
  //   type: 'bridge',
  //   titleLine2: ''
  // },
  {
    icon: <SendQRCodeIcon />,
    titleLine1: "Send",
    type: "send_qr",
    titleLine2: "via QR code",
  },
];

const TransferTokensOptions: FunctionComponent = () => {
  const smartNavigation = useSmartNavigation();
  const navigation = useNavigation();
  const { chainStore } = useStore();
  const { colors } = useTheme();
  const styles = styling(colors);
  const onPress = (type) => {
    switch (type) {
      case "send":
        if (chainStore.current.chainId === TRON_ID) {
          smartNavigation.navigateSmart("SendTron", {
            currency: chainStore.current.stakeCurrency.coinMinimalDenom,
          });
        } else {
          smartNavigation.navigateSmart("Send", {
            currency: chainStore.current.stakeCurrency.coinMinimalDenom,
          });
        }

        break;
      case "send_qr":
        smartNavigation.navigateSmart("Camera", {
          currency: chainStore.current.stakeCurrency.coinMinimalDenom,
        });
        break;
      case "send_cross":
        navigation.navigate("UniversalSwapScreen", {});
        break;
      default:
        alert("Coming soon!");
        break;
    }
  };

  return (
    <>
      <View style={styles.sendTokenCardbody}>
        {tokenTransferInfo.map((val, i) => (
          <OWBox type="shadow" style={styles.sendTokenCardContent} key={i}>
            <TouchableOpacity
              style={styles.sendTokenCardText}
              onPress={() => onPress(val.type)}
            >
              <View style={styles.iconSendToken}>{val.icon}</View>
              <Text style={styles.textSendToken}>{val.titleLine1}</Text>
              <Text style={styles.textSendToken}>{val.titleLine2}</Text>
            </TouchableOpacity>
          </OWBox>
        ))}
      </View>
    </>
  );
};

export default TransferTokensOptions;
