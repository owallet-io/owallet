import React, { FunctionComponent, useEffect, useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { metrics } from "../../themes";
import { Text } from "@src/components/text";
import { Controller, useForm } from "react-hook-form";
import { TextInput } from "../../components/input";
import { useSmartNavigation } from "../../navigation.provider";
import { useStore } from "../../stores";
import CheckBox from "react-native-check-box";
import { CW20Currency, Secret20Currency } from "@owallet/types";
import { observer } from "mobx-react-lite";
import { showToast } from "@src/utils/helper";
import { API } from "@src/common/api";
import { PageWithBottom } from "@src/components/page/page-with-bottom";
import { OWButton } from "@src/components/button";
import { PageHeader } from "@src/components/header/header-new";
import { OWBox } from "@src/components/card";
import OWText from "@src/components/text/ow-text";
import OWIcon from "@src/components/ow-icon/ow-icon";
import { useTheme } from "@src/themes/theme-provider";
import { DownArrowIcon } from "@src/components/icon";
import { SelectTokenTypeModal } from "./select-token-type";

interface FormData {
  viewingKey?: string;
  icon?: string;
  contractAddress: string;
  name: string;
  symbol: string;
  decimals: string;
}

interface TokenType {
  coinDenom: string;
  coinMinimalDenom: string;
  contractAddress: string;
  coinDecimals: number;
  coinGeckoId: string;
  prefixToken: string;
  bridgeTo?: Array<string>;
  coinImageUrl?: string;
}

export const AddTokenCosmosScreen: FunctionComponent<{
  _onPressNetworkModal: Function;
  selectedChain: any;
}> = observer(({ _onPressNetworkModal, selectedChain }) => {
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<FormData>();
  const smartNavigation = useSmartNavigation();
  const { colors } = useTheme();

  const {
    chainStore,
    queriesStore,
    accountStore,
    tokensStore,
    appInitStore,
    modalStore,
  } = useStore();
  const tokensOf = tokensStore.getTokensOf(selectedChain.chainId);

  const accountInfo = accountStore.getAccount(selectedChain.chainId);
  const [loading, setLoading] = useState(false);
  const [coingeckoId, setCoingeckoID] = useState(null);
  const [selectedType, setSelectedType] = useState<"cw20">("cw20");
  const [coingeckoImg, setCoingeckoImg] = useState(null);

  const form = useForm<FormData>({
    defaultValues: {
      contractAddress: "",
      viewingKey: "",
    },
  });

  const contractAddress = watch("contractAddress");

  useEffect(() => {
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
  const query = isSecret20
    ? queries.secret.querySecret20ContractInfo
    : queries.cosmwasm.querycw20ContractInfo;
  const queryContractInfo = query.getQueryContract(contractAddress);

  const tokenInfo = queryContractInfo.tokenInfo;
  console.log(process.env.COINGECKO_API_KEY, "process.env.COINGECKO_API_KEY");
  const getTokenCoingeckoId = async () => {
    try {
      if (tokenInfo && tokenInfo.symbol) {
        const response = await API.getCoingeckoCoins(
          {},
          {
            baseURL: "https://api.coingecko.com/api/v3",
          }
        );
        const coins = response.data;

        // Find the matching coin based on contract address
        const coin = coins.find((c) => {
          return (
            c.id.toLowerCase() === tokenInfo?.symbol.toLowerCase() ||
            c.symbol.toLowerCase() === tokenInfo?.symbol.toLowerCase() ||
            c.name.toLowerCase() === tokenInfo?.symbol.toLowerCase()
          );
        });

        if (coin) {
          if (selectedChain && contractAddress && contractAddress !== "") {
            const res = await API.getCoingeckoImageURL(
              {
                contractAddress: contractAddress,
                id: selectedChain.chainName.toLowerCase().split(" ").join("-"),
              },
              {
                baseURL: "https://pro-api.coingecko.com/api/v3",
                headers: {
                  "x-cg-pro-api-key": process.env.COINGECKO_API_KEY,
                },
              }
            );
            const data = res.data;

            if (data && data.image && data.image.large) {
              setCoingeckoImg(data.image.large);
            } else {
              throw new Error("Image URL not found for the Coingecko ID.");
            }
          }
          setCoingeckoID(coin.id);
        } else {
          throw new Error("Coingecko ID not found for the contract address.");
        }
      }
    } catch (err) {
      console.log("getTokenCoingeckoId err", err);
    }
  };

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
        list={["cw20"]}
        onPress={(type) => {
          setSelectedType(type);
          modalStore.close();
        }}
      />
    );
  };

  useEffect(() => {
    getTokenCoingeckoId();
    if (tokenInfo) {
      setValue("name", tokenInfo.name);
      setValue("symbol", tokenInfo.symbol);
      setValue("decimals", tokenInfo.decimals?.toString());
    }
  }, [contractAddress, tokenInfo]);

  const [isOpenSecret20ViewingKey, setIsOpenSecret20ViewingKey] =
    useState(false);
  const addTokenSuccess = (currency) => {
    const currentChainInfos = appInitStore.getChainInfos;

    const chain = currentChainInfos.find(
      (c) => c.chainId === selectedChain.chainId
    );

    setLoading(false);
    const token: TokenType = {
      coinDenom: currency.coinDenom,
      coinMinimalDenom: `${currency.type}_${currency.coinDenom.toLowerCase()}`,
      contractAddress: currency.contractAddress,
      coinDecimals: currency.coinDecimals,
      coinGeckoId: coingeckoId,
      prefixToken:
        currency?.prefixToken ?? chain.bech32Config?.bech32PrefixAccAddr,
      coinImageUrl: getValues("icon") ?? null,
    };

    const newCurrencies = [...chain.currencies];
    newCurrencies.push(token);

    const newChainInfos = [...currentChainInfos];

    // Find the object with chainId and update its age
    for (let i = 0; i < newChainInfos.length; i++) {
      if (newChainInfos[i].chainId === selectedChain.chainId) {
        newChainInfos[i].currencies = newCurrencies;
        break; // Exit the loop since we found the object
      }
    }

    appInitStore.updateChainInfos(newChainInfos);
    smartNavigation.navigateSmart("Home", {});
    showToast({
      message: "Token added",
    });
  };

  const createViewingKey = async (): Promise<string> => {
    return new Promise((resolve, reject) => {
      accountInfo.secret
        .createSecret20ViewingKey(
          contractAddress,
          "",
          {},
          {},
          (_, viewingKey) => {
            resolve(viewingKey);
          }
        )
        .then(() => {})
        .catch(reject);
    });
  };

  const submit = handleSubmit(async (data: any) => {
    try {
      if (tokenInfo?.decimals != null && tokenInfo.name && tokenInfo.symbol) {
        setLoading(true);
        if (!isSecret20) {
          const currency: CW20Currency = {
            type: selectedType,
            contractAddress: data.contractAddress,
            coinMinimalDenom: tokenInfo.name,
            coinDenom: tokenInfo.symbol,
            coinDecimals: tokenInfo.decimals,
          };

          await tokensOf.addToken(currency);
          addTokenSuccess(currency);
        } else {
          let viewingKey = data.viewingKey;
          if (!viewingKey && !isOpenSecret20ViewingKey) {
            try {
              viewingKey = await createViewingKey();
            } catch (e) {
              if (tokensStore.waitingSuggestedToken) {
                await tokensStore.rejectAllSuggestedTokens();
              }

              return;
            }
          }

          if (!viewingKey) {
            setLoading(false);
            smartNavigation.navigateSmart("Home", {});
            showToast({
              message: "Failed to create the viewing key",
              type: "danger",
            });
          } else {
            const currency: Secret20Currency = {
              type: "secret20",
              contractAddress: data.contractAddress,
              viewingKey,
              coinMinimalDenom: tokenInfo.name,
              coinDenom: tokenInfo.symbol,
              coinDecimals: tokenInfo.decimals,
            };

            await tokensOf.addToken(currency);
            addTokenSuccess(currency);
          }
        }
      }
    } catch (err) {
      setLoading(false);
      smartNavigation.navigateSmart("Home", {});
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
      <PageHeader title="Add Token" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <OWBox>
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
                      <OWText>Token icon (Optional)</OWText>
                    </View>
                  }
                  returnKeyType="next"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={coingeckoImg}
                  editable={true}
                />
              );
            }}
            name="icon"
            defaultValue={""}
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
