import { OWEmpty } from "@src/components/empty";
import { useTheme } from "@src/themes/theme-provider";
import { observer } from "mobx-react-lite";
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
} from "react";
import { StyleSheet, TouchableOpacity, View, ViewStyle } from "react-native";
import { CardBody } from "../../components/card";
import { useStore } from "../../stores";
import { _keyExtract } from "../../utils/helper";
import OWIcon from "@src/components/ow-icon/ow-icon";
import { Text } from "@src/components/text";
import { RightArrowIcon } from "@src/components/icon";
import { ChainIdEnum } from "@owallet/common";
import { API } from "@src/common/api";
import moment from "moment";
import { Bech32Address } from "@owallet/cosmos";
import OWFlatList from "@src/components/page/ow-flat-list";
import { chainIcons } from "@oraichain/oraidex-common";
import { SCREENS } from "@src/common/constants";
import { navigate } from "@src/router/root";
import FastImage from "react-native-fast-image";
import OWText from "@src/components/text/ow-text";
import { FlatList } from "react-native-gesture-handler";
import { metrics } from "@src/themes";

export const HistoryCard: FunctionComponent<{
  containerStyle?: ViewStyle;
}> = observer(({ containerStyle }) => {
  const { accountStore, appInitStore, chainStore } = useStore();
  const { colors } = useTheme();
  const theme = appInitStore.getInitApp.theme;

  const [histories, setHistories] = useState({});
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(0);

  const accountOrai = accountStore.getAccount(ChainIdEnum.Oraichain);

  const getWalletHistory = async (address) => {
    try {
      setLoading(true);

      const res = await API.getGroupHistory(
        {
          address,
          offset,
          limit: 2,
        },
        {
          baseURL: "https://staging.owallet.dev/",
        }
      );

      if (res && res.status === 200) {
        console.log("res.data.data", res.data.data);

        setHistories({ ...histories, ...res.data.data });
        setLoading(false);
        if (Number(res.data.total) > offset) {
          setOffset(offset + 2);
        }
      }
    } catch (err) {
      setLoading(false);
      console.log("getWalletHistory err", err);
    }
  };

  useEffect(() => {
    if (accountOrai.bech32Address) {
      getWalletHistory(accountOrai.bech32Address);
    }
  }, [accountOrai.bech32Address, offset]);

  const styles = styling(colors);

  const findChainIcon = ({ chainId, chainName }) => {
    let chainIcon = chainIcons.find((c) => c.chainId === chainId);
    // Hardcode for Oasis because oraidex-common does not have icon yet
    if (chainName?.includes("Oasis")) {
      chainIcon = {
        chainId: chainId,
        Icon: "https://s2.coinmarketcap.com/static/img/coins/200x200/7653.png",
      };
    }
    // Hardcode for BTC because oraidex-common does not have icon yet
    if (chainName?.includes("Bit")) {
      chainIcon = {
        chainId: chainId,
        Icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Bitcoin.svg/1200px-Bitcoin.svg.png",
      };
    }

    if (!chainIcon) {
      chainIcon = chainIcons.find((c) => c.chainId === ChainIdEnum.Oraichain);
    }

    return chainIcon;
  };

  const renderHistoryItem = useCallback(
    (item) => {
      if (item) {
        let fromChainInfo = chainStore.chainInfosInUI.find((c) => {
          return c.chainId === item.fromToken?.chainId;
        });

        let toChainInfo = chainStore.chainInfosInUI.find((c) => {
          return c.chainId === item.toToken?.chainId;
        });

        const fromChainIcon = findChainIcon({
          chainId: fromChainInfo?.chainId,
          chainName: fromChainInfo?.chainName,
        });

        const toChainIcon = findChainIcon({
          chainId: toChainInfo?.chainId,
          chainName: toChainInfo?.chainName,
        });

        return (
          <TouchableOpacity
            onPress={() => {
              navigate(SCREENS.HistoryDetail, {
                item,
              });
            }}
            style={styles.btnItem}
          >
            <View style={styles.leftBoxItem}>
              <View style={styles.iconWrap}>
                <OWIcon
                  type="images"
                  source={{ uri: fromChainIcon?.Icon }}
                  size={28}
                />
              </View>
              <View style={styles.chainWrap}>
                <OWIcon
                  type="images"
                  source={{ uri: toChainIcon?.Icon }}
                  size={16}
                />
              </View>

              <View style={styles.pl10}>
                <Text
                  size={14}
                  color={colors["neutral-text-heading"]}
                  weight="600"
                >
                  {item.type.split("_").join("")}
                </Text>
                <Text weight="400" color={colors["neutral-text-body"]}>
                  {Bech32Address.shortenAddress(item.fromAddress, 16)}
                </Text>
              </View>
            </View>
            <View style={styles.rightBoxItem}>
              <View style={{ flexDirection: "row" }}>
                <View style={{ alignItems: "flex-end" }}>
                  <Text weight="500" color={colors["neutral-text-heading"]}>
                    {item.fromAmount} {item.fromToken?.asset ?? ""}
                  </Text>
                  {/* <Text style={styles.profit} color={colors["success-text-body"]}>
                    {"+"}${item.value.toFixed(6)}
                  </Text> */}
                </View>
                <View
                  style={{
                    flex: 0.5,
                    justifyContent: "center",
                    paddingLeft: 20,
                  }}
                >
                  <RightArrowIcon
                    height={12}
                    color={colors["neutral-text-heading"]}
                  />
                </View>
              </View>
            </View>
          </TouchableOpacity>
        );
      }
    },
    [theme]
  );

  const renderListHistoryItem = ({ item }) => {
    if (item) {
      return (
        <View style={{ paddingTop: 16 }}>
          <Text size={14} color={colors["neutral-text-heading"]} weight="600">
            {moment(Number(item)).format("DD/MM/YY")}
          </Text>
          {histories?.[item]?.map((h) => {
            return renderHistoryItem(h);
          })}
        </View>
      );
    }
  };

  const onEndReached = () => {
    getWalletHistory(accountOrai.bech32Address);
  };

  const onRefresh = () => {
    setLoading(true);
    getWalletHistory(accountOrai.bech32Address);
  };

  const renderContent = () => {
    return (
      <View>
        <FlatList
          data={Object.keys(histories)}
          contentContainerStyle={{
            paddingHorizontal: 16,
            marginBottom: metrics.screenHeight / 4,
          }}
          onEndReached={onEndReached}
          renderItem={renderListHistoryItem}
          onRefresh={onRefresh}
          ListEmptyComponent={() => {
            return (
              <View
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                  marginVertical: 42,
                  marginBottom: 0,
                }}
              >
                <FastImage
                  source={require("../../assets/image/img_empty.png")}
                  style={{
                    width: 150,
                    height: 150,
                  }}
                  resizeMode={"contain"}
                />
                <OWText
                  color={colors["neutral-text-title"]}
                  size={16}
                  weight="700"
                >
                  {"NO TRANSACTIONS YET".toUpperCase()}
                </OWText>
              </View>
            );
          }}
        />
      </View>
    );
  };

  return <>{renderContent()}</>;
});

const styling = (colors) =>
  StyleSheet.create({
    wrapHeaderTitle: {
      flexDirection: "row",
    },
    pl10: {
      paddingLeft: 10,
    },
    leftBoxItem: {
      flexDirection: "row",
      alignItems: "center",
    },
    rightBoxItem: {
      alignItems: "flex-end",
    },
    btnItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginVertical: 8,
    },
    profit: {
      fontWeight: "400",
      lineHeight: 20,
    },
    iconWrap: {
      width: 32,
      height: 32,
      borderRadius: 32,
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
      backgroundColor: colors["neutral-text-action-on-dark-bg"],
    },
    chainWrap: {
      width: 18,
      height: 18,
      borderRadius: 32,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors["neutral-text-action-on-dark-bg"],
      position: "absolute",
      bottom: -6,
      left: 20,
    },
    active: {
      borderBottomColor: colors["primary-surface-default"],
      borderBottomWidth: 2,
    },
  });
