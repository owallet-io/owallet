import { useRegisterConfig } from "@owallet/hooks";
import { useRoute } from "@react-navigation/native";
import OWIcon from "@src/components/ow-icon/ow-icon";
import OWText from "@src/components/text/ow-text";
import { useTheme } from "@src/themes/theme-provider";
import { observer } from "mobx-react-lite";
import React, { FunctionComponent } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import OWButton from "../../components/button/OWButton";

import { useStore } from "../../stores";
import { metrics } from "../../themes";
import { goBack, navigate } from "@src/router/root";
import { SCREENS } from "@src/common/constants";

export const RegisterIntroScreen: FunctionComponent = observer((props) => {
  const { keyRingStore, analyticsStore } = useStore();
  const { colors } = useTheme();

  const route = useRoute();

  // const registerConfig = useRegisterConfig(keyRingStore, []);
  const handleImportFromMnemonic = () => {
    analyticsStore.logEvent("Import account started", {
      registerType: "seed",
    });

    navigate(SCREENS.RegisterRecoverPhrase);
  };
  const handleImportLedgerNanoX = () => {
    navigate(SCREENS.RegisterNewLedger);
  };
  const handleCreateANewWallet = () => {
    analyticsStore.logEvent("Create account started", {
      registerType: "seed",
    });

    navigate(SCREENS.RegisterNewMnemonic);
  };
  const styles = useStyles();

  return (
    <View style={[styles.container]}>
      <View style={styles.containerCheck}>
        <Image
          style={{
            width: metrics.screenWidth,
            height: metrics.screenWidth,
          }}
          source={require("../../assets/image/img-bg.png")}
          resizeMode="contain"
          fadeDuration={0}
        />
      </View>
      <ScrollView style={styles.content}>
        {route.params?.canBeBack ? (
          <TouchableOpacity
            onPress={() => {
              goBack();
            }}
            style={{
              backgroundColor: colors["neutral-surface-card"],
              borderRadius: 999,
              width: 44,
              height: 44,
              alignItems: "center",
              justifyContent: "center",
              marginHorizontal: 16,
            }}
          >
            <OWIcon
              size={16}
              color={colors["neutral-icon-on-light"]}
              name="arrow-left"
            />
          </TouchableOpacity>
        ) : null}

        <View style={styles.boardingTitleContainer}>
          <View style={styles.boardingIcon}>
            <Image
              source={require("../../assets/logo/splash-image.png")}
              style={styles.logo}
            />
          </View>

          <View>
            <OWText
              size={18}
              weight={"800"}
              color={colors["neutral-text-title"]}
            >
              OWallet
            </OWText>
          </View>
        </View>
        <View style={styles.logo_owallet}>
          <Image
            source={require("../../assets/image/img_owallet.png")}
            fadeDuration={0}
            resizeMode="contain"
            style={styles.img}
          />
        </View>
        <View style={styles.containerHeader}>
          <View style={styles.desscription}>
            <OWText
              style={styles.label}
              weight="800"
              color={colors["neutral-text-title"]}
            >
              UNIVERSAL
            </OWText>
            <OWText
              style={styles.label}
              weight="800"
              color={colors["neutral-text-title"]}
            >
              CRYPTO WALLET
            </OWText>
            <OWText
              style={styles.subtitle}
              variant="body2"
              typo="regular"
              color={colors["neutral-text-body"]}
            >
              Connecting people to crypto world
            </OWText>
          </View>
        </View>
        <View style={{ paddingHorizontal: 42 }}>
          <OWButton
            style={styles.btnOW}
            size="default"
            label="Create a new wallet"
            onPress={handleCreateANewWallet}
          />
          <OWButton
            style={styles.btnOW}
            label="Import Ledger Nano X"
            onPress={handleImportLedgerNanoX}
            type="secondary"
            size="default"
          />
          <OWButton
            style={styles.btnOW}
            label="Import from Mnemonic / Private key"
            onPress={handleImportFromMnemonic}
            type="secondary"
            size="default"
          />
        </View>
      </ScrollView>
    </View>
  );
});

const useStyles = () => {
  const { colors } = useTheme();
  return StyleSheet.create({
    btnOW: {
      marginBottom: 8,
      borderRadius: 999,
    },
    containerUnion: { paddingTop: 20, paddingBottom: 16 },
    title: {
      fontWeight: "700",
      fontSize: 24,
      color: colors["label"],
      lineHeight: 34,
      paddingBottom: 8,
    },
    containerHeader: {
      alignItems: "center",
      padding: 18,
    },
    containerBtn: {
      width: metrics.screenWidth - 86,
    },
    textBtn: {
      textAlign: "center",
      fontWeight: "700",
      fontSize: 16,
      padding: 16,
    },
    container: {
      backgroundColor: colors["neutral-surface-card"],
      height: metrics.screenHeight,
    },
    containerCheck: {
      position: "absolute",
      top: 0,
      zIndex: -1,
    },
    content: {
      paddingTop: 60,
    },
    desscription: {
      alignItems: "center",
    },
    label: {
      fontSize: 28,
    },
    subtitle: {
      textAlign: "center",
    },
    boardingTitleContainer: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      paddingTop: 16,
    },
    boardingIcon: {
      marginLeft: 4,
    },
    logo: {
      width: 22,
      height: 22,
      marginRight: 4,
    },
    img: {
      width: metrics.screenWidth / 2.5,
      height: metrics.screenWidth / 2.5,
    },
    logo_owallet: {
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: 32,
    },
  });
};
