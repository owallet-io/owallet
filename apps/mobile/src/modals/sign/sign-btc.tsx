import React, { FunctionComponent, useEffect, useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { FormattedMessage, useIntl } from "react-intl";
import { useStyle } from "../../styles";
import {
  useAmountConfig,
  useBtcFeeConfig,
  useFeeConfig,
  useGasConfig,
  useMemoConfig,
  useRecipientConfig,
  useSenderConfig,
} from "@owallet/hooks";
import { Column, Columns } from "../../components/column";
import { Text } from "react-native";
import { Gutter } from "../../components/gutter";
import { Box } from "../../components/box";
import { XAxis } from "../../components/axis";
import { CloseIcon } from "../../components/icon";
import {
  ScrollView,
  TouchableWithoutFeedback,
} from "react-native-gesture-handler";
import { FeeSummary } from "./components/fee-summary";
import { getAddressInfo } from "bitcoin-address-validation";
import accumulative from "coinselect/accumulative";
// import {defaultRegistry} from './components/eth-tx/registry';
import { CoinPretty, Dec, DecUtils } from "@owallet/unit";
import { Buffer } from "buffer/";
import { registerModal } from "@src/modals/base";
import { defaultRegistry } from "@src/modals/sign/cosmos/message-registry";
import { OWButton } from "@components/button";
import OWText from "@components/text/ow-text";
import OWIcon from "@components/ow-icon/ow-icon";
import { SignBtcInteractionStore } from "@owallet/stores-core";
import { EthSignType } from "@owallet/types";
import { UnsignedBtcTransaction } from "@owallet/stores-btc";
import {
  Utxos,
  UtxosWithNonWitness,
  UtxosWithWitness,
} from "@owallet/stores-btc/build/queries/types";
import { simpleFetch } from "@owallet/simple-fetch";
import { compileMemo } from "@owallet/common";
import * as bitcoin from "bitcoinjs-lib";
import { PubKeySecp256k1 } from "@owallet/crypto";
export const SignBtcModal = registerModal(
  observer<{
    interactionData: NonNullable<SignBtcInteractionStore["waitingData"]>;
  }>(({ interactionData }) => {
    const {
      chainStore,
      uiConfigStore,
      bitcoinAccountStore,
      signBtcInteractionStore,
      queriesStore,
      appInitStore,
    } = useStore();

    const intl = useIntl();
    const style = useStyle();

    const [isViewData, setIsViewData] = useState(true);
    const chainId = interactionData.data.chainId;
    const chainInfo = chainStore.getChain(chainId);
    const signer = interactionData.data.signer;
    const utxos = queriesStore
      .get(chainId)
      .bitcoin.queryBtcUtxos.getQueryBtcAddress(signer).utxos;
    const [utxosData, setUtxosData] = useState([]);
    const [inputs, setInputs] = useState([]);
    const [outputs, setOutputs] = useState([]);
    const accountBtc = bitcoinAccountStore.getAccount(chainId);
    useEffect(() => {
      if (!utxos || !signer) return;
      (async () => {
        const info = getAddressInfo(signer);
        console.log(info.bech32, "info.bech32");
        if (!info.bech32) {
          const utxosNonWitness = await fetchUxtosNonWitness(utxos);
          setUtxosData(utxosNonWitness);
        } else {
          const utxosWitness = getUxtosWitness(utxos);
          setUtxosData(utxosWitness);
        }
      })();
    }, [utxos, signer]);
    const getInputsAndOutput = () => {
      const targetOutputs = [];
      if (!utxosData?.length)
        return {
          inputs: [],
          outputs: [],
        };
      const compiledMemo = memoConfig.memo
        ? compileMemo(memoConfig.memo)
        : null;
      const amountData = new Dec(amountConfig.amountNotSubFee || 0).mul(
        DecUtils.getTenExponentN(feeConfig.fees?.[0].currency.coinDecimals)
      );
      const feeRate = feeConfig.getGasPriceForFeeCurrency(
        feeConfig.fees?.[0].currency,
        uiConfigStore.lastFeeOption || "average"
      );
      targetOutputs.push({
        address: recipientConfig.recipient,
        value: Number(amountData.roundUp().toString()),
      });
      if (compiledMemo) {
        targetOutputs.push({ script: compiledMemo, value: 0 });
      }
      const { inputs, outputs } = accumulative(
        utxosData,
        targetOutputs,
        Number(feeRate.roundUp().toString())
      );
      setInputs(inputs);
      setOutputs(outputs);
      return { inputs, outputs };
    };
    const fetchUxtosNonWitness = async (
      utxos: Utxos[]
    ): Promise<UtxosWithNonWitness[]> => {
      return Promise.all(
        utxos.map(async (item) => {
          try {
            // Fetch the nonWitnessUtxo data (assuming the response contains the raw transaction hex as a string)
            const res = await simpleFetch<string>(
              chainInfo.rest,
              `/tx/${item.txid}/hex`
            );
            return {
              ...item,
              nonWitnessUtxo: res.data, // Convert the raw hex to Buffer
            };
          } catch (error) {
            console.error(`Error fetching UTXO for txId: ${item.txid}`, error);
            return {
              ...item,
              nonWitnessUtxo: null,
            };
          }
        })
      );
    };
    const getUxtosWitness = (utxos: Utxos[]): UtxosWithWitness[] => {
      const pubKey = new PubKeySecp256k1(accountBtc.pubKey);
      const p2wpkh = bitcoin.payments.p2wpkh({
        //@ts-ignore
        pubkey: Buffer.from(
          pubKey.toKeyPair().getPublic().encodeCompressed("hex"),
          "hex"
        ),
      });
      return utxos.map((item) => {
        return {
          ...item,
          witnessUtxo: {
            script: p2wpkh.output,
            value: item.value,
          },
        };
      });
    };

    const senderConfig = useSenderConfig(chainStore, chainId, signer);
    const amountConfig = useAmountConfig(
      chainStore,
      queriesStore,
      chainId,
      senderConfig
    );
    const recipientConfig = useRecipientConfig(chainStore, chainId);
    const memoConfig = useMemoConfig(chainStore, chainId);
    const feeConfig = useBtcFeeConfig(
      chainStore,
      queriesStore,
      chainId,
      senderConfig,
      amountConfig,
      recipientConfig,
      memoConfig
    );
    console.log(feeConfig.fees, "feeConfig");

    useEffect(() => {
      const data = interactionData.data;
      const unsignedTx: UnsignedBtcTransaction = JSON.parse(
        Buffer.from(data.message).toString()
      );
      if (unsignedTx) {
        const { coinMinimalDenom, amount, to } = unsignedTx;
        recipientConfig.setValue(to);
        const currency = chainInfo.forceFindCurrency(coinMinimalDenom);
        amountConfig.setCurrency(currency);
        amountConfig.setValue(amount);
        feeConfig.setFee({
          type: uiConfigStore.lastFeeOption || "average",
          currency: currency,
        });
        if (!utxosData?.length) return;
        getInputsAndOutput();
      }
    }, [chainInfo.currencies, feeConfig, interactionData.data, utxosData]);

    const signingDataText = useMemo(() => {
      return JSON.stringify(
        JSON.parse(Buffer.from(interactionData.data.message).toString()),
        null,
        2
      );
    }, [interactionData.data]);
    const approve = async () => {
      try {
        if (!inputs?.length || !outputs?.length) return;
        await signBtcInteractionStore.approveWithProceedNext(
          interactionData.id,
          Buffer.from(signingDataText),
          inputs,
          outputs,
          // TODO: Ledger support
          undefined,
          async () => {
            // noop
          },
          {
            preDelay: 200,
          }
        );
      } catch (e) {
        console.log(e);
      }
    };

    return (
      <Box style={style.flatten(["padding-12", "padding-top-0"])}>
        <OWText size={16} weight={"700"}>
          {intl.formatMessage({
            id: "page.sign.ethereum.tx.title",
          })}
        </OWText>
        <Gutter size={24} />

        <Columns sum={1} alignY="center">
          <Text style={style.flatten(["h5", "color-label-default"])}>
            <FormattedMessage id="page.sign.ethereum.tx.summary" />
          </Text>

          <Column weight={1} />

          <ViewDataButton
            isViewData={isViewData}
            setIsViewData={setIsViewData}
          />
        </Columns>

        <Gutter size={8} />

        {isViewData ? (
          <Box
            maxHeight={128}
            backgroundColor={style.get("color-gray-500").color}
            padding={12}
            borderRadius={6}
          >
            <ScrollView persistentScrollbar={true}>
              <Text style={style.flatten(["body3", "color-text-middle"])}>
                {signingDataText}
              </Text>
            </ScrollView>
          </Box>
        ) : (
          <Box
            padding={12}
            minHeight={128}
            maxHeight={240}
            backgroundColor={style.get("color-gray-500").color}
            borderRadius={6}
          >
            {
              //@ts-ignore
              defaultRegistry.render(
                interactionData.data.chainId,
                JSON.parse(Buffer.from(interactionData.data.message).toString())
              ).content
            }
          </Box>
        )}

        <Gutter size={60} />
        {interactionData.isInternal && (
          <FeeSummary feeConfig={feeConfig} gasConfig={null} />
        )}

        <Gutter size={12} />

        <OWButton
          // size="large"
          label={intl.formatMessage({
            id: "button.approve",
          })}
          loading={signBtcInteractionStore.isObsoleteInteraction(
            interactionData.id
          )}
          onPress={approve}

          // innerButtonStyle={style.flatten(['width-full'])}
        />

        <Gutter size={24} />
      </Box>
    );
  })
);

export const ViewDataButton: FunctionComponent<{
  isViewData: boolean;
  setIsViewData: (value: boolean) => void;
}> = ({ isViewData, setIsViewData }) => {
  const style = useStyle();

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        setIsViewData(!isViewData);
      }}
    >
      <XAxis alignY="center">
        <Text style={style.flatten(["text-button2", "color-label-default"])}>
          <FormattedMessage id="page.sign.cosmos.tx.view-data-button" />
        </Text>

        <Gutter size={4} />

        {isViewData ? (
          <CloseIcon size={12} color={style.get("color-gray-100").color} />
        ) : (
          // <CodeBracketIcon
          //   size={12}
          //   color={style.get('color-gray-100').color}
          // />
          <OWIcon
            size={12}
            name={"tdesignbrackets"}
            color={style.get("color-gray-100").color}
          />
        )}
      </XAxis>
    </TouchableWithoutFeedback>
  );
};
