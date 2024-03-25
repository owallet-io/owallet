import React, { FunctionComponent, useEffect, useState } from "react";
import { RouteProp, useRoute } from "@react-navigation/native";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import {
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  InteractionManager,
} from "react-native";
import { Text } from "@src/components/text";
import { useSmartNavigation } from "../../navigation.provider";
import { CommonActions } from "@react-navigation/native";
import { useTheme } from "@src/themes/theme-provider";
import { formatContractAddress, openLink } from "../../utils/helper";
import { ChainIdEnum, TRON_ID } from "@owallet/common";
import { PageWithBottom } from "@src/components/page/page-with-bottom";
import OWButtonGroup from "@src/components/button/OWButtonGroup";
import { PageHeader } from "@src/components/header/header-new";
import image from "@src/assets/images";
import OWCard from "@src/components/card/ow-card";
import OWText from "@src/components/text/ow-text";
import ItemReceivedToken from "@src/screens/transactions/components/item-received-token";
import OWButtonIcon from "@src/components/button/ow-button-icon";
import { CoinPretty, Dec } from "@owallet/unit";
import { AppCurrency, StdFee } from "@owallet/types";
import { CoinPrimitive } from "@owallet/stores";
import { Bech32Address } from "@owallet/cosmos";

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

  const handleOnExplorer = async () => {
    if (chainInfo.raw.txExplorer && txHash) {
      await openLink(
        chainInfo.raw.txExplorer.txUrl.replace(
          "{txHash}",
          chainInfo.chainId === TRON_ID || chainInfo.networkType === "bitcoin"
            ? txHash
            : txHash.toUpperCase()
        )
      );
    }
  };

  const onDone = () => {
    smartNavigation.dispatch(
      CommonActions.reset({
        index: 1,
        routes: [{ name: "MainTab" }],
      })
    );
  };
  const amount = new CoinPretty(
    params?.data?.currency,
    new Dec(params?.data?.amount?.amount)
  );
  const fee = new CoinPretty(
    chainInfo.stakeCurrency,
    new Dec(params?.data?.fee.amount?.[0]?.amount)
  );
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
              {`${amount?.shrink(true)?.trim(true)?.toString()}`}
            </Text>
            <Text
              color={colors["neutral-text-body"]}
              style={{
                textAlign: "center",
              }}
            >
              {priceStore.calculatePrice(amount)?.toString()}
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
              valueDisplay={
                params?.data?.fromAddress &&
                Bech32Address.shortenAddress(params?.data?.fromAddress, 20)
              }
              value={params?.data?.fromAddress}
            />
            <ItemReceivedToken
              label={"To"}
              valueDisplay={
                params?.data?.toAddress &&
                Bech32Address.shortenAddress(params?.data?.toAddress, 20)
              }
              value={params?.data?.toAddress}
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
                  {chainInfo?.raw?.chainSymbolImageUrl && (
                    <Image
                      style={{
                        height: 20,
                        width: 20,
                      }}
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
              valueDisplay={`${fee
                ?.shrink(true)
                ?.trim(true)
                ?.toString()} (${priceStore.calculatePrice(fee)})`}
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
              // btnCopy={false}
              // IconRightComponent={
              //   <View>
              //     <OWButtonIcon
              //       name="copy"
              //       sizeIcon={20}
              //       fullWidth={false}
              //       onPress={onDone}
              //       colorIcon={colors["neutral-text-action-on-light-bg"]}
              //     />
              //   </View>
              // }
            />
          </View>
        </ScrollView>
      </View>
    </PageWithBottom>
  );
});
