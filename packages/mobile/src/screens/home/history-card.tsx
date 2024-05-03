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
import {
  _keyExtract,
  capitalizedText,
  MapChainIdToNetwork,
} from "../../utils/helper";
import OWIcon from "@src/components/ow-icon/ow-icon";
import { Text } from "@src/components/text";
import { RightArrowIcon } from "@src/components/icon";
import { ChainIdEnum, formatAddress } from "@owallet/common";
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
import { Network, AddressTransaction } from "@tatumio/tatum";
import { CoinPretty, Dec, DecUtils, Int, PricePretty } from "@owallet/unit";

export const HistoryCard: FunctionComponent<{
  containerStyle?: ViewStyle;
}> = observer(({ containerStyle }) => {
  const { accountStore, appInitStore, chainStore, priceStore, keyRingStore } =
    useStore();
  const { colors } = useTheme();
  const theme = appInitStore.getInitApp.theme;

  const [histories, setHistories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(0);

  // const accountOrai = accountStore.getAccount(ChainIdEnum.Oraichain);
  // const accountInfo = accountStore.getAccount(chainStore.current.chainId);
  // const address = accountInfo.getAddressDisplay(keyRingStore.keyRingLedgerAddresses,false);
  const address = "0x95222290dd7278aa3ddd389cc1e1d165cc4bafe5";
  console.log(address, "address");
  const getWalletHistory = async (address) => {
    try {
      setLoading(true);

      const res = await API.getEvmTxs(
        {
          address,
          offset: 0,
          limit: 20,
          network: MapChainIdToNetwork[chainStore.current.chainId],
        },
        {
          baseURL: "http://localhost:8000/",
        }
      );
      console.log("res.data.data", res);
      if (res && res.status === 200) {
        // setHistories({ ...histories, ...res.data });
        setHistories(res.data);
        setLoading(false);
        // if (Number(res.data.total) > offset) {
        //   setOffset(offset + 2);
        // }
      }
    } catch (err) {
      setLoading(false);
      console.log("getWalletHistory err", err);
    }
  };

  useEffect(() => {
    if (!address) return;
    getWalletHistory(address);
  }, [address, chainStore.current.chainId]);

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

  // const renderHistoryItem = useCallback(
  //   (item) => {
  //     if (item) {
  //       let fromChainInfo = chainStore.chainInfosInUI.find((c) => {
  //         return c.chainId === item.fromToken?.chainId;
  //       });
  //
  //       let toChainInfo = chainStore.chainInfosInUI.find((c) => {
  //         return c.chainId === item.toToken?.chainId;
  //       });
  //
  //       const fromChainIcon = findChainIcon({
  //         chainId: fromChainInfo?.chainId,
  //         chainName: fromChainInfo?.chainName
  //       });
  //
  //       const toChainIcon = findChainIcon({
  //         chainId: toChainInfo?.chainId,
  //         chainName: toChainInfo?.chainName
  //       });
  //
  //       return (
  //
  //     }
  //   },
  //   [theme]
  // );
  const fiat = priceStore.defaultVsCurrency;

  const price = priceStore.getPrice(
    chainStore.current.stakeCurrency.coinGeckoId,
    fiat
  );
  if (!price) return <EmptyTx />;
  const renderListHistoryItem = ({ item, index }) => {
    if (!item) return;
    const amount = new CoinPretty(
      chainStore.current.stakeCurrency,
      new Dec(item.amount).mul(
        DecUtils.getTenExponentN(chainStore.current.stakeCurrency.coinDecimals)
      )
    );
    const priceAmount = priceStore.calculatePrice(amount, fiat);
    const first =
      index > 0 && moment(histories[index - 1].timestamp).format("MMM D, YYYY");
    const now = moment(item.timestamp).format("MMM D, YYYY");

    return (
      <View style={{ paddingTop: 16 }}>
        {first !== now || index === 0 ? (
          <Text size={14} color={colors["neutral-text-heading"]} weight="600">
            {moment(item.timestamp).format("MMM D, YYYY")}
          </Text>
        ) : null}

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
                source={{ uri: chainStore.current.raw.chainSymbolImageUrl }}
                size={28}
              />
            </View>
            <View style={styles.chainWrap}>
              <OWIcon
                type="images"
                source={{ uri: chainStore.current.raw.chainSymbolImageUrl }}
                size={16}
              />
            </View>
          </View>
          <View
            style={{
              flexDirection: "row",
              borderBottomWidth: 0.5,
              borderBottomColor: colors["neutral-border-default"],
              paddingVertical: 8,
              justifyContent: "space-between",
              flex: 1,
            }}
          >
            <View style={styles.leftBoxItem}>
              <View style={styles.pl10}>
                <Text
                  size={16}
                  color={colors["neutral-text-heading"]}
                  weight="500"
                >
                  {/*{item.transactionType === 'incoming' ? "Receive" : "Send"}*/}
                  {capitalizedText(item.transactionType)}
                </Text>
                <Text weight="400" color={colors["neutral-text-body"]}>
                  {formatAddress(item.counterAddress)}
                </Text>
              </View>
            </View>
            <View style={styles.rightBoxItem}>
              <View style={{ flexDirection: "row" }}>
                <View style={{ alignItems: "flex-end" }}>
                  <Text
                    weight="500"
                    color={
                      new Dec(item.amount).gte(new Dec(0))
                        ? colors["success-text-body"]
                        : colors["neutral-text-title"]
                    }
                  >
                    {amount.maxDecimals(6).trim(true).toString()}
                  </Text>
                  <Text
                    style={styles.profit}
                    color={colors["neutral-text-body"]}
                  >
                    {priceAmount.toString()}
                  </Text>
                </View>
                <View
                  style={{
                    justifyContent: "center",
                    paddingLeft: 16,
                  }}
                >
                  <RightArrowIcon
                    height={12}
                    color={colors["neutral-text-action-on-light-bg"]}
                  />
                </View>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  // const onEndReached = () => {
  //   getWalletHistory(address);
  // };

  const onRefresh = () => {
    setLoading(true);
    // getWalletHistory(address);
  };

  // histories.length = 20;
  return (
    // <FlatList
    //   data={histories}
    //   contentContainerStyle={{
    //     paddingHorizontal: 16,
    //     // marginBottom: metrics.screenHeight / 4
    //   }}
    //   // onEndReached={onEndReached}
    //   renderItem={renderListHistoryItem}
    //   // onRefresh={onRefresh}
    //   ListEmptyComponent={() => {
    //     return <EmptyTx />;
    //   }}
    // />
    <View
      style={{
        paddingHorizontal: 16,
      }}
    >
      {histories?.length > 0 ? (
        histories.map((item, index) => {
          return renderListHistoryItem({
            item,
            index,
          });
        })
      ) : (
        <EmptyTx />
      )}
    </View>
  );
});
const EmptyTx = () => {
  const { colors } = useTheme();
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
      <OWText color={colors["neutral-text-title"]} size={16} weight="700">
        {"NO TRANSACTIONS YET".toUpperCase()}
      </OWText>
    </View>
  );
};
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
      // justifyContent: 'space-between',
      alignItems: "center",
      flex: 1,
      flexWrap: "wrap",
      gap: 16,

      // marginVertical: 8,
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
