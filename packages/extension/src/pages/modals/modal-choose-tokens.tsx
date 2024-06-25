import React, { FC, useEffect, useState } from "react";
import SlidingPane from "react-sliding-pane";
import styles from "./style.module.scss";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { HeaderModal } from "../home/components/header-modal";
import { DenomHelper, formatAddress } from "@owallet/common";
import { ObservableQueryBalanceInner } from "@owallet/stores";
import { Bech32Address } from "@owallet/cosmos";
import { IAmountConfig } from "@owallet/hooks";
import { Text } from "../../components/common/text";
import colors from "../../theme/colors";
export const removeDataInParentheses = (inputString: string): string => {
  if (!inputString) return;
  return inputString.replace(/\([^)]*\)/g, "");
};
export const extractDataInParentheses = (
  inputString: string
): string | null => {
  if (!inputString) return;
  const startIndex = inputString.indexOf("(");
  const endIndex = inputString.indexOf(")");
  if (startIndex !== -1 && endIndex !== -1) {
    return inputString.substring(startIndex + 1, endIndex);
  } else {
    return null;
  }
};

export const TokenView: FC<{
  balance: ObservableQueryBalanceInner;
  onClick: () => void;
  coinMinimalDenom: string;
}> = observer(({ coinMinimalDenom, onClick, balance }) => {
  const { priceStore } = useStore();

  const name = balance?.currency?.coinDenom;
  const getName = () => {
    return removeDataInParentheses(name);
  };
  const image = balance.currency?.coinImageUrl;
  let contractAddress: string = "";
  let amount = balance?.balance
    ?.trim(true)
    ?.shrink(true)
    ?.maxDecimals(6)
    ?.hideDenom(true);

  // If the currency is the IBC Currency.
  // Show the amount as slightly different with other currencies.
  // Show the actual coin denom to the top and just show the coin denom without channel info to the bottom.
  if ("originCurrency" in amount.currency && amount.currency.originCurrency) {
    amount = amount.setCurrency(amount.currency.originCurrency);
  } else {
    const denomHelper = new DenomHelper(amount.currency.coinMinimalDenom);
    if (denomHelper.contractAddress) {
      contractAddress = formatAddress(denomHelper.contractAddress, 8);
    }
  }
  if (extractDataInParentheses(name)) {
    contractAddress = extractDataInParentheses(name);
  }
  const tokenPrice = priceStore.calculatePrice(amount);
  return (
    <div
      style={{
        padding: 16,

        borderRadius: 12,
        backgroundColor:
          coinMinimalDenom === balance.currency?.coinMinimalDenom
            ? colors["neutral-surface-action2"]
            : colors["neutral-surface-background2"],
      }}
    >
      <div
        // key={}
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
        onClick={onClick}
      >
        <div style={{ flexDirection: "row", alignItems: "center" }}>
          <div
            style={{
              marginRight: 8,
              borderRadius: 999,
              width: 40,
              height: 40,
              backgroundColor: colors["neutral-icon-on-dark"],
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {image && <img src={image} />}
          </div>
          <div>
            <Text size={16} weight="500">
              {getName()}
            </Text>
            {contractAddress ? (
              <Text color={colors["neutral-text-body"]} size={14} weight="400">
                {contractAddress}
              </Text>
            ) : null}
          </div>
        </div>
        <div>
          <Text
            color={colors["neutral-text-title"]}
            size={16}
            weight={"500"}
            containerStyle={{
              textAlign: "right",
            }}
          >
            {amount?.toString()}
          </Text>
          <Text
            color={colors["neutral-text-body"]}
            size={14}
            weight={"400"}
            containerStyle={{
              textAlign: "right",
            }}
          >
            {tokenPrice?.toString()}
          </Text>
        </div>
      </div>
    </div>
  );
});

export const ModalChooseTokens: FC<{
  isOpen: boolean;
  onRequestClose: () => void;
  onSelectToken?: (item) => void;
  chainId?: string;
  amountConfig: IAmountConfig;
}> = observer(({ isOpen, onRequestClose, chainId, amountConfig }) => {
  const { accountStore, keyRingStore, queriesStore } = useStore();
  const [displayTokens, setDisplayTokens] = useState<
    ObservableQueryBalanceInner[]
  >([]);
  const accountInfo = accountStore.getAccount(chainId);
  const addressToFetch = accountInfo.getAddressDisplay(
    keyRingStore.keyRingLedgerAddresses,
    false
  );

  const items = amountConfig.sendableCurrencies.map((currency) => {
    let label = currency.coinDenom;

    // if is cw20 contract
    if ("originCurrency" in currency === false) {
      // show address if needed, maybe erc20 address so need check networkType later
      const denomHelper = new DenomHelper(currency.coinMinimalDenom);
      if (denomHelper.contractAddress) {
        label += ` (${Bech32Address.shortenAddress(
          denomHelper.contractAddress,
          24
        )})`;
      }
    }

    return {
      key: currency.coinMinimalDenom,
      label,
    };
  });
  useEffect(() => {
    const queryBalances = queriesStore
      .get(chainId)
      .queryBalances.getQueryBech32Address(addressToFetch);
    const tokens = queryBalances.balances;
    const displayTokens = tokens
      .filter((v, i, obj) => {
        return (
          v?.balance &&
          obj.findIndex(
            (v2) =>
              v2.balance.currency?.coinDenom === v.balance.currency?.coinDenom
          ) === i
        );
      })
      .sort((a, b) => {
        const aDecIsZero = a.balance?.toDec()?.isZero();
        const bDecIsZero = b.balance?.toDec()?.isZero();

        if (aDecIsZero && !bDecIsZero) {
          return 1;
        }
        if (!aDecIsZero && bDecIsZero) {
          return -1;
        }

        return a.currency.coinDenom < b.currency.coinDenom ? -1 : 1;
      });
    setDisplayTokens(displayTokens);
  }, [chainId, addressToFetch]);

  const selectedKey = amountConfig.sendCurrency.coinMinimalDenom;
  const setSelectedKey = (key: string | undefined) => {
    const currency = amountConfig.sendableCurrencies.find(
      (cur) => cur.coinMinimalDenom === key
    );

    amountConfig.setSendCurrency(currency);
  };

  return (
    <SlidingPane
      isOpen={isOpen}
      from="bottom"
      width="100vw"
      onRequestClose={onRequestClose}
      hideHeader={true}
      className={styles.modalNetwork}
    >
      <div className={styles.contentWrap}>
        <HeaderModal
          title={"Select token".toUpperCase()}
          onRequestClose={onRequestClose}
        />
      </div>
    </SlidingPane>
  );
});
