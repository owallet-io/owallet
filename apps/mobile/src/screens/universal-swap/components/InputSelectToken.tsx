import {
  ActivityIndicator,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { IInputSelectToken } from "../types";
import OWIcon from "@src/components/ow-icon/ow-icon";
import { Text } from "@src/components/text";
import { BalanceText } from "./BalanceText";
import { TypeTheme, useTheme } from "@src/themes/theme-provider";
import { find } from "lodash";
import _debounce from "lodash/debounce";
import { tokensIcon } from "@oraichain/oraidex-common";
import { useStore } from "@src/stores";
import { maskedNumber } from "@src/utils/helper";
import { unknownToken } from "@owallet/common";

const InputSelectToken: FunctionComponent<IInputSelectToken> = ({
  tokenActive,
  amount,
  onChangeAmount,
  onOpenTokenModal,
  editable,
  loading,
  impactWarning,
}) => {
  const { colors } = useTheme();
  const { appInitStore, chainStore } = useStore();

  const styles = styling(colors);
  const [txt, setText] = useState("0");
  const [tokenIcon, setTokenIcon] = useState(null);

  const prices = appInitStore.getInitApp.prices;

  const currencyValue = useMemo(() => {
    const usdPrice = prices[tokenActive.coinGeckoId];
    if (usdPrice) {
      return (Number(amount) * Number(usdPrice)).toFixed(2);
    }
    return 0;
  }, [amount]);

  useEffect(() => {
    setText(Number(Number(amount).toFixed(6)).toString());
  }, [amount]);

  const handleChangeAmount = (amount) => {
    onChangeAmount(Number(Number(amount).toFixed(6)).toString());
  };

  const debounceFn = useCallback(_debounce(handleChangeAmount, 1000), []);

  useEffect(() => {
    const tokenIcon = find(
      tokensIcon,
      (tk) => tk.coinGeckoId === tokenActive.coinGeckoId
    );
    const currencies = tokenActive.chainId
      ? chainStore.getChain(tokenActive.chainId).currencies
      : [];
    const tokenIconFromLocal = currencies.find(
      (tk) => tk.coinGeckoId === tokenActive.coinGeckoId
    );
    setTokenIcon(tokenIcon ? tokenIcon : tokenIconFromLocal);
  }, [tokenActive]);

  return (
    <View style={[styles.containerInputSelectToken]}>
      <TouchableOpacity
        onPress={onOpenTokenModal}
        style={styles.btnChainContainer}
      >
        <View
          style={{
            width: 33,
            height: 33,
            borderRadius: 999,
            backgroundColor: colors["neutral-surface-action"],
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <OWIcon
            style={{ borderRadius: 999 }}
            type="images"
            source={{
              uri:
                tokenIcon?.Icon ||
                tokenIcon?.coinImageUrl ||
                unknownToken.coinImageUrl,
            }}
            size={30}
          />
        </View>

        <View style={[styles.ml8, styles.itemTopBtn]}>
          <View style={styles.pr4}>
            <Text weight="600" size={16} color={colors["neutral-text-action"]}>
              {tokenActive?.name}
            </Text>
          </View>
          <OWIcon
            color={colors["neutral-icon-on-light"]}
            name="down"
            size={16}
          />
        </View>
      </TouchableOpacity>

      <View style={styles.containerInput}>
        {loading ? (
          <View
            style={{
              backgroundColor: colors["neutral-surface-card"],
              zIndex: 999,
              alignContent: "center",
              justifyContent: "center",
            }}
          >
            <ActivityIndicator />
          </View>
        ) : (
          <>
            <TextInput
              editable={editable}
              placeholder="0"
              textAlign="right"
              value={txt}
              onFocus={() => {
                if (!txt || Number(txt) === 0) {
                  setText("");
                }
              }}
              onChangeText={(t) => {
                const newAmount = t.replace(/,/g, ".");
                setText(newAmount.toString());
                debounceFn(newAmount);
              }}
              defaultValue={amount ?? "0"}
              onBlur={() => {
                handleChangeAmount(txt);
              }}
              keyboardType="numeric"
              style={[styles.textInput, styles.colorInput]}
              placeholderTextColor={colors["neutral-text-title"]}
            />
            <View style={{ alignSelf: "flex-end" }}>
              <BalanceText color={colors["neutral-text-body3"]} weight="500">
                ≈ ${maskedNumber(currencyValue) || 0}{" "}
                {impactWarning && impactWarning > 0 ? (
                  <Text
                    weight="500"
                    color={
                      impactWarning > 10
                        ? colors["error-text-body"]
                        : impactWarning > 5
                        ? colors["warning-text-body"]
                        : colors["neutral-text-body3"]
                    }
                  >{`(-${impactWarning.toFixed(2)}%)`}</Text>
                ) : null}
              </BalanceText>
            </View>
          </>
        )}
      </View>
    </View>
  );
};

export default InputSelectToken;

const styling = (colors: TypeTheme["colors"]) =>
  StyleSheet.create({
    mt_4: {
      marginTop: -4,
    },
    colorInput: {
      color: colors["neutral-text-title"],
      fontWeight: "500",
    },
    pr4: {
      paddingRight: 4,
    },
    labelSymbol: {
      paddingRight: 5,
    },
    itemTopBtn: {
      flexDirection: "row",
      alignItems: "center",
    },
    mtde5: {
      marginTop: -5,
    },
    textInput: {
      width: "100%",
      fontSize: 22,
      paddingVertical: 0,
    },
    containerInput: {
      flex: 1,
      alignItems: "flex-end",
    },
    ml8: {
      paddingLeft: 8,
    },
    btnChainContainer: {
      flexDirection: "row",
      alignItems: "center",
      borderRadius: 999,
      backgroundColor: colors["neutral-surface-action"],
      paddingHorizontal: 12,
      height: 54,
      borderWidth: 1,
      borderColor: colors["neutral-surface-pressed"],
    },
    containerInputSelectToken: {
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      paddingBottom: 8,
    },
  });
