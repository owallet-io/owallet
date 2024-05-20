import React, { FunctionComponent, useEffect, useMemo, useState } from "react";
import { registerModal } from "../base";
import { View } from "react-native";
import { useStore } from "../../stores";
import Web3 from "web3";
import { observer } from "mobx-react-lite";
import ERC20_ABI from "human-standard-token-abi";
import {
  useAmountConfig,
  useGasEvmConfig,
  useMemoConfig,
  useFeeEvmConfig,
} from "@owallet/hooks";
import { BottomSheetProps } from "@gorhom/bottom-sheet";
import { ethers } from "ethers";
import WrapViewModal from "@src/modals/wrap/wrap-view-modal";
import { FeeInSign } from "@src/modals/sign/fee";
import ItemReceivedToken from "@src/screens/transactions/components/item-received-token";
import OWButtonGroup from "@src/components/button/OWButtonGroup";
import { CoinPretty, Dec, Int } from "@owallet/unit";
import { useTheme } from "@src/themes/theme-provider";
import OWText from "@src/components/text/ow-text";
import FastImage from "react-native-fast-image";
import { ChainIdEnum, DenomHelper } from "@owallet/common";
import { Bech32Address } from "@owallet/cosmos";
import { AmountCard, WasmExecutionMsgView } from "@src/modals/sign/components";
import { ScrollView } from "react-native-gesture-handler";

