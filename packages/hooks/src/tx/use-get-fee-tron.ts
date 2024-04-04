import { Int } from "@owallet/unit";
import {
  DEFAULT_FEE_LIMIT_TRON,
  encodeParams,
  estimateBandwidthTron,
  EXTRA_FEE_LIMIT_TRON,
  getEvmAddress,
} from "@owallet/common";
import {
  ChainInfoInner,
  CoinPrimitive,
  KeyRingStore,
  TronQueries,
} from "@owallet/stores";
import { ChainInfoWithEmbed } from "@owallet/background";
import { useEffect, useState } from "react";
import TronWeb from "tronweb";
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
    const triggerContractFetch = await queriesTron.queryTriggerConstantContract
      .queryTriggerConstantContract(dataReq)
      .waitFreshResponse();
    const triggerContract = triggerContractFetch.data;
    console.log(triggerContract, "triggerContract");
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
    console.log(feeLimit, "feeLimit");
  };
  const simulateSignTron = async () => {
    console.log(dataSign, "dataSign");
    if (dataSign?.functionSelector) {
      try {
        const parameter = await encodeParams(dataSign?.parameters);

        const dataReq = {
          //@ts-ignore
          contract_address: dataSign?.address,
          owner_address: addressTronBase58,
          parameter,
          visible: true,
          function_selector: dataSign?.functionSelector,
        };
        estimateForTrigger(dataReq);
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
    const tronWeb = new TronWeb({
      fullHost: chainInfo.rpc,
    });
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
        const parameter = await encodeParams([
          {
            type: "address",
            value: getEvmAddress(recipientConfig.recipient),
          },
          {
            type: "uint256",
            value: amountConfig.getAmountPrimitive().amount,
          },
        ]);

        const dataReq = {
          //@ts-ignore
          contract_address: amountConfig.sendCurrency?.contractAddress,
          owner_address: addressTronBase58,
          parameter,
          visible: true,
          function_selector: "transfer(address,uint256)",
        };
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
