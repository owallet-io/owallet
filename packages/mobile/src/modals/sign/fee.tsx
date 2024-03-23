import React, { FunctionComponent, useState } from "react";
import { observer } from "mobx-react-lite";
import { IFeeConfig, IGasConfig, NotLoadedFeeError } from "@owallet/hooks";
import { View, TouchableWithoutFeedback, Keyboard } from "react-native";
import { Text } from "@src/components/text";
import { useStore } from "../../stores";
import { useStyle } from "../../styles";
import { CoinPretty, Dec, DecUtils } from "@owallet/unit";
import { TouchableOpacity } from "react-native-gesture-handler";
import { OWalletSignOptions } from "@owallet/types";
import { DownArrowIcon, RightArrowIcon } from "../../components/icon";
import { registerModal } from "../base";
import { CardModal } from "../card";
import { FeeButtons, getFeeErrorText, TextInput } from "../../components/input";
import { LoadingSpinner } from "../../components/spinner";
import { typography } from "../../themes";
import { Toggle } from "../../components/toggle";
import { useTheme } from "@src/themes/theme-provider";
import { BottomSheetProps } from "@gorhom/bottom-sheet";
import ItemDetail from "@src/screens/transactions/components/item-details";
import { capitalizedText } from "@src/utils/helper";

const FeeButtonsModal: FunctionComponent<{
  isOpen: boolean;
  close: () => void;
  bottomSheetModalConfig?: Omit<BottomSheetProps, "snapPoints" | "children">;
  feeConfig: IFeeConfig;
  gasConfig: IGasConfig;
}> = registerModal(
  observer(({ close, feeConfig, gasConfig }) => {
    const [customFee, setCustomFee] = useState(false);
    const { colors } = useTheme();
    return (
      <CardModal title="Set Fee">
        <View
          style={{
            flexDirection: "row",
            paddingBottom: 24,
            alignItems: "center",
          }}
        >
          <Toggle
            on={customFee}
            onChange={(value) => {
              setCustomFee(value);
              if (!value) {
                if (feeConfig.feeCurrency && !feeConfig.fee) {
                  feeConfig.setFeeType("average");
                }
              }
            }}
          />
          <Text
            style={{
              fontWeight: "700",
              fontSize: 16,
              lineHeight: 34,
              paddingHorizontal: 8,
            }}
          >
            Custom Fee
          </Text>
        </View>
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          {customFee ? (
            <TextInput
              label="Fee"
              placeholder="Type your Fee here"
              keyboardType={"numeric"}
              labelStyle={{
                fontSize: 16,
                fontWeight: "700",
                lineHeight: 22,
                color: colors["gray-900"],
                marginBottom: 8,
              }}
              onChangeText={(text) => {
                const fee = new Dec(Number(text.replace(/,/g, "."))).mul(
                  DecUtils.getTenExponentNInPrecisionRange(6)
                );

                feeConfig.setManualFee({
                  amount: fee.roundUp().toString(),
                  denom: feeConfig.feeCurrency.coinMinimalDenom,
                });
              }}
            />
          ) : (
            <FeeButtons
              label="Fee"
              gasLabel="Gas"
              feeConfig={feeConfig}
              gasConfig={gasConfig}
            />
          )}
        </TouchableWithoutFeedback>

        <TouchableOpacity
          onPress={close}
          style={{
            marginBottom: customFee ? 264 : 14,
            marginTop: 32,
            backgroundColor: colors["primary-surface-default"],
            borderRadius: 8,
          }}
        >
          <Text
            style={{
              color: "white",
              textAlign: "center",
              fontWeight: "700",
              fontSize: 16,
              padding: 16,
            }}
          >
            Confirm
          </Text>
        </TouchableOpacity>
      </CardModal>
    );
  }),
  {
    disableSafeArea: true,
  }
);

export const FeeInSign: FunctionComponent<{
  isInternal: boolean;

  feeConfig: IFeeConfig;
  gasConfig: IGasConfig;

  signOptions?: OWalletSignOptions;
}> = observer(({ isInternal, signOptions, feeConfig, gasConfig }) => {
  const { chainStore, priceStore } = useStore();
  const { colors } = useTheme();
  const style = useStyle();

  const preferNoSetFee = signOptions?.preferNoSetFee ?? false;

  const fee =
    feeConfig.fee ??
    new CoinPretty(
      chainStore.getChain(feeConfig.chainId).stakeCurrency,
      new Dec("0")
    );

  const feePrice = priceStore.calculatePrice(fee);

  // If the signing request is from internal and the "preferNoSetFee" option is set,
  // prevent the user to edit the fee.
  const canFeeEditable = !isInternal || !preferNoSetFee;

  let isFeeLoading = false;

  const error = feeConfig.getError();
  const errorText: string | undefined = (() => {
    if (error) {
      if (error.constructor === NotLoadedFeeError) {
        isFeeLoading = true;
      }

      return getFeeErrorText(error);
    }
  })();

  const [isSetFeeModalOpen, setIsSetFeeModalOpen] = useState(false);

  return (
    <React.Fragment>
      <FeeButtonsModal
        isOpen={isSetFeeModalOpen}
        close={() => setIsSetFeeModalOpen(false)}
        feeConfig={feeConfig}
        gasConfig={gasConfig}
      />

      <ItemDetail
        label={"Transaction fee"}
        value={
          <TouchableOpacity
            style={style.flatten(["flex-row", "items-center"])}
            disabled={!canFeeEditable}
            onPress={() => {
              setIsSetFeeModalOpen(true);
            }}
          >
            <Text
              weight={"600"}
              color={colors["primary-text-action"]}
              size={16}
            >
              {feeConfig.feeType
                ? `${capitalizedText(feeConfig.feeType)} :`
                : ""}{" "}
              {feePrice ? feePrice.toString() : "-"}
            </Text>
            {canFeeEditable ? (
              <View style={style.flatten(["margin-left-6"])}>
                <DownArrowIcon
                  color={colors["primary-text-action"]}
                  height={20}
                />
              </View>
            ) : null}
          </TouchableOpacity>
        }
      />

      {!isFeeLoading && errorText ? (
        <View>
          <Text
            style={style.flatten([
              "absolute",
              "text-caption1",
              "color-error",
              "margin-top-2",
              "margin-left-4",
            ])}
          >
            {errorText}
          </Text>
        </View>
      ) : null}
    </React.Fragment>
  );
});
