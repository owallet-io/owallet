import { Dec, Int } from '@owallet/unit';
import {
  DEFAULT_FEE_LIMIT_TRON,
  estimateBandwidthTron,
  EXTRA_FEE_LIMIT_TRON,
  getEvmAddress,
  isBase58,
  TronWebProvider
} from '@owallet/common';
import { CoinPrimitive, IChainInfoImpl } from '@owallet/stores';
import { KeyRingStore } from '@owallet/stores-core';
import { TrxQueriesImpl } from '@owallet/stores-trx';
import { useEffect, useState } from 'react';
import { AmountConfig } from '../amount';
import { RecipientConfig } from '../recipient';
import { ChainInfoWithCoreTypes } from '@owallet/background';

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
  queriesTron: TrxQueriesImpl,
  chainInfo: IChainInfoImpl<ChainInfoWithCoreTypes>,
  vaultId: string,
  keyringStore: KeyRingStore,
  dataSign: any
): IGetFeeTron => {
  const initData = {
    feeLimit: new Int(DEFAULT_FEE_LIMIT_TRON),
    estimateEnergy: new Int(0),
    estimateBandwidth: new Int(0),
    feeTrx: null
  };
  const [data, setData] = useState<IGetFeeTron>(initData);

  if (!isBase58(addressTronBase58)) return;
  const accountTronInfo = queriesTron.queryAccount.getQueryWalletAddress(addressTronBase58);
  const chainParameter = queriesTron.queryChainParameter.getQueryChainParameters();

  const feeCurrency = chainInfo.feeCurrencies[0];
  const { bandwidthRemaining, energyRemaining } = accountTronInfo;

  const caculatorAmountBandwidthFee = (signedTx, bandwidthRemaining): Int => {
    if (!signedTx || !bandwidthRemaining) return;
    const bandwidthUsed = estimateBandwidthTron(signedTx);
    if (!bandwidthUsed) return;
    const bandwidthUsedInt = new Int(bandwidthUsed);
    setData(prevState => ({
      ...prevState,
      estimateBandwidth: bandwidthUsedInt
    }));
    const bandwidthEstimated = bandwidthRemaining.sub(bandwidthUsedInt);
    let amountBandwidthFee = new Int(0);
    if (bandwidthEstimated.lt(new Int(0))) {
      const fee = bandwidthUsedInt.mul(chainParameter.bandwidthPrice).toDec().roundUp();
      if (!fee) return;
      amountBandwidthFee = fee;
    }
    return amountBandwidthFee;
  };
  const caculatorAmountEnergyFee = (signedTx, energyRemaining, energy_used): Int => {
    if (!signedTx || !energyRemaining || !energy_used) return;
    const energyUsedInt = new Int(energy_used);
    setData(prevState => ({
      ...prevState,
      estimateEnergy: energyUsedInt
    }));
    const energyEstimated = energyRemaining.sub(energyUsedInt);
    let amountEnergyFee = new Int(0);
    if (energyEstimated.lt(new Int(0))) {
      amountEnergyFee = energyUsedInt.sub(energyRemaining).mul(chainParameter.energyPrice).toDec().roundUp();
    }
    return amountEnergyFee;
  };

  const estimateForTrigger = async dataReq => {
    console.log('estimateForTrigger', dataReq);

    const tronWeb = TronWebProvider(chainInfo.rpc);
    console.log(tronWeb, 'tronWeb');
    try {
      const triggerContract = await tronWeb.transactionBuilder.triggerConstantContract(
        dataReq.address,
        dataReq.functionSelector,
        {
          ...dataReq.options,
          feeLimit: DEFAULT_FEE_LIMIT_TRON + Math.floor(Math.random() * 100)
        },
        dataReq.parameters,
        dataReq.issuerAddress
      );
      console.log('B4: simulate sign trigger data request Trigger: ', dataReq);
      console.log('B4: simulate sign trigger data after Trigger: ', triggerContract);
      if (!triggerContract?.energy_used) return;
      const signedTx = await keyringStore.simulateSignTron(
        triggerContract.transaction,
        vaultId,
        chainInfo.bip44.coinType
      );

      console.log('signedTx', signedTx);

      const amountBandwidthFee = caculatorAmountBandwidthFee(signedTx.signedTxn, bandwidthRemaining);
      const amountEnergyFee = caculatorAmountEnergyFee(
        signedTx.signedTxn,
        energyRemaining,
        triggerContract.energy_used
      );
      const trc20Fee = amountBandwidthFee.add(amountEnergyFee);
      console.log('trc20Fee', trc20Fee.toString());
      if (!trc20Fee) return;
      setData(prevState => ({
        ...prevState,
        feeTrx: {
          denom: feeCurrency.coinMinimalDenom,
          amount: trc20Fee.toString()
        }
      }));
      const feeLimit = new Int(triggerContract.energy_used)
        .mul(chainParameter.energyPrice)
        .add(new Int(EXTRA_FEE_LIMIT_TRON));
      setData(prevState => ({
        ...prevState,
        feeLimit
      }));
    } catch (err) {
      console.log('err on estimateForTrigger', err);
    }
  };
  const simulateSignTron = async (vaultId, coinType) => {
    console.log(
      'amountConfig 222',
      amountConfig.amount[0].currency.coinMinimalDenom,
      recipientConfig.recipient,
      addressTronBase58
    );

    if (dataSign?.functionSelector) {
      try {
        if (addressTronBase58?.length <= 0 || !addressTronBase58?.length) return;
        estimateForTrigger(dataSign);
        return;
      } catch (e) {
        setData(initData);
        console.log(e, 'err');
      }
      return;
    }
    if (!amountConfig.amount || !recipientConfig.recipient || !addressTronBase58) {
      console.log(';get here 1');

      setData(initData);
      return;
    }

    console.log('recipientConfig.recipient', recipientConfig.recipient);

    const tronWeb = TronWebProvider(chainInfo.rpc);
    const recipientInfo = await queriesTron.queryAccount
      .getQueryWalletAddress(recipientConfig.recipient)
      .waitFreshResponse();

    console.log('get here 1.54', recipientInfo);

    if (recipientInfo) {
      console.log('get here 2', recipientInfo);

      const { data } = recipientInfo;

      console.log('data 111', data);

      if (!data?.activated) {
        setData(prevState => ({
          ...prevState,
          feeTrx: {
            denom: feeCurrency.coinMinimalDenom,
            //TODO: With new account tron fee is 1 TRX
            amount: '1000000'
          }
        }));
      } else if (amountConfig.amount[0].currency.coinMinimalDenom === feeCurrency.coinMinimalDenom) {
        const transaction = await tronWeb.transactionBuilder.sendTrx(
          recipientConfig.recipient,
          amountConfig.amount[0].toDec().toString(),
          addressTronBase58,
          1
        );
        const signedTx = await keyringStore.simulateSignTron(transaction, vaultId, coinType);

        const amountBandwidthFee = caculatorAmountBandwidthFee(signedTx, bandwidthRemaining);
        setData(prevState => ({
          ...prevState,
          feeTrx: {
            denom: feeCurrency.coinMinimalDenom,
            amount: amountBandwidthFee.toString()
          }
        }));
      } else if (amountConfig.amount[0].currency.coinMinimalDenom?.includes('erc20')) {
        const contractAddress = amountConfig.amount[0].currency.coinMinimalDenom.startsWith('erc20')
          ? //@ts-ignore
            amountConfig.amount[0].currency.contractAddress
          : null;
        const dataReq = {
          address: contractAddress,
          functionSelector: 'transfer(address,uint256)',
          options: {
            feeLimit: DEFAULT_FEE_LIMIT_TRON + Math.floor(Math.random() * 100)
          },
          parameters: [
            {
              type: 'address',
              value: getEvmAddress(recipientConfig.recipient)
            },
            {
              type: 'uint256',
              value: amountConfig.amount[0]
                .toDec()
                .mul(new Dec(10 ** amountConfig.amount[0].currency.coinDecimals))
                .round()
                .toString()
            }
          ],
          issuerAddress: addressTronBase58
        };
        console.log('dataReq', dataReq);

        estimateForTrigger(dataReq);
        return;
      } else {
        setData(initData);
      }
    }
  };
  useEffect(() => {
    console.log('get here simulateSignTron', simulateSignTron, vaultId, chainInfo.bip44.coinType);
    simulateSignTron(vaultId, chainInfo.bip44.coinType);
  }, [amountConfig.amount, recipientConfig.recipient, amountConfig, vaultId]);

  return data;
};
