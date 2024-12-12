import React, { FunctionComponent, useEffect, useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { metrics } from "../../themes";
import { Text } from "@src/components/text";
import { Controller, useForm } from "react-hook-form";
import { TextInput } from "../../components/input";

import { useStore } from "../../stores";
import CheckBox from "react-native-check-box";
import { AppCurrency, CW20Currency, Secret20Currency } from "@owallet/types";
import { observer } from "mobx-react-lite";
import { showToast } from "@src/utils/helper";
import { API } from "@src/common/api";
import { PageWithBottom } from "@src/components/page/page-with-bottom";
import { OWButton } from "@src/components/button";
import { OWBox } from "@src/components/card";
import OWText from "@src/components/text/ow-text";
import OWIcon from "@src/components/ow-icon/ow-icon";
import { useTheme } from "@src/themes/theme-provider";
import { DownArrowIcon } from "@src/components/icon";
import { SelectTokenTypeModal } from "./select-token-type";
import { unknownToken, MapChainIdToNetwork } from "@owallet/common";
import { tracking } from "@src/utils/tracking";
import { navigate, resetTo } from "@src/router/root";
import { SCREENS } from "@src/common/constants";

interface FormData {
  viewingKey?: string;
  contractAddress: string;
  symbol: string;
  decimals: string;
  image: string;
  name: string;
  coinGeckoId: string;
}

export const AddTokenCosmosScreen: FunctionComponent<{
  _onPressNetworkModal: Function;
}> = observer(({ _onPressNetworkModal }) => {
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<FormData>();

  const { colors } = useTheme();

  const { chainStore, queriesStore, tokensStore, modalStore } = useStore();
  const selectedChain = chainStore.current;

  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<"cw20" | "native">("cw20");

  const form = useForm<FormData>({
    defaultValues: {
      contractAddress: "",
      viewingKey: "",
    },
  });

  const contractAddress = watch("contractAddress");

  useEffect(() => {
    tracking(`Add Token Cosmos Screen`);
    if (tokensStore.waitingSuggestedToken) {
      chainStore.selectChain(tokensStore.waitingSuggestedToken.data.chainId);
      if (
        contractAddress !==
        tokensStore.waitingSuggestedToken.data.contractAddress
      ) {
        setValue(
          "contractAddress",
          tokensStore.waitingSuggestedToken.data.contractAddress
        );
      }
    }
  }, [chainStore, contractAddress, form, tokensStore.waitingSuggestedToken]);

  const isSecret20 =
    (selectedChain.features ?? []).find(
      (feature) => feature === "secretwasm"
    ) != null;

  const queries = queriesStore.get(selectedChain.chainId);
  const query = queries.cosmwasm.querycw20ContractInfo;
  const queryContractInfo = query.getQueryContract(contractAddress);

  const tokenInfo = queryContractInfo.tokenInfo;

  const _onPressSelectType = () => {
    modalStore.setOptions({
      bottomSheetModalConfig: {
        enablePanDownToClose: false,
        enableOverDrag: false,
      },
    });

    modalStore.setChildren(
      <SelectTokenTypeModal
        selected={selectedType}
        list={["cw20", "native"]}
        onPress={(type) => {
          setSelectedType(type);
          modalStore.close();
        }}
      />
    );
  };

  const getTokenCoingeckoId = async (contractAddressData) => {
    try {
      console.log(contractAddressData, "contractAddressData");
      if (!contractAddressData || !tokenInfo?.symbol || !tokenInfo?.decimals)
        return;
      const res = await API.getTokenInfo({
        network: MapChainIdToNetwork[chainStore.current.chainId],
        tokenAddress: contractAddressData,
      });
      const data = res.data;
      if (data && data.imgUrl) {
        console.log(data, "data");
        setValue("image", data.imgUrl);
        setValue("coinGeckoId", data.coingeckoId);
      } else {
        throw new Error("Image URL not found for the Coingecko ID.");
      }
    } catch (err) {
      console.log("getTokenCoingeckoId err", err);
    }
  };
  useEffect(() => {
    if (!contractAddress || !tokenInfo?.symbol || !tokenInfo?.decimals) return;
    setValue("symbol", tokenInfo?.symbol);
    setValue("decimals", `${tokenInfo?.decimals}`);
    setValue("name", tokenInfo?.name);
    getTokenCoingeckoId(contractAddress);
  }, [contractAddress, tokenInfo]);

  const [isOpenSecret20ViewingKey, setIsOpenSecret20ViewingKey] =
    useState(false);
  const addTokenSuccess = (currency) => {
    setLoading(false);
    resetTo(SCREENS.STACK.MainTab);
    showToast({
      message: "Token added",
    });
  };

  const submit = handleSubmit(async (data: any) => {
    try {
      console.log(data, "submit");
      let currency: CW20Currency | AppCurrency = {
        type: "cw20",
        contractAddress: data.contractAddress,
        coinMinimalDenom: `cw20:${data.contractAddress}:${data.name}`,
        coinDenom: data.symbol,
        coinDecimals: Number(data.decimals),
        coinImageUrl: data.image || unknownToken.coinImageUrl,
        coinGeckoId: data.coinGeckoId || unknownToken.coinGeckoId,
      };

      if (
        (data.contractAddress.startsWith("factory") ||
          data.contractAddress.startsWith("ibc")) &&
        selectedType !== "cw20"
      ) {
        currency = {
          coinMinimalDenom: data.contractAddress,
          coinDenom: data.symbol,
          coinDecimals: Number(data.decimals),
          coinImageUrl: data.image || unknownToken.coinImageUrl,
          coinGeckoId: data.coinGeckoId || unknownToken.coinGeckoId,
        };
      }
      setLoading(true);
      await tokensStore.addToken(selectedChain.chainId, currency);
      addTokenSuccess(currency);
    } catch (err) {
      setLoading(false);
      navigate(SCREENS.Home, {});
      showToast({
        message: JSON.stringify(err.message),
        type: "danger",
      });
    }
  });

  return (
    <PageWithBottom
      bottomGroup={
        <OWButton
          label="Save"
          disabled={loading}
          loading={loading}
          onPress={submit}
          style={[
            {
              width: metrics.screenWidth - 32,
              marginTop: 20,
              borderRadius: 999,
            },
          ]}
          textStyle={{
            fontSize: 14,
            fontWeight: "600",
            color: colors["neutral-text-action-on-dark-bg"],
          }}
        />
      }
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <OWBox
          style={[
            {
              backgroundColor: colors["neutral-surface-card"],
            },
          ]}
        >
          <TouchableOpacity
            onPress={() => _onPressNetworkModal()}
            style={{
              borderColor: colors["neutral-border-strong"],
              borderRadius: 12,
              borderWidth: 1,
              padding: 16,
              marginBottom: 12,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <OWText style={{ paddingRight: 4 }}>Select Chain</OWText>
              <DownArrowIcon height={10} color={colors["neutral-text-title"]} />
            </View>
            {selectedChain ? (
              <OWText
                style={{
                  fontSize: 14,
                  color: colors["neutral-text-title"],
                  fontWeight: "600",
                }}
              >
                {selectedChain.chainName}
              </OWText>
            ) : null}
          </TouchableOpacity>
          <Controller
            control={control}
            render={({ field: { onChange, onBlur, value, ref } }) => {
              return (
                <TextInput
                  label=""
                  topInInputContainer={
                    <View style={{ paddingBottom: 4 }}>
                      <OWText>Contract address</OWText>
                    </View>
                  }
                  returnKeyType="next"
                  inputStyle={{
                    borderColor: colors["neutral-border-strong"],
                    borderRadius: 12,
                  }}
                  style={styles.textInput}
                  inputLeft={
                    <OWIcon
                      size={22}
                      name="tdesign_book"
                      color={colors["neutral-icon-on-light"]}
                    />
                  }
                  onSubmitEditing={() => {
                    submit();
                  }}
                  error={errors.contractAddress?.message}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholder="Enter contract address"
                />
              );
            }}
            name="contractAddress"
            defaultValue=""
          />
          <TouchableOpacity
            onPress={_onPressSelectType}
            style={{
              borderColor: colors["neutral-border-strong"],
              borderRadius: 12,
              borderWidth: 1,
              padding: 16,
              marginBottom: 12,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <OWText style={{ paddingRight: 4 }}>Select Type</OWText>
              <DownArrowIcon height={10} color={colors["neutral-text-title"]} />
            </View>
            {selectedType ? (
              <OWText
                style={{
                  fontSize: 14,
                  color: colors["neutral-text-title"],
                  fontWeight: "600",
                }}
              >
                {selectedType.toUpperCase()}
              </OWText>
            ) : null}
          </TouchableOpacity>
          <Controller
            control={control}
            rules={{
              required: "Name is required",
            }}
            render={({ field: { onChange, onBlur, value, ref } }) => {
              return (
                <TextInput
                  inputStyle={{
                    borderColor: errors.name?.message
                      ? colors["error-border-default"]
                      : colors["neutral-border-strong"],
                    borderRadius: 12,
                  }}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  style={styles.textInput}
                  onSubmitEditing={() => {
                    submit();
                  }}
                  label=""
                  topInInputContainer={
                    <View style={{ paddingBottom: 4 }}>
                      <OWText>Name</OWText>
                    </View>
                  }
                  returnKeyType="next"
                  placeholder={"Enter token name"}
                  editable={true}
                />
              );
            }}
            name="name"
            defaultValue={tokenInfo?.name}
          />
          <Controller
            control={control}
            rules={{
              required: "Symbol is required",
            }}
            render={({ field: { onChange, onBlur, value, ref } }) => {
              return (
                <TextInput
                  inputStyle={{
                    borderColor: errors.symbol?.message
                      ? colors["error-border-default"]
                      : colors["neutral-border-strong"],
                    borderRadius: 12,
                  }}
                  style={styles.textInput}
                  onSubmitEditing={() => {
                    submit();
                  }}
                  label=""
                  placeholder={"Enter token symbol"}
                  topInInputContainer={
                    <View style={{ paddingBottom: 4 }}>
                      <OWText>Symbol</OWText>
                    </View>
                  }
                  returnKeyType="next"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  editable={true}
                />
              );
            }}
            name="symbol"
            defaultValue={tokenInfo?.symbol}
          />

          <Controller
            control={control}
            rules={{
              required: "Decimals is required",
            }}
            render={({ field: { onChange, onBlur, value, ref } }) => {
              return (
                <TextInput
                  inputStyle={{
                    borderColor: errors.decimals?.message
                      ? colors["error-border-default"]
                      : colors["neutral-border-strong"],
                    borderRadius: 12,
                  }}
                  style={styles.textInput}
                  onSubmitEditing={() => {
                    submit();
                  }}
                  placeholder={"Enter token decimals"}
                  label=""
                  topInInputContainer={
                    <View style={{ paddingBottom: 4 }}>
                      <OWText>Decimals</OWText>
                    </View>
                  }
                  returnKeyType="next"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  editable={true}
                />
              );
            }}
            name="decimals"
            defaultValue={tokenInfo?.decimals?.toString()}
          />

          <Controller
            control={control}
            rules={{
              required: "Token Icon is required",
            }}
            render={({ field: { onChange, onBlur, value, ref } }) => {
              return (
                <TextInput
                  inputStyle={{
                    borderColor: colors["neutral-border-strong"],
                    borderRadius: 12,
                  }}
                  style={styles.textInput}
                  onSubmitEditing={() => {
                    submit();
                  }}
                  placeholder={"Enter token icon URL"}
                  label=""
                  topInInputContainer={
                    <View style={{ paddingBottom: 4 }}>
                      <OWText>Token icon</OWText>
                    </View>
                  }
                  returnKeyType="next"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  editable={true}
                  value={value}
                />
              );
            }}
            name="image"

            // defaultValue={""}
          />
          <Controller
            control={control}
            render={({ field: { onChange, onBlur, value, ref } }) => {
              return (
                <TextInput
                  inputStyle={{
                    borderColor: colors["neutral-border-strong"],
                    borderRadius: 12,
                  }}
                  style={styles.textInput}
                  onSubmitEditing={() => {
                    submit();
                  }}
                  placeholder={"Enter coinGecko ID"}
                  label=""
                  topInInputContainer={
                    <View style={{ paddingBottom: 4 }}>
                      <OWText>CoinGecko ID (Optional)</OWText>
                    </View>
                  }
                  returnKeyType="done"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  editable={true}
                  value={value}
                />
              );
            }}
            name="coinGeckoId"
            // defaultValue={""}
          />

          {isSecret20 ? (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <CheckBox
                style={{ flex: 1, padding: 14 }}
                checkBoxColor={colors["primary-text"]}
                checkedCheckBoxColor={colors["primary-text"]}
                onClick={() => {
                  setIsOpenSecret20ViewingKey((value) => !value);
                }}
                isChecked={isOpenSecret20ViewingKey}
              />
              <Text style={{ paddingLeft: 16 }}>{"Viewing key"}</Text>
            </View>
          ) : null}
        </OWBox>
      </ScrollView>
    </PageWithBottom>
  );
});

const styles = StyleSheet.create({
  borderInput: {
    borderWidth: 1,
    paddingLeft: 11,
    paddingRight: 11,
    paddingTop: 12,
    paddingBottom: 12,
    borderRadius: 8,
  },

  textInput: { fontWeight: "600", paddingLeft: 4, fontSize: 15 },
});
