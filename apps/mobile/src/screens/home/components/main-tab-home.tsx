import React, { FC, useState } from "react";
import { useTheme } from "@src/themes/theme-provider";
import { observer } from "mobx-react-lite";
import { StyleSheet, View } from "react-native";
import { OWBox } from "@components/card";
import { OWButton } from "@src/components/button";
import { HistoryCard } from "@src/screens/transactions";
import { TokensCardAll } from "./tokens-card-all";
import { NftCard } from "./nft-card";

export const MainTabHome: FC<{}> = observer(() => {
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const styles = styling(colors);
  const renderContentTab = () => {
    switch (activeTab.id) {
      case TabEnum.TOKEN:
        return <TokensCardAll />;
      case TabEnum.NFT:
        return <NftCard />;
      case TabEnum.History:
        return <HistoryCard />;
    }
  };
  return (
    <View style={styles.container}>
      <OWBox style={styles.boxContainer}>
        <View style={styles.wrapHeaderTitle}>
          {tabs.map((item, index) => (
            <OWButton
              key={index.toString()}
              type="link"
              label={item.name}
              textStyle={{
                ...styles.titleTab,
                color:
                  activeTab.id === item.id
                    ? colors["neutral-text-title"]
                    : colors["neutral-text-body"],
              }}
              onPress={() => {
                setActiveTab(item);
              }}
              style={[
                {
                  flex: 1,
                  borderRadius: 0,
                },
                activeTab.id === item.id ? styles.active : styles.inactive,
              ]}
            />
          ))}
        </View>
        {renderContentTab()}
      </OWBox>
    </View>
  );
});

const styling = (colors) =>
  StyleSheet.create({
    wrapHeaderTitle: {
      flexDirection: "row",
      paddingBottom: 12,
    },
    titleTab: {
      fontWeight: "600",
      fontSize: 16,
    },
    boxContainer: {
      paddingTop: 12,
      backgroundColor: colors["neutral-surface-card"],
      paddingHorizontal: 0,
    },
    container: {
      // marginBottom: 60,
    },
    pl12: {
      paddingLeft: 12,
    },
    leftBoxItem: {
      flexDirection: "row",
    },
    rightBoxItem: {
      alignItems: "flex-end",
    },
    wraperItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginVertical: 8,
      marginHorizontal: 16,
    },
    btnItem: {
      borderBottomColor: colors["neutral-border-default"],
      borderBottomWidth: 1,
    },
    profit: {
      fontWeight: "400",
      lineHeight: 20,
    },
    iconWrap: {
      width: 44,
      height: 44,
      borderRadius: 999,
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
      backgroundColor: colors["neutral-icon-on-dark"],
    },
    chainWrap: {
      width: 22,
      height: 22,
      borderRadius: 32,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors["neutral-icon-on-dark"],
      position: "absolute",
      bottom: -6,
      left: 26,
      top: 26,
      borderWidth: 1,
      borderColor: colors["neutral-border-bold"],
    },
    active: {
      borderBottomColor: colors["neutral-border-bold"],
      borderBottomWidth: 2,
    },
    inactive: {
      borderBottomColor: colors["neutral-border-default"],
      borderBottomWidth: 1,
    },
    type: {
      backgroundColor: colors["neutral-surface-action2"],
      borderRadius: 4,
      paddingHorizontal: 8,
      paddingVertical: 2,
      marginHorizontal: 2,
      alignItems: "center",
    },
  });
enum TabEnum {
  TOKEN = 0,
  NFT = 1,
  History = 2,
}
const tabs = [
  {
    name: "Tokens",
    id: TabEnum.TOKEN,
  },
  {
    name: "NFT",
    id: TabEnum.NFT,
  },
  {
    name: "History",
    id: TabEnum.History,
  },
];
