import React, { FunctionComponent, useEffect, useState } from "react";
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
import { CustomFee } from "@src/modals/fee";
import WrapViewModal from "@src/modals/wrap/wrap-view-modal";

const FeeButtonsModal: FunctionComponent<{
  isOpen: boolean;
  close: () => void;
  bottomSheetModalConfig?: Omit<BottomSheetProps, "snapPoints" | "children">;
  feeConfig: IFeeConfig;
  gasConfig: IGasConfig;
}> = registerModal(
  observer(({ close, feeConfig, gasConfig }) => {
    const [customGas, setCustomGas] = useState(false);
    const { colors } = useTheme();

    return (
      <WrapViewModal title="Set Fee" disabledScrollView={false}>
        <View
          style={{
            flexDirection: "row",
            paddingBottom: 24,
            alignItems: "center",
            paddingTop: 16,
          }}
        >
          <Toggle
            on={customGas}
            onChange={(value) => {
              setCustomGas(value);
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
            Custom Gas
          </Text>
        </View>
        {/*<TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>*/}
        {customGas && <CustomFee gasConfig={gasConfig} colors={colors} />}

        <FeeButtons
          label="Fee"
          gasLabel="Gas"
          feeConfig={feeConfig}
          vertical
          gasConfig={gasConfig}
        />

        {/*</TouchableWithoutFeedback>*/}

        <TouchableOpacity
          onPress={close}
          style={{
            marginBottom: 16,
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
      </WrapViewModal>
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
  const { chainStore, priceStore, appInitStore } = useStore();
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

  useEffect(() => {
    if (feeConfig.feeCurrency && !feeConfig.fee && feeConfig.setFeeType) {
      feeConfig.setFeeType("average");
    }
    if (appInitStore.getInitApp.feeOption && feeConfig.setFeeType) {
      feeConfig.setFeeType(appInitStore.getInitApp.feeOption);
    }
  }, [feeConfig, appInitStore.getInitApp.feeOption]);

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
const FeeButtonsBtcModal: FunctionComponent<{
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
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <FeeButtons
            label="Fee"
            gasLabel="Gas"
            feeConfig={feeConfig}
            gasConfig={gasConfig}
          />
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

export const FeeInSignBtc: FunctionComponent<{
  isInternal: boolean;

  feeConfig: IFeeConfig;
  gasConfig: IGasConfig;
}> = observer(({ isInternal, feeConfig, gasConfig }) => {
  const { chainStore, priceStore } = useStore();
  const { colors } = useTheme();
  const style = useStyle();

  const fee =
    feeConfig.fee ??
    new CoinPretty(
      chainStore.getChain(feeConfig.chainId).stakeCurrency,
      new Dec("0")
    );

  const feePrice = priceStore.calculatePrice(fee);

  // If the signing request is from internal and the "preferNoSetFee" option is set,
  // prevent the user to edit the fee.
  const canFeeEditable = isInternal;

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
      <FeeButtonsBtcModal
        isOpen={isSetFeeModalOpen}
        close={() => setIsSetFeeModalOpen(false)}
        feeConfig={feeConfig}
        gasConfig={gasConfig}
      />
      <View style={style.flatten(["padding-bottom-28"])}>
        <View
          style={style.flatten(["flex-row", "items-center", "margin-bottom-4"])}
        >
          <Text style={style.flatten(["subtitle3"])}>Fee</Text>
          <View style={style.get("flex-1")} />
          <Text style={style.flatten(["body3"])}>
            {feePrice ? feePrice.toString() : "-"}
          </Text>
        </View>
        <View style={style.flatten(["flex-row"])}>
          <View style={style.get("flex-1")} />
          <TouchableOpacity
            style={style.flatten(["flex-row", "items-center"])}
            disabled={!canFeeEditable}
            onPress={() => {
              setIsSetFeeModalOpen(true);
            }}
          >
            <Text
              style={{
                ...typography["subtitle1"],
                color: canFeeEditable
                  ? colors["primary-surface-default"]
                  : colors["primary-text"],
              }}
            >
              {fee.trim(true).toString()}
            </Text>
            {canFeeEditable ? (
              <View style={style.flatten(["margin-left-6"])}>
                <RightArrowIcon
                  color={style.get("color-primary").color}
                  height={12}
                />
              </View>
            ) : null}
          </TouchableOpacity>
        </View>
        {isFeeLoading ? (
          <View>
            <View
              style={style.flatten([
                "absolute",
                "height-16",
                "justify-center",
                "margin-top-2",
                "margin-left-4",
              ])}
            >
              <LoadingSpinner
                size={14}
                color={style.get("color-loading-spinner").color}
              />
            </View>
          </View>
        ) : null}
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
      </View>
    </React.Fragment>
  );
});
