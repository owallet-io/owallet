import {
  InteractionManager,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  AddressInput,
  AmountInput,
  CurrencySelector,
  MemoInput,
} from "@src/components/input";
import { OWButton } from "@src/components/button";
import { BtcToSats, formatBalance } from "@owallet/bitcoin";
import { useSendTxConfig } from "@owallet/hooks";
import { useStore } from "@src/stores";
import { useTheme } from "@src/themes/theme-provider";
import { metrics, spacing } from "@src/themes";
import { observer } from "mobx-react-lite";
import { navigate } from "@src/router/root";
import { SCREENS } from "@src/common/constants";
import {
  capitalizedText,
  handleSaveHistory,
  HISTORY_STATUS,
  shortenAddress,
  showToast,
} from "@src/utils/helper";
import { RouteProp, useRoute } from "@react-navigation/native";
import {
  EthereumEndpoint,
  getKeyDerivationFromAddressType,
  toAmount,
} from "@owallet/common";
import { PageWithBottom } from "@src/components/page/page-with-bottom";
import { PageHeader } from "@src/components/header/header-new";
import OWCard from "@src/components/card/ow-card";
import OWText from "@src/components/text/ow-text";
import { NewAmountInput } from "@src/components/input/amount-input";
import OWIcon from "@src/components/ow-icon/ow-icon";
import { DownArrowIcon } from "@src/components/icon";
import { CoinPretty, Dec, Int } from "@owallet/unit";
import { FeeModal } from "@src/modals/fee";
import { ChainIdEnum } from "@oraichain/oraidex-common";
import ValidatorsList from "@src/screens/stake/redelegate/validators-list";
import { ValidatorThumbnail } from "@src/components/thumbnail";
import WrapViewModal from "@src/modals/wrap/wrap-view-modal";
import OWFlatList from "@src/components/page/ow-flat-list";
import { VectorCharacter } from "@src/components/vector-character";
import { Text } from "@src/components/text";
import { RadioButton } from "react-native-radio-buttons-group";
import { AddressBtcType } from "@owallet/types";
import { useBIP44Option } from "@src/screens/register/bip44";

