import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
} from "react";
import { observer } from "mobx-react-lite";
import { View } from "react-native";
import { Text } from "@components/text";
import { PageWithScrollView } from "@components/page";
import { TextInput } from "@components/input";
import { OWBox } from "@components/card";
import { Controller, useForm } from "react-hook-form";
import OWButton from "../../../../components/button/OWButton";
import { checkValidDomain, showToast } from "@utils/helper";
import { fetchRetry, unknownToken } from "@owallet/common";
import { simpleFetch } from "@owallet/simple-fetch";
import { logger } from "ethers";
import { Bech32Address, ChainIdHelper } from "@owallet/cosmos";
import { useStore } from "@src/stores";
import { resetTo } from "@src/router/root";
import { SCREENS } from "@common/constants";
import { AlertIcon } from "@components/icon";
import OWText from "@components/text/ow-text";
import { useTheme } from "@src/themes/theme-provider";
import { StatusRpcResponse } from "@owallet/types";

interface IFormData {
  rpc: string;
  lcd: string;
  chainName: string;
  addressPrefix: string;
  coinMinimalDenom: string;
  coinSymbol: string;
  coinType: string;
  decimals: string;
  explorerUrl?: string;
  coinImageUrl: string;
  coinGeckoId: string;
}

export const AddChainScreen: FunctionComponent = observer(() => {
  const {
    control,
    handleSubmit,
    setFocus,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<IFormData>();
  const [isLoading, setIsLoading] = useState(false);
  const { chainStore, keyRingStore } = useStore();
  const submit = handleSubmit(async () => {
    try {
      setIsLoading(true);
      const chainId = await getChainId();
      if (!chainId) {
        showToast({
          type: "danger",
          message: "RPC not active",
        });
        return;
      }
      const infoConfig = {
        rpc: getValues("rpc"),
        rest: getValues("lcd"),
        chainId: chainId,
        chainName: getValues("chainName"),
        chainSymbolImageUrl: getValues("coinImageUrl"),
        stakeCurrency: {
          coinDenom: getValues("coinSymbol"),
          coinMinimalDenom: getValues("coinMinimalDenom"),
          coinDecimals: getValues("decimals"),
          coinImageUrl: getValues("coinImageUrl"),
          coinGeckoId: getValues("coinGeckoId") || unknownToken.coinGeckoId,
        },
        bip44: {
          coinType: getValues("coinType"),
        },
        coinType: getValues("coinType"),
        bech32Config: Bech32Address.defaultBech32Config(
          getValues("addressPrefix")
        ),
        get currencies() {
          return [this.stakeCurrency];
        },
        get feeCurrencies() {
          return [this.stakeCurrency];
        },
        features: ["no-legacy-stdTx"],
        txExplorer: {
          name: "Scan",
          txUrl: getValues("explorerUrl")
            ? `${getValues("explorerUrl")?.replace(/\/$/, "")}/{txHash}`
            : "",
          accountUrl: "",
        },
        // beta: true // use v1beta1
      };
      //@ts-ignore
      await window.owallet.experimentalSuggestChain(infoConfig);
      const vaultId = keyRingStore.selectedKeyInfo.id;
      const chainIdentifier = ChainIdHelper.parse(chainId).identifier;
      await chainStore.enableChainInfoInUIWithVaultId(
        vaultId,
        ...[chainIdentifier]
      );
      showToast({
        type: "success",
        message: "Add chain success",
      });
      resetTo(SCREENS.STACK.MainTab);
      return;
    } catch (e) {
      console.log(e, "errr");
      showToast({
        type: "danger",
        message: e?.message || JSON.stringify(e),
      });
    } finally {
      setIsLoading(false);
    }
  });
  const getChainId = async () => {
    const urlRpc = getValues("rpc");
    if (!urlRpc) return;
    const url = urlRpc.replace(/\/$/, "");
    if (checkValidDomain(url)) {
      try {
        const res = await simpleFetch<StatusRpcResponse>(`${url}/status`);
        const chainId = res.data?.result.node_info.network;
        if (!chainId) return;
        return chainId;
      } catch (e) {
        console.log(e, "err fetch rpc");
        return;
      }
    }
  };
  const renderRpc = ({ field: { onChange, onBlur, value, ref } }) => (
    <TextInput
      onBlur={onBlur}
      onChangeText={onChange}
      value={value}
      ref={ref}
      error={errors.rpc?.message}
      returnKeyType="next"
      label={"RPC"}
      placeholder={"Ex: https://rpc.orai.io"}
      onSubmitEditing={() => {
        setFocus("lcd");
      }}
    />
  );
  const renderLcd = ({ field: { onChange, onBlur, value, ref } }) => (
    <TextInput
      onBlur={onBlur}
      onChangeText={onChange}
      value={value}
      ref={ref}
      error={errors.lcd?.message}
      returnKeyType="next"
      label={"LCD"}
      placeholder={"Ex: https://lcd.orai.io"}
      onSubmitEditing={() => {
        setFocus("chainName");
      }}
    />
  );
  const renderChainName = ({ field: { onChange, onBlur, value, ref } }) => (
    <TextInput
      onBlur={onBlur}
      onChangeText={onChange}
      value={value}
      ref={ref}
      error={errors.chainName?.message}
      returnKeyType="next"
      label={"Chain Name"}
      placeholder={"Ex: Oraichain Testnet"}
      onSubmitEditing={() => {
        setFocus("addressPrefix");
      }}
    />
  );
  const renderAddressPrefix = ({ field: { onChange, onBlur, value, ref } }) => (
    <TextInput
      onBlur={onBlur}
      onChangeText={onChange}
      value={value}
      ref={ref}
      error={errors.addressPrefix?.message}
      returnKeyType="next"
      label={"Address Prefix"}
      placeholder={"Ex: orai"}
      onSubmitEditing={() => {
        setFocus("coinMinimalDenom");
      }}
    />
  );
  const renderCoinMinimalDenom = ({
    field: { onChange, onBlur, value, ref },
  }) => (
    <TextInput
      onBlur={onBlur}
      onChangeText={onChange}
      value={value}
      ref={ref}
      error={errors.coinMinimalDenom?.message}
      returnKeyType="next"
      label={"Coin Minimal Denom"}
      placeholder={"Ex: orai"}
      onSubmitEditing={() => {
        setFocus("coinSymbol");
      }}
    />
  );
  const renderCoinSymbol = ({ field: { onChange, onBlur, value, ref } }) => (
    <TextInput
      onBlur={onBlur}
      onChangeText={onChange}
      value={value}
      ref={ref}
      error={errors.coinSymbol?.message}
      returnKeyType="next"
      label={"Coin Symbol"}
      placeholder={"Ex: ORAI"}
      onSubmitEditing={() => {
        setFocus("coinType");
      }}
    />
  );
  const renderCoinImage = ({ field: { onChange, onBlur, value, ref } }) => (
    <TextInput
      onBlur={onBlur}
      onChangeText={onChange}
      value={value}
      ref={ref}
      error={errors.coinMinimalDenom?.message}
      returnKeyType="done"
      label={"Coin Image"}
      placeholder={
        "Ex: https://assets.coingecko.com/coins/images/31967/standard/tia.jpg"
      }
      onSubmitEditing={submit}
    />
  );
  const renderCoinType = ({ field: { onChange, onBlur, value, ref } }) => (
    <TextInput
      onBlur={onBlur}
      onChangeText={onChange}
      value={value}
      ref={ref}
      error={errors.coinType?.message}
      returnKeyType="next"
      label={"Coin Type"}
      placeholder={"Ex: 118"}
      onSubmitEditing={() => {
        setFocus("decimals");
      }}
    />
  );
  const renderDecimal = ({ field: { onChange, onBlur, value, ref } }) => (
    <TextInput
      onBlur={onBlur}
      onChangeText={onChange}
      value={value}
      ref={ref}
      error={errors.decimals?.message}
      returnKeyType="next"
      label={"Decimals"}
      placeholder={"Ex: 6"}
      onSubmitEditing={() => {
        setFocus("explorerUrl");
      }}
    />
  );
  const renderExplorer = ({ field: { onChange, onBlur, value, ref } }) => (
    <TextInput
      onBlur={onBlur}
      onChangeText={onChange}
      value={value}
      ref={ref}
      error={errors.explorerUrl?.message}
      returnKeyType="next"
      label={"Block explorer URL (optional)"}
      placeholder={"Ex: https://scan.orai.io/txs"}
      onSubmitEditing={() => {
        setFocus("coinImageUrl");
      }}
    />
  );
  const renderCoinGeckoId = ({ field: { onChange, onBlur, value, ref } }) => (
    <TextInput
      onBlur={onBlur}
      onChangeText={onChange}
      value={value}
      ref={ref}
      error={errors.coinGeckoId?.message}
      returnKeyType="next"
      label={"CoinGecko Id (optional)"}
      placeholder={"Ex: oraichain-token"}
      onSubmitEditing={() => {
        setFocus("coinImageUrl");
      }}
    />
  );
  const { colors } = useTheme();
  return (
    <PageWithScrollView showsVerticalScrollIndicator={false}>
      <View
        style={{
          flexDirection: "row",
          borderRadius: 12,
          backgroundColor: colors["warning-surface-subtle"],
          padding: 12,
          marginTop: 8,
        }}
      >
        <AlertIcon color={colors["warning-text-body"]} size={16} />
        <OWText style={{ paddingLeft: 8 }} weight="600" size={14}>
          <OWText>Caution: {"\n"}</OWText>
          <OWText
            style={{
              fontWeight: "bold",
            }}
          >
            Only add custom networks you trust
          </OWText>
        </OWText>
      </View>
      <OWBox
        style={{
          marginTop: 8,
        }}
      >
        <TextInput
          editable={false}
          label={"Network Type"}
          defaultValue={"Cosmos"}
        />
        <Controller
          control={control}
          rules={{
            required: true,
          }}
          render={renderRpc}
          name="rpc"
        />
        <Controller
          control={control}
          rules={{
            required: true,
          }}
          render={renderLcd}
          name="lcd"
        />
        <Controller
          control={control}
          rules={{
            required: true,
          }}
          render={renderChainName}
          name="chainName"
        />
        <Controller
          control={control}
          rules={{
            required: true,
          }}
          render={renderAddressPrefix}
          name="addressPrefix"
        />
        <Controller
          control={control}
          rules={{
            required: true,
          }}
          render={renderCoinMinimalDenom}
          name="coinMinimalDenom"
        />
        <Controller
          control={control}
          rules={{
            required: true,
          }}
          render={renderCoinSymbol}
          name="coinSymbol"
        />
        <Controller
          control={control}
          rules={{
            required: true,
          }}
          render={renderDecimal}
          name="decimals"
        />
        <Controller
          control={control}
          rules={{
            required: true,
          }}
          render={renderCoinType}
          name="coinType"
        />
        <Controller
          control={control}
          rules={{
            required: false,
          }}
          render={renderExplorer}
          name="explorerUrl"
        />
        <Controller
          control={control}
          rules={{
            required: false,
          }}
          render={renderCoinGeckoId}
          name="coinGeckoId"
        />
        <Controller
          control={control}
          rules={{
            required: true,
          }}
          render={renderCoinImage}
          name="coinImageUrl"
        />

        <OWButton
          loading={isLoading}
          disabled={isLoading}
          style={{
            borderRadius: 32,
            marginTop: 16,
          }}
          label={"Add Chain"}
          onPress={submit}
        />
      </OWBox>
    </PageWithScrollView>
  );
});
