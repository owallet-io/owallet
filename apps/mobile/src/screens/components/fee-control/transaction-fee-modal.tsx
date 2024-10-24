import React, { useEffect, useRef, useState } from 'react';
import { IFeeConfig, IGasConfig, IGasSimulator, ISenderConfig } from '@owallet/hooks';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../../stores';
import { FormattedMessage, useIntl } from 'react-intl';
import { useStyle } from '../../../styles';
import { FeeSelector } from './fee-selector';
import { Text, View } from 'react-native';
import { Dec } from '@owallet/unit';
import { Toggle } from '@src/components/toggle';
import { OWButton } from '@src/components/button';
import { TextInput } from '@src/components/input';
import { registerModal } from '@src/modals/base';
import { TouchableOpacity } from 'react-native-gesture-handler';

export const TransactionFeeModal = registerModal(
  observer<{
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;

    senderConfig: ISenderConfig;
    feeConfig: IFeeConfig;
    gasConfig: IGasConfig;
    gasSimulator?: IGasSimulator;
    disableAutomaticFeeSet?: boolean;
    isForEVMTx?: boolean;
  }>(({ senderConfig, feeConfig, gasConfig, gasSimulator, setIsOpen, disableAutomaticFeeSet, isForEVMTx }) => {
    const { queriesStore, uiConfigStore } = useStore();
    const intl = useIntl();

    const isGasSimulatorUsable = (() => {
      if (!gasSimulator) {
        return false;
      }

      if (gasSimulator.gasEstimated == null && gasSimulator.uiProperties.error) {
        return false;
      }

      return true;
    })();

    const isGasSimulatorEnabled = (() => {
      if (!isGasSimulatorUsable) {
        return false;
      }
      return gasSimulator?.enabled;
    })();

    useEffect(() => {
      if (uiConfigStore.rememberLastFeeOption) {
        if (feeConfig.type !== 'manual') {
          uiConfigStore.setLastFeeOption(feeConfig.type);
        }
      } else {
        uiConfigStore.setLastFeeOption(false);
      }
    }, [feeConfig.type, uiConfigStore, uiConfigStore.rememberLastFeeOption]);

    const [showChangesApplied, setShowChangesApplied] = useState(false);
    const feeConfigCurrencyString = feeConfig
      .toStdFee()
      .amount.map(x => x.denom)
      .join(',');
    const prevFeeConfigType = useRef(feeConfig.type);
    const prevFeeConfigCurrency = useRef(feeConfigCurrencyString);
    const prevGasConfigGas = useRef(gasConfig.gas);
    const prevGasSimulatorEnabled = useRef(isGasSimulatorEnabled);
    const lastShowChangesAppliedTimeout = useRef<NodeJS.Timeout | undefined | number>(undefined);
    useEffect(() => {
      if (
        prevFeeConfigType.current !== feeConfig.type ||
        prevFeeConfigCurrency.current !== feeConfigCurrencyString ||
        prevGasConfigGas.current !== gasConfig.gas ||
        prevGasSimulatorEnabled.current !== isGasSimulatorEnabled
      ) {
        if (lastShowChangesAppliedTimeout.current) {
          clearTimeout(lastShowChangesAppliedTimeout.current);
          lastShowChangesAppliedTimeout.current = undefined;
        }
        setShowChangesApplied(true);
        lastShowChangesAppliedTimeout.current = setTimeout(() => {
          setShowChangesApplied(false);
          lastShowChangesAppliedTimeout.current = undefined;
        }, 2500);
      }

      prevFeeConfigType.current = feeConfig.type;
      prevFeeConfigCurrency.current = feeConfigCurrencyString;
      prevGasConfigGas.current = gasConfig.gas;
      prevGasSimulatorEnabled.current = isGasSimulatorEnabled;
    }, [feeConfig.type, feeConfigCurrencyString, gasConfig.gas, isGasSimulatorEnabled]);
    const isShowingMaxFee = isForEVMTx && !!gasSimulator?.gasEstimated;

    return (
      <View>
        <View>
          <View style={{ flex: 1 }} />

          {!disableAutomaticFeeSet ? (
            <React.Fragment>
              <Text>
                <FormattedMessage id="components.input.fee-control.modal.remember-last-fee-option" />
              </Text>
              <Toggle
                on={uiConfigStore.rememberLastFeeOption}
                onChange={value => {
                  uiConfigStore.setRememberLastFeeOption(value);
                }}
              />
            </React.Fragment>
          ) : null}
        </View>

        <FeeSelector feeConfig={feeConfig} />

        <View>
          {feeConfig.selectableFeeCurrencies
            .filter((cur, i) => {
              if (i === 0) {
                return true;
              }

              const balance = queriesStore
                .get(feeConfig.chainId)
                .queryBalances.getQueryBech32Address(senderConfig.sender)
                .getBalanceFromCurrency(cur);

              return balance.toDec().gt(new Dec(0));
            })
            .map(cur => {
              return (
                <TouchableOpacity
                  onPress={() => {
                    const key = cur.coinMinimalDenom;
                    const currency = feeConfig.selectableFeeCurrencies.find(cur => cur.coinMinimalDenom === key);
                    if (currency) {
                      if (feeConfig.type !== 'manual') {
                        feeConfig.setFee({
                          type: feeConfig.type,
                          currency: currency
                        });
                      } else {
                        feeConfig.setFee({
                          type: 'average',
                          currency: currency
                        });
                      }
                    }
                  }}
                >
                  <Text>{cur.coinDenom}</Text>
                </TouchableOpacity>
              );
            })}
        </View>
        {/* <Dropdown
          label={intl.formatMessage({
            id: 'components.input.fee-control.modal.fee-token-dropdown-label'
          })}
          items={feeConfig.selectableFeeCurrencies
            .filter((cur, i) => {
              if (i === 0) {
                return true;
              }

              const balance = queriesStore
                .get(feeConfig.chainId)
                .queryBalances.getQueryBech32Address(senderConfig.sender)
                .getBalanceFromCurrency(cur);

              return balance.toDec().gt(new Dec(0));
            })
            .map(cur => {
              return {
                key: cur.coinMinimalDenom,
                label: cur.coinDenom
              };
            })}
          selectedItemKey={feeConfig.fees[0]?.currency.coinMinimalDenom}
          onSelect={key => {
            const currency = feeConfig.selectableFeeCurrencies.find(cur => cur.coinMinimalDenom === key);
            if (currency) {
              if (feeConfig.type !== 'manual') {
                feeConfig.setFee({
                  type: feeConfig.type,
                  currency: currency
                });
              } else {
                feeConfig.setFee({
                  type: 'average',
                  currency: currency
                });
              }
            }
          }}
          size="large"
        /> */}

        {/* {(() => {
          if (gasSimulator) {
            if (gasSimulator.uiProperties.error) {
              return (
                <GuideView
                  color="danger"
                  title={intl.formatMessage({
                    id: 'components.input.fee-control.modal.guide-title'
                  })}
                  paragraph={gasSimulator.uiProperties.error.message || gasSimulator.uiProperties.error.toString()}
                />
              );
            }

            if (gasSimulator.uiProperties.warning) {
              return (
                <GuideView
                  color="warning"
                  title={intl.formatMessage({
                    id: 'components.input.fee-control.modal.guide-title'
                  })}
                  paragraph={gasSimulator.uiProperties.warning.message || gasSimulator.uiProperties.warning.toString()}
                />
              );
            }
          }
        })()} */}

        {isGasSimulatorEnabled ? (
          <TextInput
            label={intl.formatMessage({
              id: 'components.input.fee-control.modal.gas-adjustment-label'
            })}
            value={gasSimulator?.gasAdjustmentValue}
            onChangeText={text => {
              gasSimulator?.setGasAdjustmentValue(text);
            }}
            inputRight={
              isGasSimulatorUsable && gasSimulator ? (
                <React.Fragment>
                  <View>
                    <Text>
                      <FormattedMessage id="components.input.fee-control.modal.auto-title" />
                    </Text>

                    <Toggle
                      on={gasSimulator.enabled}
                      onChange={isOpen => {
                        gasSimulator?.setEnabled(isOpen);
                      }}
                    />
                  </View>
                </React.Fragment>
              ) : null
            }
          />
        ) : (
          <TextInput
            label={intl.formatMessage({
              id: 'components.input.fee-control.modal.gas-amount-label'
            })}
            value={gasConfig.value}
            onChangeText={text => {
              gasConfig.setValue(text);
            }}
            inputRight={
              isGasSimulatorUsable && gasSimulator ? (
                <React.Fragment>
                  <View>
                    <Text>
                      <FormattedMessage id="components.input.fee-control.modal.auto-title" />
                    </Text>

                    <Toggle
                      on={gasSimulator.enabled}
                      onChange={isOpen => {
                        gasSimulator?.setEnabled(isOpen);
                      }}
                    />
                  </View>
                </React.Fragment>
              ) : null
            }
          />
        )}

        {/* {disableAutomaticFeeSet ? (
          <React.Fragment>
            <GuideView
              title={intl.formatMessage({
                id: 'components.input.fee-control.modal.guide.external-fee-set'
              })}
            />
          </React.Fragment>
        ) : null}

        <VerticalCollapseTransition collapsed={!showChangesApplied}>
          <GuideView
            color="safe"
            title={intl.formatMessage({
              id: 'components.input.fee-control.modal.notification.changes-applied'
            })}
          />
        </VerticalCollapseTransition> */}

        <OWButton size="large" onPress={() => setIsOpen(false)} />
      </View>
    );
  })
);
