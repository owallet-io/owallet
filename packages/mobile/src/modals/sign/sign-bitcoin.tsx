import React, {
  FunctionComponent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { registerModal } from "../base";
import { CardModal } from "../card";
import { Text, View, KeyboardAvoidingView, Platform } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useStyle } from "../../styles";
import { useStore } from "../../stores";
import { Button, OWButton } from "../../components/button";
import { colors, typography } from "../../themes";

import { observer } from "mobx-react-lite";
import { useUnmount } from "../../hooks";
import { BottomSheetProps } from "@gorhom/bottom-sheet";
import { navigationRef } from "../../router/root";
import { SCREENS } from "@src/common/constants";
import { formatBalance } from "@owallet/bitcoin";
import { FeeInSign, FeeInSignBtc } from "@src/modals/sign/fee";
import {
  useAmountConfig,
  useFeeConfig,
  useGasConfig,
  useMemoConfig,
} from "@owallet/hooks";
import { ChainIdHelper } from "@owallet/cosmos";
import { CoinPretty } from "@owallet/unit/build/coin-pretty";
import { Dec } from "@owallet/unit";
// eslint-disable-next-line @typescript-eslint/no-var-requires,import/no-extraneous-dependencies
const { BitcoinUnit } = require("bitcoin-units");
const keyboardVerticalOffset = Platform.OS === "ios" ? 130 : 0;

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
      null,
      null,
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
      null,
      null,
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
        console.log(msgs, "msgsmsgs");
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

    const isDisable = feeConfig.getError() != null;
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
    return (
      <CardModal>
        <KeyboardAvoidingView
          behavior="position"
          keyboardVerticalOffset={keyboardVerticalOffset}
        >
          <View style={style.flatten(["margin-bottom-16"])}>
            <Text style={style.flatten(["margin-bottom-3"])}>
              <Text
                style={style.flatten(["subtitle3", "color-primary"])}
              >{`1 `}</Text>
              <Text
                style={style.flatten(["subtitle3", "color-text-black-medium"])}
              >
                Message
              </Text>
            </Text>
            <View
              style={style.flatten([
                "border-radius-8",
                "border-width-1",
                "border-color-border-white",
                "overflow-hidden",
              ])}
            >
              <ScrollView
                style={style.flatten(["max-height-214"])}
                persistentScrollbar={true}
              >
                <Text
                  style={{
                    color: colors["sub-text"],
                  }}
                >
                  {JSON.stringify(lastestData, null, 2)}
                </Text>
              </ScrollView>
            </View>
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              paddingVertical: 8,
              alignItems: "center",
            }}
          >
            <Text
              style={style.flatten(["subtitle3", "color-text-black-medium"])}
            >
              Amount
            </Text>
            <Text
              style={{
                ...style.flatten(["subtitle2"]),
                color: colors["primary-surface-default"],
              }}
            >
              {new CoinPretty(
                chainStore.current.stakeCurrency,
                new Dec(lastestData?.data?.data?.msgs?.amount)
              )
                ?.trim(true)
                ?.toString()}
            </Text>
          </View>

          <FeeInSignBtc
            feeConfig={feeConfig}
            gasConfig={gasConfig}
            // signOptions={signInteractionStore.waitingData?.data.signOptions}
            isInternal={!isNoSetFee}
          />
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-evenly",
            }}
          >
            <OWButton
              label="Reject"
              size="large"
              type="danger"
              style={{
                width: "40%",
              }}
              textStyle={{
                color: colors["white"],
              }}
              disabled={signInteractionStore.isLoading}
              onPress={_onPressReject}
            />
            <OWButton
              label="Approve"
              size="large"
              style={{
                width: "40%",
                backgroundColor: signInteractionStore.isLoading
                  ? colors["primary-surface-disable"]
                  : colors["primary-surface-default"],
              }}
              disabled={isDisable || signInteractionStore.isLoading}
              loading={signInteractionStore.isLoading}
              onPress={async () => {
                try {
                  await signInteractionStore.approveBitcoinAndWaitEnd({
                    ...lastestData.data.data,
                  });
                } catch (error) {
                  signInteractionStore.rejectAll();
                  console.log("error approveBitcoinAndWaitEnd", error);
                }
              }}
            />
          </View>
        </KeyboardAvoidingView>
      </CardModal>
    );
  }),
  {
    disableSafeArea: true,
  }
);
