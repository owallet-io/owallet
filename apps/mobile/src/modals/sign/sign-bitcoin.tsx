import React, { FunctionComponent, useEffect, useState } from "react";
import { registerModal } from "../base";

import { Text, View, KeyboardAvoidingView, Platform } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useStyle } from "../../styles";
import { useStore } from "../../stores";

import { observer } from "mobx-react-lite";
import { useUnmount } from "../../hooks";
import { BottomSheetProps } from "@gorhom/bottom-sheet";
import { FeeInSign, FeeInSignBtc } from "@src/modals/sign/fee";
import {
  useAmountConfig,
  useFeeConfig,
  useGasConfig,
  useMemoConfig,
} from "@owallet/hooks";
import { Bech32Address, ChainIdHelper } from "@owallet/cosmos";
import { CoinPretty } from "@owallet/unit/build/coin-pretty";
import { Dec } from "@owallet/unit";
import OWText from "@src/components/text/ow-text";
import { AmountCard, WasmExecutionMsgView } from "@src/modals/sign/components";
import ItemReceivedToken from "@src/screens/transactions/components/item-received-token";
import OWButtonGroup from "@src/components/button/OWButtonGroup";
import WrapViewModal from "@src/modals/wrap/wrap-view-modal";
import Web3 from "web3";
import FastImage from "react-native-fast-image";
import { useTheme } from "@src/themes/theme-provider";
import { shortenAddress } from "@src/utils/helper";
// eslint-disable-next-line @typescript-eslint/no-var-requires,import/no-extraneous-dependencies
const { BitcoinUnit } = require("bitcoin-units");