export const SignEthereumModal: FunctionComponent<{
  isOpen: boolean;
  close: () => void;
  bottomSheetModalConfig?: Omit<BottomSheetProps, "snapPoints" | "children">;
}> = registerModal(
  observer(({}) => {
    useEffect(() => {
      return () => {
        signInteractionStore.reject();
      };
    }, []);
    const {
      chainStore,
      signInteractionStore,
      accountStore,
      queriesStore,
      keyRingStore,
      priceStore,
    } = useStore();
    const [dataSign, setDataSign] = useState(null);
    const [infoSign, setInfoSign] = useState<{
      to: string;
      value: string;
      data: string;
      gas: string;
      gasPrice: string;
      from: string;
      type: string;
      contractAddress: string;
    }>(null);
    const current = chainStore.current;

    const account = accountStore.getAccount(current.chainId);
    const signer = account.getAddressDisplay(
      keyRingStore.keyRingLedgerAddresses,
      false
    );
    const gasConfig = useGasEvmConfig(chainStore, current.chainId, 1);
    const { gasPrice } = queriesStore
      .get(current.chainId)
      .evm.queryGasPrice.getGasPrice();
    const amountConfig = useAmountConfig(
      chainStore,
      current.chainId,
      signer,
      queriesStore.get(current.chainId).queryBalances,
      null
    );
    const memoConfig = useMemoConfig(chainStore, current.chainId);
    const feeConfig = useFeeEvmConfig(
      chainStore,
      current.chainId,
      signer,
      queriesStore.get(current.chainId).queryBalances,
      amountConfig,
      gasConfig,
      true,
      queriesStore.get(current.chainId),
      memoConfig
    );
    const preferNoSetFee = !!account.isSendingMsg;
    useEffect(() => {
      if (!gasPrice) return;
      gasConfig.setGasPriceStep(gasPrice);
      return () => {};
    }, [gasPrice]);

    const _onPressReject = () => {
      try {
        signInteractionStore.rejectAll();
      } catch (error) {
        console.error(error);
      }
    };

    console.log("dataSign", dataSign);

    useEffect(() => {
      if (signInteractionStore.waitingEthereumData) {
        const data = signInteractionStore.waitingEthereumData;

        //@ts-ignore
        const gasDataSign = data?.data?.data?.data?.gas;
        //@ts-ignore
        const gasPriceDataSign = data?.data?.data?.data?.gasPrice;

        chainStore.selectChain(data.data.chainId);
        if (gasDataSign) {
          gasConfig.setGas(Web3.utils.hexToNumber(gasDataSign));
        }
        if (gasPriceDataSign) {
          gasConfig.setGasPrice(Web3.utils.hexToNumberString(gasPriceDataSign));
        }
        const gas = new Dec(new Int(Web3.utils.hexToNumberString(gasDataSign)));
        const gasPrice = new Dec(
          new Int(Web3.utils.hexToNumberString(gasPriceDataSign))
        );
        const feeAmount = gasPrice.mul(gas);
        if (feeAmount.lte(new Dec(0))) {
          feeConfig.setFeeType("average");
        } else {
          feeConfig.setManualFee({
            amount: feeAmount.roundUp().toString(),
            denom: chainStore.current.feeCurrencies[0].coinMinimalDenom,
          });
        }
        setDataSign(signInteractionStore.waitingEthereumData);
        const dataSigning = data?.data?.data?.data;
        const hstInterface = new ethers.utils.Interface(ERC20_ABI);
        try {
          const { data, type } = dataSigning;
          if (!data || (type && type !== "erc20")) {
            setInfoSign({
              ...dataSigning,
              from: account.evmosHexAddress,
            });
          } else if (data && type && type === "erc20") {
            const token = hstInterface.parseTransaction({ data });
            const to = token?.args?._to || token?.args?.[0];
            const value = token?.args?._value || token?.args?.[1];

            setInfoSign({
              ...dataSigning,
              value: Web3.utils.toHex(value?.toString()),
              contractAddress: dataSigning.to,
              to,
              from: dataSigning?.from || account.evmosHexAddress,
            });
          }
        } catch (error) {
          console.log("error", error);
          // return undefined;
        }
      }
    }, [signInteractionStore.waitingEthereumData]);

    const approveIsDisabled = (() => {
      return feeConfig.getError() != null || gasConfig.getError() != null;
    })();

    const _onPressApprove = async () => {
      if (!dataSign) return;
      await signInteractionStore.approveEthereumAndWaitEnd({
        gasPrice: Web3.utils.toHex(gasConfig.gasPrice),
        gasLimit: Web3.utils.toHex(gasConfig.gas),
      });
      return;
    };

    const { colors } = useTheme();
    const currencies = chainStore.current.currencies;
    const currency = useMemo(() => {
      if (!infoSign || !currencies?.length) return;
      const currency = currencies.find((item, index) => {
        const denom = new DenomHelper(item.coinMinimalDenom)?.contractAddress;
        if (denom && infoSign?.type === "erc20") {
          if (!infoSign.contractAddress) return;
          return denom === infoSign.contractAddress;
        } else if (!infoSign?.type || infoSign?.type !== "erc20") {
          return (
            item.coinMinimalDenom ===
            chainStore.current.stakeCurrency.coinMinimalDenom
          );
        }
      });
      return currency;
    }, [infoSign, currencies]);

    const checkPrice = () => {
      if (!currency || !infoSign?.value) return;
      const coin = new CoinPretty(
        currency,
        new Dec(Web3.utils.hexToNumberString(infoSign?.value))
      );
      const totalPrice = priceStore.calculatePrice(coin);
      return totalPrice?.toString();
    };

    const checkImageCoin = () => {
      if (!currency) return;
      if (currency?.coinImageUrl)
        return (
          <View
            style={{
              alignSelf: "center",
              paddingVertical: 8,
            }}
          >
            <FastImage
              style={{
                height: 30,
                width: 30,
              }}
              source={{
                uri: currency?.coinImageUrl,
              }}
            />
          </View>
        );
      return null;
    };

    const renderAmount = () => {
      if (!currency || !infoSign?.value) return null;
      return new CoinPretty(
        currency,
        new Dec(Web3.utils.hexToNumberString(infoSign?.value))
      )
        ?.maxDecimals(9)
        ?.trim(true)
        ?.toString();
    };

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
            dataSign && (
              <ScrollView
                style={{
                  backgroundColor: colors["neutral-surface-bg"],
                  padding: 16,
                  borderRadius: 24,
                  maxHeight: 300,
                }}
              >
                <WasmExecutionMsgView msg={dataSign} />
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
            {chainStore.current.chainId === ChainIdEnum.Oasis && signer && (
              <ItemReceivedToken
                label={"From"}
                valueDisplay={Bech32Address.shortenAddress(signer, 20)}
                value={signer}
              />
            )}
            {infoSign?.from && (
              <ItemReceivedToken
                label={"From"}
                valueDisplay={Bech32Address.shortenAddress(infoSign?.from, 20)}
                value={infoSign?.from}
              />
            )}
            {infoSign?.to && (
              <ItemReceivedToken
                label={"To"}
                valueDisplay={
                  infoSign?.to && Bech32Address.shortenAddress(infoSign?.to, 20)
                }
                value={infoSign?.to}
              />
            )}
            <FeeInSign
              feeConfig={feeConfig}
              gasConfig={gasConfig}
              signOptions={{ preferNoSetFee }}
              isInternal={true}
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
