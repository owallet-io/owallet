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
import { Button, OWButton } from "../../button";
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
import WrapViewModal from "@src/modals/wrap/wrap-view-modal";

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
      <WrapViewModal
        style={{
          paddingHorizontal: 0,
        }}
        title="SET FEE"
        disabledScrollView={false}
        subTitle={"The fee required to successfully conduct a transaction"}
      >
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
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "flex-end",
            paddingVertical: 10,
          }}
        >
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
        </View>

        <FeeSelector feeConfig={feeConfig} />
        <OWButton
          label="Confirm"
          onPress={async () => {
            setIsOpen(false);
          }}
          style={[
            {
              marginTop: 20,
              borderRadius: 999,
            },
          ]}
          textStyle={{
            fontSize: 14,
            fontWeight: "600",
          }}
        />
      </WrapViewModal>
    );
  })
);
