import React, { useEffect, useRef, useState } from "react";
import {
  IBtcFeeConfig,
  IFeeConfig,
  IGasConfig,
  IGasSimulator,
  ISenderConfig,
} from "@owallet/hooks";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores";
import { FormattedMessage, useIntl } from "react-intl";
import { Box } from "../../box";
// import {BaseModalHeader} from '../../modal';
// import {Label} from '../label';
import { useStyle } from "../../../styles";
import { FeeSelector } from "./fee-selector";
import { Toggle } from "../../toggle";
import { Columns } from "../../column";
import { Gutter } from "../../gutter";
import { Text, View } from "react-native";
import { Button } from "../../button";
// import {TextInput} from '../text-input/text-input';
import { Dropdown } from "../../dropdown";
import { Dec } from "@owallet/unit";
// import {registerCardModal} from '../../modal/card';
import { VerticalCollapseTransition } from "../../transition";
import { GuideBox } from "../../guide-box";
import { XAxis } from "../../axis";
import OWText from "@components/text/ow-text";
import { registerModal } from "@src/modals/base";
import { TextInput } from "@components/input";

export const TransactionBtcFeeModal = registerModal(
  observer<{
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    senderConfig: ISenderConfig;
    feeConfig: IBtcFeeConfig;
    disableAutomaticFeeSet?: boolean;
  }>(({ senderConfig, feeConfig, setIsOpen, disableAutomaticFeeSet }) => {
    const { queriesStore, uiConfigStore } = useStore();
    const intl = useIntl();
    const style = useStyle();

    useEffect(() => {
      if (uiConfigStore.rememberLastFeeOption) {
        if (feeConfig.type !== "manual") {
          uiConfigStore.setLastFeeOption(feeConfig.type);
        }
      } else {
        uiConfigStore.setLastFeeOption(false);
      }
    }, [feeConfig.type, uiConfigStore, uiConfigStore.rememberLastFeeOption]);

    const [showChangesApplied, setShowChangesApplied] = useState(false);
    const feeConfigCurrencyString = feeConfig
      .toStdFee()
      .amount.map((x) => x.denom)
      .join(",");
    const prevFeeConfigType = useRef(feeConfig.type);
    const prevFeeConfigCurrency = useRef(feeConfigCurrencyString);
    const lastShowChangesAppliedTimeout = useRef<NodeJS.Timeout | undefined>(
      undefined
    );
    useEffect(() => {
      if (
        prevFeeConfigType.current !== feeConfig.type ||
        prevFeeConfigCurrency.current !== feeConfigCurrencyString
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
    }, [feeConfig.type, feeConfigCurrencyString]);

    return (
      <Box paddingX={12} paddingBottom={12}>
        {/*<BaseModalHeader*/}
        {/*  title={intl.formatMessage({*/}
        {/*    id: 'components.input.fee-control.modal.title',*/}
        {/*  })}*/}
        {/*  titleStyle={style.flatten(['h4', 'text-left'])}*/}
        {/*  style={style.flatten(['padding-left-8'])}*/}
        {/*/>*/}
        <OWText>
          {intl.formatMessage({
            id: "components.input.fee-control.modal.title",
          })}
        </OWText>
        <Gutter size={12} />

        <XAxis alignY="center">
          {/*<Label*/}
          {/*  content={}*/}
          {/*/>*/}
          <OWText>
            {intl.formatMessage({
              id: "components.input.fee-control.modal.fee-title",
            })}
          </OWText>
          <View style={{ flex: 1 }} />

          {!disableAutomaticFeeSet ? (
            <React.Fragment>
              <Box
                width={6}
                height={6}
                borderRadius={999}
                backgroundColor={style.get("color-blue-400").color}
              />
              <Gutter size={8} />

              <Text style={style.flatten(["subtitle3", "color-gray-200"])}>
                <FormattedMessage id="components.input.fee-control.modal.remember-last-fee-option" />
              </Text>

              <Gutter size={8} />

              <Toggle
                on={uiConfigStore.rememberLastFeeOption}
                onChange={(v) => uiConfigStore.setRememberLastFeeOption(v)}
              />
            </React.Fragment>
          ) : null}
        </XAxis>

        <Gutter size={6} />

        <FeeSelector feeConfig={feeConfig} />

        <Gutter size={12} />

        <Dropdown
          label={intl.formatMessage({
            id: "components.input.fee-control.modal.fee-token-dropdown-label",
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
            .map((cur) => {
              return {
                key: cur.coinMinimalDenom,
                label: cur.coinDenom,
              };
            })}
          selectedItemKey={feeConfig.fees[0]?.currency.coinMinimalDenom}
          onSelect={(key) => {
            const currency = feeConfig.selectableFeeCurrencies.find(
              (cur) => cur.coinMinimalDenom === key
            );
            if (currency) {
              if (feeConfig.type !== "manual") {
                feeConfig.setFee({
                  type: feeConfig.type,
                  currency: currency,
                });
              } else {
                feeConfig.setFee({
                  type: "average",
                  currency: currency,
                });
              }
            }
          }}
          size="large"
        />

        <Gutter size={12} />
        {disableAutomaticFeeSet ? (
          <React.Fragment>
            <Gutter size={12} />
            <GuideBox
              title={intl.formatMessage({
                id: "components.input.fee-control.modal.guide.external-fee-set",
              })}
              backgroundColor={style.get("color-gray-500").color}
            />
          </React.Fragment>
        ) : null}

        <VerticalCollapseTransition collapsed={!showChangesApplied}>
          <Gutter size={12} />

          <GuideBox
            color="safe"
            title={intl.formatMessage({
              id: "components.input.fee-control.modal.notification.changes-applied",
            })}
          />
        </VerticalCollapseTransition>

        <Gutter size={12} />

        <Button
          text={intl.formatMessage({
            id: "button.close",
          })}
          color="secondary"
          size="large"
          onPress={() => setIsOpen(false)}
        />
      </Box>
    );
  })
);
