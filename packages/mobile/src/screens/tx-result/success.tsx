import React, { FunctionComponent, useEffect, useState } from "react";
import { RouteProp, useRoute } from "@react-navigation/native";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import {
  View,
  Image,
  ScrollView,
  InteractionManager,
  StyleSheet,
} from "react-native";
import { Text } from "@src/components/text";
import { useSmartNavigation } from "../../navigation.provider";
import { CommonActions } from "@react-navigation/native";
import { useTheme } from "@src/themes/theme-provider";
import {
  capitalizedText,
  formatContractAddress,
  openLink,
} from "../../utils/helper";
import { ChainIdEnum, TRON_ID } from "@owallet/common";
import { PageWithBottom } from "@src/components/page/page-with-bottom";
import OWButtonGroup from "@src/components/button/OWButtonGroup";
import { PageHeader } from "@src/components/header/header-new";
import image from "@src/assets/images";
import OWCard from "@src/components/card/ow-card";
import OWText from "@src/components/text/ow-text";
import ItemReceivedToken from "@src/screens/transactions/components/item-received-token";
import { CoinPretty, Dec } from "@owallet/unit";
import { AppCurrency, StdFee } from "@owallet/types";
import { CoinPrimitive } from "@owallet/stores";
import _ from "lodash";
import { HeaderTx } from "@src/screens/tx-result/components/header-tx";
import OWButtonIcon from "@src/components/button/ow-button-icon";

