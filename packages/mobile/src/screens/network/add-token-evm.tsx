import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { metrics, typography } from "../../themes";
import { OWalletLogo } from "../register/owallet-logo";
import { Text } from "@src/components/text";
import { Controller, useForm } from "react-hook-form";
import { TextInput } from "../../components/input";
import { LoadingSpinner } from "../../components/spinner";
import { useSmartNavigation } from "../../navigation.provider";
import { useStore } from "../../stores";
import CheckBox from "react-native-check-box";
import { ERC20Currency, Secret20Currency } from "@owallet/types";
import { observer } from "mobx-react-lite";
import { showToast } from "@src/utils/helper";
import { API } from "@src/common/api";
import { PageWithBottom } from "@src/components/page/page-with-bottom";
import { OWButton } from "@src/components/button";
import { PageHeader } from "@src/components/header/header-new";
import { OWBox } from "@src/components/card";
import OWIcon from "@src/components/ow-icon/ow-icon";
import OWText from "@src/components/text/ow-text";
import { useTheme } from "@src/themes/theme-provider";
import { DownArrowIcon } from "@src/components/icon";

const mockToken = {
  coinDenom: "USDC",
  coinMinimalDenom: "erc20_usdc",
  contractAddress: "0x19373EcBB4B8cC2253D70F2a246fa299303227Ba",
  coinDecimals: 6,
  bridgeTo: ["Oraichain"],
  coinGeckoId: "usd-coin",
  prefixToken: "eth-mainnet",
  coinImageUrl: "https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png",
};

interface TokenType {
  coinDenom: string;
  coinMinimalDenom: string;
  contractAddress: string;
  coinDecimals: number;
  bridgeTo: Array<string>;
  coinGeckoId: string;
  prefixToken: string;
  coinImageUrl?: string;
}
interface FormData {
  viewingKey: string;
  contractAddress: string;
}

export const AddTokenEVMScreen = observer(
  ({ _onPressNetworkModal, selectedChain }) => {
    const {
      control,
      handleSubmit,
      watch,
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
    } = useStore();
    const tokensOf = tokensStore.getTokensOf(selectedChain?.chainId);
    const [loading, setLoading] = useState(false);
    const [coidgeckoId, setCoingeckoID] = useState(null);

    const accountInfo = accountStore.getAccount(chainStore.current.chainId);

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
          form.setValue(
            "contractAddress",
            tokensStore.waitingSuggestedToken.data.contractAddress
          );
        }
      }
    }, [chainStore, contractAddress, form, tokensStore.waitingSuggestedToken]);

    const isSecret20 = false;

    const queries = queriesStore.get(selectedChain.chainId);
    const query = queries.evmContract.queryErc20ContractInfo;
    const queryContractInfo = query.getQueryContract(contractAddress);

    const tokenInfo = queryContractInfo.tokenInfo;

    const getTokenCoingeckoId = async () => {
      try {
        if (tokenInfo) {
          const response = await API.getCoingeckoCoins(
            {},
            {
              baseURL: "https://api.coingecko.com/api/v3",
            }
          );
          const coins = response.data;

          // Find the matching coin based on contract address
          const coin = coins.find((c) => {
            return c.symbol.toLowerCase() === tokenInfo?.symbol.toLowerCase();
          });

          if (coin) {
            setCoingeckoID(coin.id);
          } else {
            throw new Error("Coingecko ID not found for the contract address.");
          }
        }
      } catch (err) {
        console.log("getTokenCoingeckoId err", err);
      }
    };

    useEffect(() => {
      getTokenCoingeckoId();
    }, [contractAddress, tokenInfo]);

    const [isOpenSecret20ViewingKey, setIsOpenSecret20ViewingKey] =
      useState(false);

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

    const addTokenSuccess = (currency) => {
      const currentChainInfos = appInitStore.getChainInfos;

      const chain = currentChainInfos.find(
        (c) => c.chainId === selectedChain.chainId
      );

      setLoading(false);
      const token: TokenType = {
        coinDenom: currency.coinDenom,
        coinMinimalDenom: `${
          currency.type
        }_${currency.coinDenom.toLowerCase()}`,
        contractAddress: currency.contractAddress,
        coinDecimals: currency.coinDecimals,
        bridgeTo: ["Oraichain"],
        coinGeckoId: coidgeckoId,
        prefixToken:
          currency?.prefixToken ?? chain.bech32Config?.bech32PrefixAccAddr,
      };

      const newCurrencies = [...chain.currencies];
      newCurrencies.push(token);

      const newChainInfos = [...currentChainInfos];

      // Find the object with name 'Jane' and update its age
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

    const submit = handleSubmit(async (data: any) => {
      try {
        if (tokenInfo?.decimals != null && tokenInfo.name && tokenInfo.symbol) {
          setLoading(true);
          if (!isSecret20) {
            const currency: ERC20Currency = {
              type: "erc20",
              contractAddress: data?.contractAddress,
              coinMinimalDenom: tokenInfo.name,
              coinDenom: tokenInfo.symbol,
              coinDecimals: tokenInfo.decimals,
            };

            await tokensOf.addToken(currency);
            addTokenSuccess(currency);
          } else {
            let viewingKey = data?.viewingKey;
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
          onPress: () => {},
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
              onPress={_onPressNetworkModal}
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
                <DownArrowIcon
                  height={10}
                  color={colors["neutral-text-title"]}
                />
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
            <TextInput
              inputStyle={{
                borderColor: colors["neutral-border-strong"],
                borderRadius: 12,
              }}
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
              error={errors.contractAddress?.message}
              value={tokenInfo?.name ?? "-"}
              defaultValue={"-"}
              editable={true}
            />
            <TextInput
              inputStyle={{
                borderColor: colors["neutral-border-strong"],
                borderRadius: 12,
              }}
              style={styles.textInput}
              onSubmitEditing={() => {
                submit();
              }}
              label=""
              topInInputContainer={
                <View style={{ paddingBottom: 4 }}>
                  <OWText>Symbol</OWText>
                </View>
              }
              returnKeyType="next"
              value={tokenInfo?.symbol ?? "-"}
              defaultValue={"-"}
              editable={true}
            />
            <TextInput
              inputStyle={{
                borderColor: colors["neutral-border-strong"],
                borderRadius: 12,
              }}
              style={styles.textInput}
              onSubmitEditing={() => {
                submit();
              }}
              label=""
              topInInputContainer={
                <View style={{ paddingBottom: 4 }}>
                  <OWText>Decimals</OWText>
                </View>
              }
              returnKeyType="next"
              value={tokenInfo?.decimals?.toString() ?? "-"}
              defaultValue={"-"}
              editable={true}
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
  }
);

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
