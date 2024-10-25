import React, { FunctionComponent, useEffect, useMemo, useState } from 'react';
import { SignEthereumInteractionStore } from '@owallet/stores-core';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../stores';
import { FormattedMessage, useIntl } from 'react-intl';
import { useStyle } from '../../styles';
import {
  useAmountConfig,
  useFeeConfig,
  useGasConfig,
  useGasSimulator,
  useSenderConfig,
  useZeroAllowedGasConfig
} from '@owallet/hooks';
// import {BaseModalHeader} from '../../components/modal';
import { Column, Columns } from '../../components/column';
import { Text } from 'react-native';
import { Gutter } from '../../components/gutter';
import { Box } from '../../components/box';
import { XAxis } from '../../components/axis';
import { CloseIcon } from '../../components/icon';
// import {CodeBracketIcon} from '../../components/icon/code-bracket';
// import {registerCardModal} from '../../components/modal/card';
// import {SpecialButton} from '../../components/special-button';
// import {ScrollView} from '../../components/scroll-view/common-scroll-view';
import { ScrollView, TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { FeeSummary } from './components/fee-summary';
// import {defaultRegistry} from './components/eth-tx/registry';
import { UnsignedTransaction } from '@ethersproject/transactions';
import { CoinPretty, Dec, Int } from '@owallet/unit';
import { Buffer } from 'buffer/';
import { registerModal } from '@src/modals/base';
import { defaultRegistry } from '@src/modals/sign/cosmos/message-registry';
import { OWButton } from '@components/button';
import OWText from '@components/text/ow-text';
import OWIcon from '@components/ow-icon/ow-icon';
import { AsyncKVStore } from '@src/common';
import { FeeControl } from '@src/screens/components/fee-control';
// import { EthSignType } from '@owallet/types';
import Web3 from 'web3';

const EthSignType = {
  MESSAGE: 'message',
  TRANSACTION: 'transaction',
  EIP712: 'eip-712'
};

export const SignEthereumModal = registerModal(
  observer<{
    interactionData: NonNullable<SignEthereumInteractionStore['waitingData']>;
  }>(({ interactionData }) => {
    const {
      chainStore,
      signEthereumInteractionStore,
      queriesStore,
      uiConfigStore,
      accountStore,
      ethereumAccountStore
    } = useStore();

    const intl = useIntl();
    const style = useStyle();

    const { message, signType, signer, chainId } = interactionData.data;

    const account = accountStore.getAccount(chainId);
    const ethereumAccount = ethereumAccountStore.getAccount(chainId);
    const chainInfo = chainStore.getChain(chainId);

    const senderConfig = useSenderConfig(chainStore, chainId, signer);
    const gasConfig = useZeroAllowedGasConfig(chainStore, chainId, 0);
    const amountConfig = useAmountConfig(chainStore, queriesStore, chainId, senderConfig);
    const feeConfig = useFeeConfig(chainStore, queriesStore, chainId, senderConfig, amountConfig, gasConfig);

    const [signingDataBuff, setSigningDataBuff] = useState(Buffer.from(message));
    const isTxSigning = signType === EthSignType.TRANSACTION;

    const gasSimulator = useGasSimulator(
      new AsyncKVStore('gas-simulator.ethereum.sign'),
      chainStore,
      chainInfo.chainId,
      gasConfig,
      feeConfig,
      'evm/native',
      () => {
        if (!isTxSigning) {
          throw new Error('Gas simulator is only working for transaction signing');
        }

        if (chainInfo.evm == null) {
          throw new Error('Gas simulator is only working with EVM info');
        }

        const unsignedTx = JSON.parse(Buffer.from(message).toString('utf8'));

        return {
          simulate: () =>
            ethereumAccount.simulateGas(account.ethereumHexAddress, {
              to: unsignedTx.to,
              data: unsignedTx.data,
              value: unsignedTx.value
            })
        };
      }
    );

    const { maxFeePerGas, maxPriorityFeePerGas, gasPrice } = (() => {
      if (isTxSigning) {
        const { maxFeePerGas, maxPriorityFeePerGas, gasPrice } = feeConfig.getEIP1559TxFees(
          feeConfig.type === 'manual' ? uiConfigStore.lastFeeOption || 'average' : feeConfig.type
        );

        return maxFeePerGas && maxPriorityFeePerGas
          ? {
              maxFeePerGas: `0x${BigInt(maxFeePerGas.truncate().toString()).toString(16)}`,
              maxPriorityFeePerGas: `0x${BigInt(maxPriorityFeePerGas.truncate().toString()).toString(16)}`,
              gasPrice: undefined
            }
          : {
              maxFeePerGas: undefined,
              maxPriorityFeePerGas: undefined,
              gasPrice: `0x${BigInt(gasPrice?.truncate().toString() ?? 0).toString(16)}`
            };
      }

      return {
        maxFeePerGas: undefined,
        maxPriorityFeePerGas: undefined,
        gasPrice: undefined
      };
    })();

    useEffect(() => {
      if (isTxSigning) {
        const unsignedTx = JSON.parse(Buffer.from(message).toString('utf8'));

        const gasLimitFromTx = BigInt(unsignedTx.gasLimit ?? unsignedTx.gas ?? 0);
        if (gasLimitFromTx > 0) {
          gasConfig.setValue(gasLimitFromTx.toString());

          const gasPriceFromTx = BigInt(unsignedTx.maxFeePerGas ?? unsignedTx.gasPrice ?? 0);

          if (gasPriceFromTx > 0) {
            feeConfig.setFee(
              new CoinPretty(chainInfo.currencies[0], new Dec(gasConfig.gas).mul(new Dec(gasPriceFromTx)))
            );
          }
        }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
      if (isTxSigning && !interactionData.isInternal) {
        const unsignedTx = JSON.parse(Buffer.from(message).toString('utf8'));

        if (gasConfig.gas > 0) {
          unsignedTx.gasLimit = `0x${gasConfig.gas.toString(16)}`;

          if (!unsignedTx.maxFeePerGas && !unsignedTx.gasPrice) {
            unsignedTx.maxFeePerGas = `0x${new Int(feeConfig.getFeePrimitive()[0].amount)
              .div(new Int(gasConfig.gas))
              .toBigNumber()
              .toString(16)}`;
          }
        }

        if (!unsignedTx.maxPriorityFeePerGas && !unsignedTx.gasPrice && maxPriorityFeePerGas) {
          unsignedTx.maxPriorityFeePerGas = unsignedTx.maxPriorityFeePerGas ?? maxPriorityFeePerGas;
        }

        if (!unsignedTx.gasPrice && !unsignedTx.maxFeePerGas && !unsignedTx.maxPriorityFeePerGas && gasPrice) {
          unsignedTx.gasPrice = gasPrice;
        }

        if (!unsignedTx.maxPriorityFeePerGas) {
          // set default maxPriorityFeePerGas to 1 gwei to avoid `transaction underpriced: gas tip cap 0` error
          unsignedTx.maxPriorityFeePerGas = Web3.utils.toWei('1', 'gwei');
        }

        console.log('unsignedTx', unsignedTx);

        setSigningDataBuff(Buffer.from(JSON.stringify(unsignedTx), 'utf8'));
      }
    }, [
      gasConfig.gas,
      isTxSigning,
      message,
      maxFeePerGas,
      maxPriorityFeePerGas,
      gasPrice,
      gasSimulator,
      gasConfig,
      feeConfig,
      interactionData.isInternal
    ]);

    useEffect(() => {
      (async () => {
        if (isTxSigning && chainInfo.features.includes('op-stack-l1-data-fee')) {
          const { to, gasLimit, value, data, chainId }: UnsignedTransaction = JSON.parse(
            Buffer.from(message).toString('utf8')
          );

          const l1DataFee = await ethereumAccount.simulateOpStackL1Fee({
            to,
            gasLimit,
            value,
            data,
            chainId
          });
          feeConfig.setL1DataFee(new Dec(BigInt(l1DataFee)));
        }
      })();
    }, [chainInfo.features, ethereumAccount, feeConfig, isTxSigning, message]);

    useEffect(() => {
      if (isTxSigning) {
        // Refresh EIP-1559 fee every 12 seconds.
        const intervalId = setInterval(() => {
          feeConfig.refreshEIP1559TxFees();
        }, 12000);

        return () => clearInterval(intervalId);
      }
    }, [isTxSigning, feeConfig]);

    const signingDataText = useMemo(() => {
      switch (signType) {
        case EthSignType.MESSAGE:
          // If the message is 32 bytes, it's probably a hash.
          if (signingDataBuff.length === 32) {
            return signingDataBuff.toString('hex');
          } else {
            const text = (() => {
              const string = signingDataBuff.toString('utf8');
              if (string.startsWith('0x')) {
                return Buffer.from(string.slice(2), 'hex').toString('utf8');
              }

              return string;
            })();

            // If the text contains RTL mark, escape it.
            return text.replace(/\u202E/giu, '\\u202E');
          }
        case EthSignType.TRANSACTION:
          return JSON.stringify(JSON.parse(signingDataBuff.toString('utf8')), null, 2);
        case EthSignType.EIP712:
          return JSON.stringify(JSON.parse(signingDataBuff.toString()), null, 2);
        default:
          return signingDataBuff.toString('hex');
      }
    }, [signingDataBuff, signType]);

    const [isViewData, setIsViewData] = useState(false);

    const approve = async () => {
      try {
        await signEthereumInteractionStore.approveWithProceedNext(
          interactionData.id,
          Buffer.from(signingDataText),
          undefined,
          async () => {
            // noop
          },
          {
            preDelay: 200
          }
        );
      } catch (e) {
        console.log(e);
      }
    };

    return (
      <Box style={style.flatten(['padding-12', 'padding-top-0'])}>
        <OWText size={16} weight={'700'}>
          {intl.formatMessage({
            id: isTxSigning ? 'page.sign.ethereum.tx.title' : 'page.sign.ethereum.title'
          })}
        </OWText>
        <Gutter size={24} />

        <Columns sum={1} alignY="center">
          <Text style={style.flatten(['h5', 'color-label-default'])}>
            <FormattedMessage id="page.sign.ethereum.tx.summary" />
          </Text>

          <Column weight={1} />

          <ViewDataButton isViewData={isViewData} setIsViewData={setIsViewData} />
        </Columns>

        <Gutter size={8} />

        {isViewData ? (
          <Box maxHeight={128} backgroundColor={style.get('color-gray-500').color} padding={12} borderRadius={6}>
            <ScrollView persistentScrollbar={true}>
              <Text style={style.flatten(['body3', 'color-text-middle'])}>{signingDataText}</Text>
            </ScrollView>
          </Box>
        ) : (
          <Box
            padding={12}
            minHeight={128}
            maxHeight={240}
            backgroundColor={style.get('color-gray-500').color}
            borderRadius={6}
          >
            {
              //@ts-ignore
              defaultRegistry.render(
                interactionData.data.chainId,
                JSON.parse(Buffer.from(interactionData.data.message).toString()) as UnsignedTransaction
              ).content
            }
          </Box>
        )}

        <Gutter size={60} />
        {interactionData.isInternal && <FeeSummary feeConfig={feeConfig} gasConfig={gasConfig} />}

        <Gutter size={12} />

        <FeeControl
          feeConfig={feeConfig}
          senderConfig={senderConfig}
          gasConfig={gasConfig}
          gasSimulator={gasSimulator}
          isForEVMTx
        />

        <OWButton
          // size="large"
          label={intl.formatMessage({
            id: 'button.approve'
          })}
          loading={signEthereumInteractionStore.isObsoleteInteraction(interactionData.id)}
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
        <Text style={style.flatten(['text-button2', 'color-label-default'])}>
          <FormattedMessage id="page.sign.cosmos.tx.view-data-button" />
        </Text>

        <Gutter size={4} />

        {isViewData ? (
          <CloseIcon size={12} color={style.get('color-gray-100').color} />
        ) : (
          // <CodeBracketIcon
          //   size={12}
          //   color={style.get('color-gray-100').color}
          // />
          <OWIcon size={12} name={'tdesignbrackets'} color={style.get('color-gray-100').color} />
        )}
      </XAxis>
    </TouchableWithoutFeedback>
  );
};