export const TxSuccessResultScreen: FunctionComponent = observer(() => {
  const { chainStore, priceStore, txsStore, accountStore, keyRingStore } =
    useStore();
  const { colors, images } = useTheme();
  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          chainId?: string;
          // Hex encoded bytes.
          txHash?: string;
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

  const chainTxs =
    chainStore.current.chainId === ChainIdEnum.KawaiiEvm
      ? chainStore.getChain(ChainIdEnum.KawaiiCosmos)
      : chainStore.current;
  const { current } = chainStore;
  const chainId = current.chainId;

  const { params } = route;
  const txHash = params?.txHash;
  const [data, setData] = useState<Partial<ResTxsInfo>>();
  const account = accountStore.getAccount(chainStore?.current?.chainId);
  const address = account.getAddressDisplay(
    keyRingStore.keyRingLedgerAddresses,
    false
  );
  const txs = txsStore(chainTxs);
  const smartNavigation = useSmartNavigation();

  const chainInfo = chainStore.getChain(chainId);
  const handleUrl = (txHash) => {
    return chainInfo.raw.txExplorer.txUrl.replace(
      "{txHash}",
      chainInfo.chainId === TRON_ID ||
        chainInfo.networkType === "bitcoin" ||
        chainInfo.chainId === ChainIdEnum.OasisSapphire ||
        chainInfo.chainId === ChainIdEnum.OasisEmerald ||
        chainInfo.chainId === ChainIdEnum.Oasis ||
        chainInfo.chainId === ChainIdEnum.BNBChain
        ? txHash?.toLowerCase()
        : txHash?.toUpperCase()
    );
  };
  const handleOnExplorer = async () => {
    if (chainInfo.raw.txExplorer && txHash) {
      const url = handleUrl(txHash);
      await openLink(url);
    }
  };

  const onDone = () => {
    smartNavigation.dispatch(
      CommonActions.reset({
        index: 1,
        routes: [
          {
            name: "MainTab",
          },
        ],
      })
    );
  };
  const amount = new CoinPretty(
    params?.data?.currency,
    new Dec(params?.data?.amount?.amount)
  );

  const fee = () => {
    if (params?.data?.fee) {
      return new CoinPretty(
        chainInfo.stakeCurrency,
        new Dec(params?.data?.fee.amount?.[0]?.amount)
      );
    } else {
      if (data?.stdFee?.amount?.[0]?.amount) {
        return new CoinPretty(
          chainInfo.stakeCurrency,
          new Dec(data?.stdFee?.amount?.[0]?.amount)
        );
      }
      return new CoinPretty(chainInfo.stakeCurrency, new Dec(0));
    }
  };
  const getDetailByHash = async (txHash) => {
    try {
      const tx = await txs.getTxsByHash(txHash, address);
      setData(tx);
    } catch (error) {
      console.log("error: ", error);
    }
  };
  useEffect(() => {
    if (txHash) {
      InteractionManager.runAfterInteractions(() => {
        getDetailByHash(txHash);
      });
    }
  }, [txHash]);
  const dataItem =
    params?.data &&
    _.pickBy(params?.data, function (value, key) {
      return (
        key !== "memo" &&
        key !== "fee" &&
        key !== "amount" &&
        key !== "currency" &&
        key !== "type"
      );
    });
  const styles = styling(colors);
  return (
    <PageWithBottom
      bottomGroup={
        <View style={styles.containerBottomButton}>
          <OWButtonGroup
            labelApprove={"Done"}
            labelClose={"View on Explorer"}
            styleApprove={styles.btnApprove}
            onPressClose={handleOnExplorer}
            onPressApprove={onDone}
            styleClose={{
              borderRadius: 99,
              backgroundColor: colors["neutral-surface-action3"],
            }}
          />
        </View>
      }
    >
      <View style={styles.containerBox}>
        <PageHeader title={"Transaction details"} />
        <ScrollView showsVerticalScrollIndicator={false}>
          <HeaderTx
            type={capitalizedText(params?.data?.type) || "Send"}
            imageType={
              <View style={styles.containerSuccess}>
                <OWText
                  weight={"500"}
                  size={14}
                  color={colors["highlight-text-title"]}
                >
                  Success
                </OWText>
              </View>
            }
            amount={`${params?.data?.type === "send" ? "-" : ""}${amount
              ?.shrink(true)
              ?.trim(true)
              ?.toString()}`}
            price={priceStore.calculatePrice(amount)?.toString()}
          />
          <View style={styles.cardBody}>
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
              label={"Network"}
              valueDisplay={
                <View style={styles.viewNetwork}>
                  {chainInfo?.raw?.chainSymbolImageUrl && (
                    <Image
                      style={styles.imgNetwork}
                      source={{
                        uri: chainInfo?.raw?.chainSymbolImageUrl,
                      }}
                    />
                  )}
                  <Text
                    size={16}
                    color={colors["neutral-text-body"]}
                    weight={"400"}
                    style={{
                      paddingLeft: 3,
                    }}
                  >
                    {chainInfo?.chainName}
                  </Text>
                </View>
              }
              btnCopy={false}
            />
            <ItemReceivedToken
              label={"Fee"}
              valueDisplay={`${fee()?.shrink(true)?.trim(true)?.toString()} (${
                priceStore.calculatePrice(fee()) || "$0"
              })`}
              btnCopy={false}
            />
            <ItemReceivedToken
              label={"Time"}
              valueDisplay={data?.time?.timeLong}
              btnCopy={false}
            />
            <ItemReceivedToken
              label={"Memo"}
              valueDisplay={params?.data?.memo || "-"}
              btnCopy={false}
            />
            <ItemReceivedToken
              label={"Hash"}
              valueDisplay={formatContractAddress(txHash)}
              value={txHash}
              btnCopy={false}
              IconRightComponent={
                <View>
                  <OWButtonIcon
                    name="tdesignjump"
                    sizeIcon={20}
                    fullWidth={false}
                    onPress={handleOnExplorer}
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

const styling = (colors) => {
  return StyleSheet.create({
    containerSuccess: {
      backgroundColor: colors["highlight-surface-subtle"],
      width: "100%",
      paddingHorizontal: 12,
      paddingVertical: 2,
      borderRadius: 99,
      alignSelf: "center",
    },
    containerBottomButton: {
      width: "100%",
      paddingHorizontal: 16,
      paddingTop: 16,
    },
    btnApprove: {
      borderRadius: 99,
      backgroundColor: colors["primary-surface-default"],
    },
    cardBody: {
      padding: 16,
      borderRadius: 24,
      marginHorizontal: 16,
      backgroundColor: colors["neutral-surface-card"],
    },
    viewNetwork: {
      flexDirection: "row",
      paddingTop: 6,
    },
    imgNetwork: {
      height: 20,
      width: 20,
      backgroundColor: colors["neutral-icon-on-dark"],
    },
    containerBox: {
      flex: 1,
    },
  });
};
