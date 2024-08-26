import { OWButton } from "@src/components/button";
import { Text } from "@src/components/text";
import { useTheme } from "@src/themes/theme-provider";
import { observer } from "mobx-react-lite";
import React, {
  FunctionComponent,
  useCallback,
  useMemo,
  useState,
} from "react";
import { StyleSheet, View } from "react-native";
import { TextInput } from "../../../components/input";
import { registerModal } from "../../../modals/base";
import { CardModal } from "../../../modals/card";
import { useStore } from "../../../stores";
import { typography } from "../../../themes";
import { BIP44Option } from "./bip44-option";
import { BottomSheetProps } from "@gorhom/bottom-sheet";
import { getKeyDerivationFromAddressType } from "@owallet/common";
export const BIP44AdvancedButton: FunctionComponent<{
  bip44Option: BIP44Option;
}> = observer(({ bip44Option }) => {
  const { appInitStore } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <View>
      <BIP44SelectModal
        isOpen={isModalOpen}
        close={() => setIsModalOpen(false)}
        bip44Option={bip44Option}
      />
      <OWButton
        label="Advanced Option"
        type="link"
        size="medium"
        contentAlign="left"
        onPress={() => setIsModalOpen(true)}
      />
    </View>
  );
});

const useZeroOrPositiveIntegerString = (initialValue: string) => {
  const [value, setValue] = useState(initialValue);

  return {
    value,
    setValue: useCallback((text: string) => {
      if (!text) {
        setValue("");
        return;
      }

      const num = Number.parseInt(text);
      if (!Number.isNaN(num) && num >= 0) {
        setValue(num.toString());
      }
    }, []),
    isValid: useMemo(() => {
      if (!value) {
        return false;
      }

      const num = Number.parseInt(value);
      return !Number.isNaN(num) && num >= 0;
    }, [value]),
    number: useMemo(() => {
      return Number.parseInt(value);
    }, [value]),
  };
};

export const BIP44SelectModal: FunctionComponent<{
  isOpen: boolean;
  close: () => void;
  bottomSheetModalConfig?: Omit<BottomSheetProps, "snapPoints" | "children">;
  bip44Option: BIP44Option;
}> = registerModal(
  observer(({ bip44Option, close }) => {
    const { chainStore, appInitStore, accountStore } = useStore();

    const scheme = appInitStore.getInitApp.theme;
    const accountInfo = accountStore.getAccount(chainStore.current.chainId);

    const styles = styling(scheme);

    const account = useZeroOrPositiveIntegerString(
      bip44Option.account.toString()
    );

    const coinType = useZeroOrPositiveIntegerString(
      bip44Option.coinType
        ? bip44Option.coinType.toString()
        : chainStore.current.bip44.coinType.toString() ?? ""
    );
    const change = useZeroOrPositiveIntegerString(
      bip44Option.change.toString()
    );
    const index = useZeroOrPositiveIntegerString(bip44Option.index.toString());

    const isChangeZeroOrOne =
      change.isValid && (change.number === 0 || change.number === 1);
    const { colors } = useTheme();
    return (
      <CardModal title="HD Derivation Path">
        <Text
          style={{
            ...typography["body2"],
            marginBottom: 18,
            color: scheme === "dark" ? colors["label"] : colors["sub-text"],
          }}
        >
          Set custom address derivation path by modifying the indexes below:
        </Text>
        <View
          style={{
            marginBottom: 16,
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              ...typography["body2"],
              color: scheme === "dark" ? colors["label"] : colors["sub-text"],
            }}
          >{`m/${
            chainStore.current.networkType === "bitcoin"
              ? getKeyDerivationFromAddressType(accountInfo.addressType)
              : "44"
          }’/`}</Text>
          <TextInput
            value={coinType.value}
            containerStyle={{
              minWidth: 58,
              paddingBottom: 0,
            }}
            isBottomSheet
            inputStyle={styles.borderInput}
            style={{ textAlign: "right", color: "red" }}
            keyboardType="number-pad"
            onChangeText={coinType.setValue}
          />
          <Text
            style={{
              color: scheme === "dark" ? colors["label"] : colors["sub-text"],
            }}
          >
            ’/
          </Text>
          <TextInput
            isBottomSheet
            value={account.value}
            containerStyle={{
              minWidth: 58,
              paddingBottom: 0,
            }}
            inputStyle={styles.borderInput}
            style={{ textAlign: "right" }}
            keyboardType="number-pad"
            onChangeText={account.setValue}
          />
          <Text
            style={{
              color: scheme === "dark" ? colors["label"] : colors["sub-text"],
            }}
          >
            ’/
          </Text>
          <TextInput
            isBottomSheet
            value={change.value}
            containerStyle={{
              minWidth: 58,
              paddingBottom: 0,
            }}
            inputStyle={styles.borderInput}
            style={{ textAlign: "right", color: "red" }}
            keyboardType="number-pad"
            onChangeText={change.setValue}
          />
          <Text
            style={{
              color: scheme === "dark" ? colors["label"] : colors["sub-text"],
            }}
          >
            /
          </Text>
          <TextInput
            isBottomSheet
            value={index.value}
            containerStyle={{
              minWidth: 58,
              paddingBottom: 0,
            }}
            inputStyle={styles.borderInput}
            style={{ textAlign: "right" }}
            keyboardType="number-pad"
            onChangeText={index.setValue}
          />
        </View>
        {change.isValid && !isChangeZeroOrOne ? (
          <Text
            style={{
              paddingBottom: 8,
              ...typography["text-caption2"],
              color: colors["color-danger"],
            }}
          >
            Change should be 0 or 1
          </Text>
        ) : null}
        <OWButton
          label="Confirm"
          disabled={
            !account.isValid ||
            !change.isValid ||
            !index.isValid ||
            !isChangeZeroOrOne
          }
          onPress={() => {
            bip44Option.setCoinType(coinType.number);
            bip44Option.setAccount(account.number);
            bip44Option.setChange(change.number);
            bip44Option.setIndex(index.number);
            close();
          }}
        />
      </CardModal>
    );
  }),
  {
    disableSafeArea: true,
  }
);

const styling = (scheme) => {
  const { colors } = useTheme();
  return StyleSheet.create({
    borderInput: {
      borderColor: scheme === "dark" ? colors["border"] : colors["gray-300"],
      borderWidth: 1,
      backgroundColor:
        scheme === "dark" ? colors["input-background"] : colors["white"],
      paddingLeft: 11,
      paddingRight: 11,
      paddingTop: 12,
      paddingBottom: 12,
      borderRadius: 8,
      color: "red",
    },
  });
};