export const SignBitcoinModal: FunctionComponent<{
  isOpen: boolean;
  close: () => void;
  bottomSheetModalConfig?: Omit<BottomSheetProps, "snapPoints" | "children">;
}> = registerModal(
  observer(() => {
    const {
      chainStore,
      signInteractionStore,
      accountStore,
      keyRingStore,
      queriesStore,
      priceStore,
    } = useStore();
    const [dataSign, setDataSign] = useState(null);
    //TODO: Hard code for chainID with bitcoin;
    const chainId = "bitcoin";
    const accountInfo = accountStore.getAccount(chainId);
    const signer = accountInfo.getAddressDisplay(
      keyRingStore.keyRingLedgerAddresses,
      false
    );

    const isNoSetFee = !!accountInfo.isSendingMsg;
    const queries = queriesStore.get(chainId);
    const queryBalances = queries.queryBalances;
    const gasConfig = useGasConfig(chainStore, chainId);
    const amountConfig = useAmountConfig(
      chainStore,
      chainId,
      signer,
      queryBalances,
      queries.bitcoin.queryBitcoinBalance
    );
    const memoConfig = useMemoConfig(chainStore, chainId);
    const feeConfig = useFeeConfig(
      chainStore,
      chainId,
      signer,
      queryBalances,
      amountConfig,
      gasConfig,
      true,
      queries.bitcoin.queryBitcoinBalance,
      memoConfig
    );
    useUnmount(() => {
      signInteractionStore.rejectAll();
    });

    const satsToBtc = (amount: number) => {
      return new BitcoinUnit(amount, "satoshi").to("BTC").getValue();
    };

    useEffect(() => {
      if (signInteractionStore.waitingBitcoinData) {
        const data = signInteractionStore.waitingBitcoinData;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const msgs = data.data.data?.msgs;

        chainStore.selectChain(data.data.chainId);
        setDataSign(data);
        if (msgs?.amount) {
          amountConfig.setAmount(`${satsToBtc(msgs?.amount)}`);
        }

        if (isNoSetFee) {
          feeConfig.setManualFee({
            denom: chainStore.current.stakeCurrency.coinMinimalDenom,
            amount: msgs?.totalFee,
          });
        } else {
          feeConfig.setFeeType("average");
        }

        memoConfig.setMemo(msgs?.message);
      }
    }, []);

    const style = useStyle();
    const dataBalance =
      queries.bitcoin.queryBitcoinBalance.getQueryBalance(signer)?.response
        ?.data;
    const utxos = dataBalance?.utxos;
    const confirmedBalance = dataBalance?.balance;
    const refreshBalance = async (address) => {
      try {
        await queries.bitcoin.queryBitcoinBalance
          .getQueryBalance(address)
          .waitFreshResponse();
      } catch (error) {
        console.log(
          "🚀 ~ file: send-btc.tsx:112 ~ refreshBalance ~ error:",
          error
        );
      }
    };
    useEffect(() => {
      if (signer) {
        refreshBalance(signer);
        return;
      }

      return () => {};
    }, [signer]);
    const _onPressReject = () => {
      try {
        signInteractionStore.rejectAll();
      } catch (error) {
        console.error(error);
      }
    };

    const approveIsDisabled = feeConfig.getError() != null;
    const dataChanged = dataSign && {
      ...dataSign,
      data: {
        ...dataSign.data,
        data: {
          ...dataSign.data.data,
          fee: {
            ...dataSign.data.data.fee,
            amount: [
              {
                denom: "btc",
                amount: Number(feeConfig.fee?.toCoin()?.amount),
              },
            ],
          },
          msgs: {
            ...dataSign.data.data.msgs,
            totalFee: Number(feeConfig.fee?.toCoin()?.amount),
            feeRate: feeConfig?.feeRate[feeConfig?.feeType ?? "average"],
            confirmedBalance,
          },
          confirmedBalance,
          utxos,
          feeRate: feeConfig?.feeRate[feeConfig?.feeType ?? "average"],
        },
      },
    };
    const lastestData = isNoSetFee ? dataSign : dataChanged;

    const _onPressApprove = async () => {
      try {
        await signInteractionStore.approveBitcoinAndWaitEnd({
          ...lastestData.data.data,
        });
      } catch (error) {
        signInteractionStore.rejectAll();
        console.log("error approveBitcoinAndWaitEnd", error);
      }
    };
    const msgData = lastestData?.data?.data?.msgs;
    const renderAmount = () => {
      if (!chainStore.current.stakeCurrency || !msgData?.amount) return null;
      return new CoinPretty(
        chainStore.current.stakeCurrency,
        new Dec(msgData?.amount)
      )
        ?.trim(true)
        ?.toString();
    };
    const checkImageCoin = () => {
      if (!chainStore.current.stakeCurrency) return;
      if (chainStore.current.stakeCurrency?.coinImageUrl)
        return (
          <View
            style={{
              alignSelf: "center",
              paddingVertical: 8,
              backgroundColor: colors["neutral-icon-on-dark"],
            }}
          >
            <FastImage
              style={{
                height: 30,
                width: 30,
                borderRadius: 999,
              }}
              source={{
                uri: chainStore.current.stakeCurrency?.coinImageUrl,
              }}
            />
          </View>
        );
      return null;
    };
    const checkPrice = () => {
      if (!chainStore.current.stakeCurrency || !msgData?.amount) return;
      const coin = new CoinPretty(
        chainStore.current.stakeCurrency,
        new Dec(msgData?.amount)
      );
      const totalPrice = priceStore.calculatePrice(coin);
      return totalPrice?.toString();
    };
    const { colors } = useTheme();
    return (
      <WrapViewModal
        style={{
          backgroundColor: colors["neutral-surface-card"],
        }}
      >
        <View style={{ paddingTop: 16 }}>
          <OWText
            size={16}
            weight={"700"}
            style={{
              textAlign: "center",
              paddingBottom: 20,
            }}
          >
            {`Confirmation`.toUpperCase()}
          </OWText>

          {renderAmount() ? (
            <AmountCard
              imageCoin={checkImageCoin()}
              amountStr={renderAmount()}
              totalPrice={checkPrice()}
            />
          ) : (
            lastestData && (
              <ScrollView
                style={{
                  backgroundColor: colors["neutral-surface-bg"],
                  padding: 16,
                  borderRadius: 24,
                  maxHeight: 300,
                }}
              >
                <WasmExecutionMsgView msg={lastestData} />
              </ScrollView>
            )
          )}

          <View
            style={{
              backgroundColor: colors["neutral-surface-card"],
              paddingHorizontal: 16,
              paddingTop: 16,
              borderRadius: 24,
              marginBottom: 24,
              marginTop: 2,
            }}
          >
            {msgData?.changeAddress && (
              <ItemReceivedToken
                label={"From"}
                valueDisplay={shortenAddress(msgData?.changeAddress)}
                value={msgData?.changeAddress}
              />
            )}
            {msgData?.address && (
              <ItemReceivedToken
                label={"To"}
                valueDisplay={shortenAddress(msgData?.address)}
                value={msgData?.address}
              />
            )}
            <FeeInSign
              feeConfig={feeConfig}
              gasConfig={gasConfig}
              signOptions={{ preferNoSetFee: isNoSetFee }}
              isInternal={isNoSetFee}
            />
          </View>
        </View>

        <OWButtonGroup
          labelApprove={"Confirm"}
          labelClose={"Cancel"}
          disabledApprove={approveIsDisabled}
          disabledClose={signInteractionStore.isLoading}
          loadingApprove={signInteractionStore.isLoading}
          styleApprove={{
            borderRadius: 99,
            backgroundColor: approveIsDisabled
              ? colors["primary-surface-disable"]
              : colors["primary-surface-default"],
          }}
          onPressClose={_onPressReject}
          onPressApprove={_onPressApprove}
          styleClose={{
            borderRadius: 99,
            backgroundColor: colors["neutral-surface-action3"],
          }}
        />
      </WrapViewModal>
    );
  }),
  {
    disableSafeArea: true,
  }
);
