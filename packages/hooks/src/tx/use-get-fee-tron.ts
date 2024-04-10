import { Int } from "@owallet/unit";
import {
  DEFAULT_FEE_LIMIT_TRON,
  encodeParams,
  estimateBandwidthTron,
  EXTRA_FEE_LIMIT_TRON,
  getEvmAddress,
  isBase58,
  TronWebProvider,
} from "@owallet/common";
import {
  ChainInfoInner,
  CoinPrimitive,
  KeyRingStore,
  TronQueries,
} from "@owallet/stores";
import { ChainInfoWithEmbed } from "@owallet/background";
import { useEffect, useState } from "react";

import { AmountConfig } from "./amount";
import { RecipientConfig } from "./recipient";

interface IGetFeeTron {
  feeLimit: Int;
  estimateEnergy: Int;
  estimateBandwidth: Int;
  feeTrx?: CoinPrimitive;
}

export const useGetFeeTron = (
  addressTronBase58: string,
  amountConfig: AmountConfig,
  recipientConfig: RecipientConfig,
  queriesTron: TronQueries,
  chainInfo: ChainInfoInner<ChainInfoWithEmbed>,
  keyRingStore: KeyRingStore,
  dataSign: any
): IGetFeeTron => {
  const initData = {
    feeLimit: new Int(DEFAULT_FEE_LIMIT_TRON),
    estimateEnergy: new Int(0),
    estimateBandwidth: new Int(0),
    feeTrx: null,
  };
  const [data, setData] = useState<IGetFeeTron>(initData);
  if (!isBase58(addressTronBase58)) return;
  const accountTronInfo =
    queriesTron.queryAccount.getQueryWalletAddress(addressTronBase58);
  const chainParameter =
    queriesTron.queryChainParameter.getQueryChainParameters(
      getEvmAddress(addressTronBase58)
    );
  const feeCurrency = chainInfo.feeCurrencies[0];
  const { bandwidthRemaining, energyRemaining } = accountTronInfo;
  const caculatorAmountBandwidthFee = (signedTx, bandwidthRemaining): Int => {
    if (!signedTx || !bandwidthRemaining) return;
    const bandwidthUsed = estimateBandwidthTron(signedTx);
    if (!bandwidthUsed) return;
    const bandwidthUsedInt = new Int(bandwidthUsed);
    setData((prevState) => ({
      ...prevState,
      estimateBandwidth: bandwidthUsedInt,
    }));
    const bandwidthEstimated = bandwidthRemaining.sub(bandwidthUsedInt);
    let amountBandwidthFee = new Int(0);
    if (bandwidthEstimated.lt(new Int(0))) {
      const fee = bandwidthUsedInt
        .mul(chainParameter.bandwidthPrice)
        .toDec()
        .roundUp();
      if (!fee) return;
      amountBandwidthFee = fee;
    }
    return amountBandwidthFee;
  };
  const caculatorAmountEnergyFee = (
    signedTx,
    energyRemaining,
    energy_used
  ): Int => {
    if (!signedTx || !energyRemaining || !energy_used) return;
    const energyUsedInt = new Int(energy_used);
    setData((prevState) => ({
      ...prevState,
      estimateEnergy: energyUsedInt,
    }));
    const energyEstimated = energyRemaining.sub(energyUsedInt);
    let amountEnergyFee = new Int(0);
    if (energyEstimated.lt(new Int(0))) {
      amountEnergyFee = energyUsedInt
        .sub(energyRemaining)
        .mul(chainParameter.energyPrice)
        .toDec()
        .roundUp();
    }
    return amountEnergyFee;
  };

  const estimateForTrigger = async (dataReq) => {
    const tronWeb = TronWebProvider(chainInfo.rpc);
    console.log(tronWeb, "tronWeb");
    const triggerContract =
      await tronWeb.transactionBuilder.triggerConstantContract(
        dataReq.address,
        dataReq.functionSelector,
        {
          ...dataReq.options,
          feeLimit: DEFAULT_FEE_LIMIT_TRON + Math.floor(Math.random() * 100),
        },
        dataReq.parameters,
        dataReq.issuerAddress
      );
    console.log("B4: simulate sign trigger data request Trigger: ", dataReq);
    console.log(
      "B4: simulate sign trigger data after Trigger: ",
      triggerContract
    );
    if (!triggerContract?.energy_used) return;
    const signedTx = await keyRingStore.simulateSignTron(
      triggerContract.transaction
    );
    const amountBandwidthFee = caculatorAmountBandwidthFee(
      signedTx,
      bandwidthRemaining
    );
    const amountEnergyFee = caculatorAmountEnergyFee(
      signedTx,
      energyRemaining,
      triggerContract.energy_used
    );
    const trc20Fee = amountBandwidthFee.add(amountEnergyFee);
    if (!trc20Fee) return;
    setData((prevState) => ({
      ...prevState,
      feeTrx: {
        denom: feeCurrency.coinMinimalDenom,
        amount: trc20Fee.toString(),
      },
    }));
    const feeLimit = new Int(triggerContract.energy_used)
      .mul(chainParameter.energyPrice)
      .add(new Int(EXTRA_FEE_LIMIT_TRON));
    setData((prevState) => ({
      ...prevState,
      feeLimit,
    }));
  };
  const simulateSignTron = async () => {
    if (dataSign?.functionSelector) {
      try {
        if (addressTronBase58?.length <= 0 || !addressTronBase58?.length)
          return;

        estimateForTrigger(dataSign);
        return;
      } catch (e) {
        setData(initData);
        console.log(e, "err");
      }
      return;
    }
    if (
      !amountConfig.amount ||
      !recipientConfig.recipient ||
      !amountConfig.sendCurrency ||
      !addressTronBase58
    ) {
      setData(initData);
      return;
    }
    const tronWeb = TronWebProvider(chainInfo.rpc);
    console.log(tronWeb, "tronWeb");
    const recipientInfo = await queriesTron.queryAccount
      .getQueryWalletAddress(recipientConfig.recipient)
      .waitFreshResponse();
    const { data } = recipientInfo;

    if (!data?.activated) {
      setData((prevState) => ({
        ...prevState,
        feeTrx: {
          denom: feeCurrency.coinMinimalDenom,
          //TODO: With new account tron fee is 1 TRX
          amount: "1000000",
        },
      }));
    } else if (
      amountConfig.sendCurrency.coinMinimalDenom ===
      feeCurrency.coinMinimalDenom
    ) {
      const transaction = await tronWeb.transactionBuilder.sendTrx(
        recipientConfig.recipient,
        amountConfig.getAmountPrimitive().amount,
        addressTronBase58,
        1
      );
      console.log(tronWeb, "tronWeb");
      const signedTx = await keyRingStore.simulateSignTron(transaction);
      const amountBandwidthFee = caculatorAmountBandwidthFee(
        signedTx,
        bandwidthRemaining
      );
      setData((prevState) => ({
        ...prevState,
        feeTrx: {
          denom: feeCurrency.coinMinimalDenom,
          amount: amountBandwidthFee.toString(),
        },
      }));
    } else if (amountConfig.sendCurrency.coinMinimalDenom?.includes("erc20")) {
      try {
        const dataReq = {
          //@ts-ignore
          address: amountConfig.sendCurrency?.contractAddress,
          functionSelector: "transfer(address,uint256)",
          options: {
            feeLimit: DEFAULT_FEE_LIMIT_TRON + Math.floor(Math.random() * 100),
          },
          parameters: [
            {
              type: "address",
              value: getEvmAddress(recipientConfig.recipient),
            },
            {
              type: "uint256",
              value: amountConfig.getAmountPrimitive().amount,
            },
          ],
          issuerAddress: addressTronBase58,
        };
        console.log(dataReq, "dataReq");
        estimateForTrigger(dataReq);
        return;
      } catch (e) {
        setData(initData);
        console.log(e, "err");
      }
    } else {
      setData(initData);
    }
  };
  useEffect(() => {
    simulateSignTron();
  }, [
    amountConfig.amount,
    recipientConfig.recipient,
    addressTronBase58,
    amountConfig.sendCurrency,
    dataSign,
  ]);
  return data;
};