const dataTypeBtc = [
  { id: AddressBtcType.Bech32, name: "Bitcoin Segwit" },
  {
    id: AddressBtcType.Legacy,
    name: "Bitcoin Legacy",
  },
];
export const ModalBtcTypeList = observer(() => {
  const { accountStore, chainStore, modalStore, keyRingStore } = useStore();
  const accountInfo = accountStore.getAccount(chainStore.current.chainId);
  const bip44Option = useBIP44Option();
  const { coinType, chainId, bip44 } = chainStore.current;
  const { colors } = useTheme();
  const handleSwitchType = (item) => {
    accountInfo.setAddressTypeBtc(item.id);
    const keyDerivation = (() => {
      const keyMain = getKeyDerivationFromAddressType(item.id);
      return keyMain;
    })();

    if (accountInfo.isNanoLedger) {
      const path = `${keyDerivation}'/${bip44.coinType ?? coinType}'/${
        bip44Option.bip44HDPath.account
      }'/${bip44Option.bip44HDPath.change}/${
        bip44Option.bip44HDPath.addressIndex
      }`;

      keyRingStore.setKeyStoreLedgerAddress(path, chainId);
    }
    modalStore.close();
  };
  return (
    <WrapViewModal title={"Choose type"} disabledScrollView={false}>
      <OWFlatList
        isBottomSheet={true}
        data={dataTypeBtc}
        renderItem={({ item, index }) => {
          const selected = item?.id === accountInfo.addressType;
          return (
            <TouchableOpacity
              style={{
                paddingLeft: 12,
                paddingRight: 8,
                paddingVertical: 9.5,
                borderRadius: 12,
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: selected
                  ? colors["neutral-surface-bg2"]
                  : null,
              }}
              onPress={() => {
                handleSwitchType(item);
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <View>
                  <Text
                    style={{
                      fontSize: 14,
                      color: colors["neutral-text-title"],
                      fontWeight: "600",
                    }}
                  >
                    {item.name}
                  </Text>
                </View>
              </View>

              <View>
                <RadioButton
                  color={
                    selected
                      ? colors["highlight-surface-active"]
                      : colors["neutral-text-body"]
                  }
                  id={item.id}
                  selected={selected}
                  onPress={() => handleSwitchType(item)}
                />
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </WrapViewModal>
  );
});
export const SendBtcScreen: FunctionComponent = observer(({}) => {
  const {
    chainStore,
    accountStore,
    keyRingStore,
    queriesStore,
    priceStore,
    modalStore,
  } = useStore();
  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          chainId?: string;
          recipient?: string;
        }
      >,
      string
    >
  >();
  const chainId = route?.params?.chainId
    ? route?.params?.chainId
    : chainStore.current.chainId;
  const queries = queriesStore.get(chainId);
  const account = accountStore.getAccount(chainId);
  const accountOrai = accountStore.getAccount(ChainIdEnum.Oraichain);
  const address = account.getAddressDisplay(
    keyRingStore.keyRingLedgerAddresses
  );

  const sendConfigs = useSendTxConfig(
    chainStore,
    chainId,
    account.msgOpts["send"],
    address,
    queries.queryBalances,
    EthereumEndpoint,

    queries.bitcoin.queryBitcoinBalance
  );

  const data =
    queries.bitcoin.queryBitcoinBalance.getQueryBalance(address)?.response
      ?.data;
  const utxos = data?.utxos;
  const confirmedBalance = data?.balance;
  const sendConfigError =
    sendConfigs.recipientConfig.getError() ??
    sendConfigs.amountConfig.getError() ??
    sendConfigs.memoConfig.getError() ??
    sendConfigs.gasConfig.getError();

  const txStateIsValid = sendConfigError == null;
  const { colors } = useTheme();
  const refreshBalance = async (address) => {
    try {
      await queries.bitcoin.queryBitcoinBalance
        .getQueryBalance(address)
        ?.waitFreshResponse();
    } catch (error) {
      console.log(
        "🚀 ~ file: send-btc.tsx:112 ~ refreshBalance ~ error:",
        error
      );
    }
  };

  useEffect(() => {
    if (address) {
      refreshBalance(address);
      return;
    }

    return () => {};
  }, [address]);

  useEffect(() => {
    if (route?.params?.recipient) {
      sendConfigs.recipientConfig.setRawRecipient(route.params.recipient);
    }
  }, [route?.params?.recipient, sendConfigs.recipientConfig]);

  const [balance, setBalance] = useState<CoinPretty>(null);

  const isReadyBalance = queries.queryBalances
    .getQueryBech32Address(address)
    .getBalanceFromCurrency(sendConfigs.amountConfig.sendCurrency).isReady;

  useEffect(() => {
    InteractionManager.runAfterInteractions(() => {
      if (isReadyBalance) {
        console.log(
          sendConfigs.amountConfig.sendCurrency,
          "sendConfigs.amountConfig.sendCurrency"
        );
        const balance = queries.queryBalances
          .getQueryBech32Address(address)
          .getBalanceFromCurrency(sendConfigs.amountConfig.sendCurrency);
        console.log(balance, "balance");
        setBalance(balance);
      }
    });
  }, [isReadyBalance, address, sendConfigs.amountConfig.sendCurrency]);
  const _onPressFee = () => {
    modalStore.setOptions({
      bottomSheetModalConfig: {
        enablePanDownToClose: false,
        enableOverDrag: false,
      },
    });
    modalStore.setChildren(
      <FeeModal vertical={true} sendConfigs={sendConfigs} />
    );
  };

  const onSend = useCallback(async () => {
    try {
      await account.sendToken(
        sendConfigs.amountConfig.amount,
        sendConfigs.amountConfig.sendCurrency,
        sendConfigs.recipientConfig.recipient,
        sendConfigs.memoConfig.memo,
        sendConfigs.feeConfig.toStdFee(),
        {
          preferNoSetFee: true,
          preferNoSetMemo: true,
          networkType: chainStore.current.networkType,
          chainId: chainId,
        },

        {
          onFulfill: async (tx) => {
            console.log("🚀 ~ file: send-btc.tsx:109 ~ onSend ~ tx:", tx);
            // universalSwapStore.updateTokenReload([
            //   {
            //     ...sendConfigs.amountConfig.sendCurrency,
            //     chainId: chainStore.current.chainId,
            //     networkType: "bitcoin"
            //   }
            // ]);
            if (tx) {
              navigate(SCREENS.STACK.Others, {
                screen: SCREENS.TxSuccessResult,
                params: {
                  txHash: tx,
                  data: {
                    memo: sendConfigs.memoConfig.memo,
                    from: address,
                    to: sendConfigs.recipientConfig.recipient,
                    amount: sendConfigs.amountConfig.getAmountPrimitive(),
                    fee: sendConfigs.feeConfig.toStdFee(),
                    currency: sendConfigs.amountConfig.sendCurrency,
                  },
                },
              });
            }

            return;
          },
          onBroadcasted: async (txHash) => {
            try {
              const fee = sendConfigs.feeConfig.fee
                .trim(true)
                .hideDenom(true)
                .maxDecimals(4)
                .toString();
              const historyInfos = {
                fromAddress: address,
                toAddress: sendConfigs.recipientConfig.recipient,
                hash: Buffer.from(txHash).toString("hex"),
                memo: "",
                fromAmount: sendConfigs.amountConfig.amount,
                toAmount: sendConfigs.amountConfig.amount,
                value: sendConfigs.amountConfig.amount,
                fee: fee,
                type: HISTORY_STATUS.SEND,
                fromToken: {
                  asset: sendConfigs.amountConfig.sendCurrency.coinDenom,
                  chainId: chainStore.current.chainId,
                },
                toToken: {
                  asset: sendConfigs.amountConfig.sendCurrency.coinDenom,
                  chainId: chainStore.current.chainId,
                },
                status: "SUCCESS",
              };

              await handleSaveHistory(accountOrai.bech32Address, historyInfos);
            } catch (error) {
              console.log(
                "🚀 ~ file: send-btc.tsx:149 ~ onBroadcasted: ~ error:",
                error
              );
            }
          },
        },
        {
          confirmedBalance: confirmedBalance,
          utxos: utxos,
          blacklistedUtxos: [],
          amount: BtcToSats(Number(sendConfigs.amountConfig.amount)),
          feeRate: sendConfigs.feeConfig.feeRate[sendConfigs.feeConfig.feeType],
        }
      );
    } catch (error) {
      if (error?.message) {
        showToast({
          message: error?.message,
          type: "danger",
        });
        return;
      }
      showToast({
        type: "danger",
        message: JSON.stringify(error),
      });
      console.log("🚀 ~ file: send-btc.tsx:146 ~ onSend ~ error:", error);
    }
  }, [
    chainStore.current.networkType,
    chainId,
    utxos,
    address,
    confirmedBalance,
  ]);

  const styles = styling(colors);
  useEffect(() => {
    if (sendConfigs.feeConfig.feeCurrency && !sendConfigs.feeConfig.fee) {
      sendConfigs.feeConfig.setFeeType("average");
    }
    return;
  }, [sendConfigs.feeConfig]);
  const amount = new CoinPretty(
    sendConfigs.amountConfig.sendCurrency,
    new Dec(sendConfigs.amountConfig.getAmountPrimitive().amount)
  );
  return (
    <PageWithBottom
      bottomGroup={
        <OWButton
          label="Send"
          disabled={!account.isReadyToSendMsgs || !txStateIsValid}
          loading={account.isSendingMsg === "delegate"}
          onPress={onSend}
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
      <PageHeader
        title="Send"
        subtitle={chainStore.current.chainName}
        colors={colors}
      />
      <ScrollView
        style={{ height: metrics.screenHeight / 1.4 }}
        showsVerticalScrollIndicator={false}
      >
        <View>
          <OWCard>
            <TouchableOpacity
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
              onPress={() => {
                modalStore.setOptions();
                modalStore.setChildren(<ModalBtcTypeList />);
              }}
            >
              <View>
                <OWText
                  style={{ paddingBottom: 8 }}
                  color={colors["neutral-text-title"]}
                >
                  Type
                </OWText>
                <View
                // style={{
                //   flexDirection: "row",
                // }}
                >
                  <OWText color={colors["neutral-text-title"]} weight="500">
                    {
                      dataTypeBtc.find(
                        (item, index) => item.id === account.addressType
                      )?.name
                    }
                  </OWText>
                  <OWText color={colors["neutral-text-body"]}>
                    {shortenAddress(account.btcAddress)}
                  </OWText>
                </View>
              </View>
              <DownArrowIcon height={15} color={colors["gray-150"]} />
            </TouchableOpacity>
          </OWCard>
          <OWCard type="normal">
            <OWText color={colors["neutral-text-title"]}>Recipient</OWText>

            <AddressInput
              colors={colors}
              placeholder="Enter address"
              label=""
              recipientConfig={sendConfigs.recipientConfig}
              memoConfig={sendConfigs.memoConfig}
              labelStyle={styles.sendlabelInput}
              containerStyle={{
                marginBottom: 12,
              }}
              inputContainerStyle={{
                backgroundColor: colors["neutral-surface-card"],
                borderWidth: 0,
                paddingHorizontal: 0,
              }}
            />
          </OWCard>
          <OWCard style={{ paddingTop: 22 }} type="normal">
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <View>
                <OWText style={{ paddingTop: 8 }}>
                  Balance :{" "}
                  {balance
                    ?.trim(true)
                    ?.maxDecimals(6)
                    ?.hideDenom(true)
                    ?.toString() || "0"}
                </OWText>
                <CurrencySelector
                  chainId={chainStore.current.chainId}
                  type="new"
                  label="Select a token"
                  placeHolder="Select Token"
                  amountConfig={sendConfigs.amountConfig}
                  labelStyle={styles.sendlabelInput}
                  containerStyle={styles.containerStyle}
                  selectorContainerStyle={{
                    backgroundColor: colors["neutral-surface-card"],
                  }}
                />
              </View>
              <View
                style={{
                  alignItems: "flex-end",
                }}
              >
                <NewAmountInput
                  colors={colors}
                  inputContainerStyle={{
                    borderWidth: 0,
                    width: metrics.screenWidth / 2.3,
                  }}
                  amountConfig={sendConfigs.amountConfig}
                  placeholder={"0.0"}
                  // maxBalance={balance.split(" ")[0]}
                />
              </View>
            </View>
            <View
              style={{
                alignSelf: "flex-end",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <OWIcon name="tdesign_swap" size={16} />
              <OWText
                style={{ paddingLeft: 4 }}
                color={colors["neutral-text-body"]}
                size={14}
              >
                {priceStore.calculatePrice(amount).toString()}
              </OWText>
            </View>
          </OWCard>
          <OWCard type="normal">
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                borderBottomColor: colors["neutral-border-default"],
                borderBottomWidth: 1,
                paddingVertical: 16,
                marginBottom: 8,
              }}
            >
              <OWText
                color={colors["neutral-text-title"]}
                weight="600"
                size={16}
              >
                Transaction fee
              </OWText>
              <TouchableOpacity
                style={{ flexDirection: "row" }}
                onPress={_onPressFee}
              >
                <OWText
                  color={colors["primary-text-action"]}
                  weight="600"
                  size={16}
                >
                  {capitalizedText(sendConfigs.feeConfig.feeType)}:{" "}
                  {priceStore
                    .calculatePrice(sendConfigs.feeConfig.fee)
                    ?.toString()}{" "}
                </OWText>
                <DownArrowIcon
                  height={11}
                  color={colors["primary-text-action"]}
                />
              </TouchableOpacity>
            </View>

            <OWText color={colors["neutral-text-title"]}>Memo</OWText>

            <MemoInput
              label=""
              placeholder="Required if send to CEX"
              inputContainerStyle={{
                backgroundColor: colors["neutral-surface-card"],
                borderWidth: 0,
                paddingHorizontal: 0,
              }}
              memoConfig={sendConfigs.memoConfig}
              labelStyle={styles.sendlabelInput}
            />
          </OWCard>
        </View>
      </ScrollView>
    </PageWithBottom>
  );
});

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
      backgroundColor: colors["neutral-surface-bg2"],
    },
    bottomBtn: {
      marginTop: 20,
      width: metrics.screenWidth / 2.3,
      borderRadius: 999,
    },
  });
