import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
} from "react";
import { IInputSelectToken } from "../types";
import OWIcon from "@src/components/ow-icon/ow-icon";
import { Text } from "@src/components/text";
import { BalanceText } from "./BalanceText";
import { TypeTheme, useTheme } from "@src/themes/theme-provider";
import { tokenImg } from "../helpers";
import { find } from "lodash";
import _debounce from "lodash/debounce";

const InputSelectToken: FunctionComponent<IInputSelectToken> = ({
  tokenActive,
  amount,
  onChangeAmount,
  onOpenTokenModal,
  editable,
}) => {
  const { colors } = useTheme();
  const styles = styling(colors);
  const [txt, setText] = useState("0");
  const [tokenIcon, setTokenIcon] = useState(null);

  useEffect(() => {
    setText(Number(Number(amount).toFixed(6)).toString());
  }, [amount]);

  const handleChangeAmount = (amount) => {
    onChangeAmount(Number(Number(amount).toFixed(6)).toString());
  };

  const debounceFn = useCallback(_debounce(handleChangeAmount, 500), []);

  useEffect(() => {
    const tokenIcon = find(
      tokenImg,
      (tk) => tk.coinGeckoId === tokenActive.coinGeckoId
    );
    setTokenIcon(tokenIcon);
  }, [tokenActive]);

  return (
    <View style={[styles.containerInputSelectToken]}>
      <TouchableOpacity
        onPress={onOpenTokenModal}
        style={styles.btnChainContainer}
      >
        <OWIcon type="images" source={{ uri: tokenIcon?.Icon }} size={30} />
        <View style={[styles.ml8, styles.itemTopBtn]}>
          <View style={styles.pr4}>
            <Text weight="700" size={20} color={colors["text-title"]}>
              {tokenActive?.name}
            </Text>
            <BalanceText size={12} weight="500" style={styles.mt_4}>
              {tokenActive?.org}
            </BalanceText>
          </View>
          <OWIcon color={colors["blue-300"]} name="down" size={16} />
        </View>
      </TouchableOpacity>

      <View style={styles.containerInput}>
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
          placeholderTextColor={colors["text-place-holder"]}
        />
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
      color: colors["text-title"],
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
      fontSize: 34,
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
      paddingHorizontal: 7,
      borderRadius: 24,
      backgroundColor: colors["bg-btn-select-token"],
      paddingVertical: 2,
      marginRight: 3,
    },
    containerInputSelectToken: {
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      paddingBottom: 8,
    },
  });
