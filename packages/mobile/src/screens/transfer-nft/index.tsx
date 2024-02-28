import React, { FunctionComponent, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { useSendTxConfig } from "@owallet/hooks";
import { useStore } from "../../stores";
import { EthereumEndpoint } from "@owallet/common";
import { PageWithScrollView } from "../../components/page";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import {
  AddressInput,
  AmountInput,
  MemoInput,
  CurrencySelector,
  FeeButtons,
  TextInput,
} from "../../components/input";
import { Button } from "../../components/button";
import { RouteProp, useRoute } from "@react-navigation/native";
import { useSmartNavigation } from "../../navigation.provider";
import { Buffer } from "buffer";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { spacing, typography } from "../../themes";
import { Text } from "@src/components/text";
import ProgressiveImage from "../../components/progessive-image";
import { useTheme } from "@src/themes/theme-provider";
import { OWSubTitleHeader } from "@src/components/header";
import { OWBox } from "@src/components/card";
const styling = (colors) =>
  StyleSheet.create({
    sendInputRoot: {
      paddingHorizontal: spacing["20"],
      paddingVertical: spacing["24"],
      backgroundColor: colors["background-box"],
      borderRadius: 24,
    },
    sendlabelInput: {
      fontSize: 16,
      fontWeight: "700",
      lineHeight: 22,
      marginBottom: spacing["8"],
    },
  });

export const TransferNFTScreen: FunctionComponent = observer(() => {
  const { chainStore, accountStore, queriesStore } = useStore();
  const { colors } = useTheme();
  const styles = styling(colors);
  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          chainId?: string;
          nft?: any;
          currency?: string;
          recipient?: string;
        }
      >,
      string
    >
  >();

  const [quantity, setQuantity] = useState(null);

  const smartNavigation = useSmartNavigation();

  const chainId = route?.params?.chainId
    ? route?.params?.chainId
    : chainStore?.current?.chainId;

  const nft = route?.params?.nft ? route?.params?.nft : null;

  const account = accountStore.getAccount(chainId);
  const queries = queriesStore.get(chainId);

  const sendConfigs = useSendTxConfig(
    chainStore,
    chainId,
    account.msgOpts["send"],
    account.bech32Address,
    queries.queryBalances,
    EthereumEndpoint
  );

  useEffect(() => {
    // hard config to airight chain
    sendConfigs.amountConfig.setSendCurrency({
      coinDecimals: 6,
      type: "cw20",
      coinMinimalDenom:
        "cw20:orai10ldgzued6zjp0mkqwsv2mux3ml50l97c74x8sg:aiRight Token",
      coinDenom: "AIRI",
      coinGeckoId: "airight",
      contractAddress: "orai10ldgzued6zjp0mkqwsv2mux3ml50l97c74x8sg",
      coinImageUrl: "https://i.ibb.co/m8mCyMr/airi.png",
    });
  }, []);

  useEffect(() => {
    if (route?.params?.recipient) {
      sendConfigs.recipientConfig.setRawRecipient(route.params.recipient);
    }
  }, [route?.params?.recipient, sendConfigs.recipientConfig]);

  const sendConfigError =
    sendConfigs.recipientConfig.getError() ??
    // sendConfigs.amountConfig.getError() ??
    sendConfigs.memoConfig.getError() ??
    sendConfigs.gasConfig.getError() ??
    sendConfigs.feeConfig.getError();
  const txStateIsValid = sendConfigError == null;

  return (
    <PageWithScrollView backgroundColor={colors["background"]}>
      <View style={{ marginBottom: 99 }}>
        <OWSubTitleHeader title="Transfer NFT" />
        <OWBox style={styles.sendInputRoot}>
          <Text
            style={{
              ...typography.h6,
              fontWeight: "700",
              marginBottom: spacing["3"],
            }}
          >
            {"Item"}
          </Text>
          <View
            style={{
              marginVertical: spacing["8"],
              padding: spacing["8"],
              flexDirection: "row",
              backgroundColor: colors["item"],
              borderRadius: spacing["8"],
            }}
          >
            <ProgressiveImage
              source={{
                uri: nft.url,
              }}
              style={{
                width: 38,
                height: 38,
                borderRadius: spacing["6"],
              }}
              resizeMode="contain"
            />
            <View style={{ paddingHorizontal: spacing["8"] }}>
              <Text
                style={{
                  ...typography.h7,
                  color: colors["purple-400"],
                  fontWeight: "700",
                }}
              >
                {`#${nft.id}`}
              </Text>
              <Text
                style={{
                  ...typography.h7,
                  fontWeight: "700",
                }}
                numberOfLines={1}
              >
                {nft.name}
              </Text>
            </View>
          </View>
          <AddressInput
            placeholder="Enter receiving address"
            label="Send to"
            recipientConfig={sendConfigs.recipientConfig}
            memoConfig={sendConfigs.memoConfig}
            labelStyle={styles.sendlabelInput}
            inputContainerStyle={{
              backgroundColor: colors["background-box"],
            }}
          />
          <TextInput
            placeholder={`Max: ${nft.quantity}`}
            label="Quantity"
            inputContainerStyle={{
              backgroundColor: colors["background-box"],
            }}
            error={
              !quantity || quantity > nft.quantity
                ? "Please enter valid quantity"
                : ""
            }
            keyboardType={"number-pad"}
            inputRight={
              <View
                style={{
                  height: 1,
                  overflow: "visible",
                  justifyContent: "center",
                }}
              >
                <Button
                  text="MAX"
                  mode={"light"}
                  size="small"
                  containerStyle={{
                    height: 24,
                    borderRadius: spacing["8"],
                    backgroundColor: colors["primary-surface-default"],
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                  textStyle={{
                    color: colors["white"],
                    textTransform: "uppercase",
                  }}
                  onPress={() => {
                    setQuantity(nft.quantity);
                  }}
                />
              </View>
            }
            labelStyle={styles.sendlabelInput}
            value={quantity?.toString() ?? ""}
            onChangeText={(txt) => {
              if (Number(txt) > nft.quantity) {
                setQuantity(nft.quantity);
              } else {
                setQuantity(Number(txt));
              }
            }}
          />
          <FeeButtons
            label="Transaction Fee"
            gasLabel="gas"
            feeConfig={sendConfigs.feeConfig}
            gasConfig={sendConfigs.gasConfig}
            labelStyle={styles.sendlabelInput}
          />
          <MemoInput
            label="Memo (Optional)"
            inputContainerStyle={{
              backgroundColor: colors["background-box"],
            }}
            placeholder="Type your memo here"
            memoConfig={sendConfigs.memoConfig}
            labelStyle={styles.sendlabelInput}
          />
          <TouchableOpacity
            style={{
              marginBottom: 24,
              backgroundColor: colors["primary-surface-default"],
              borderRadius: 8,
            }}
            onPress={async () => {
              if (!quantity || quantity > nft.quantity) {
                alert("Please enter valid quantity");
                return;
              }
              if (account.isReadyToSendMsgs && txStateIsValid) {
                try {
                  await account.sendToken(
                    "0.000001", // amount is not in use, but must have to sendToken fn work normally 'cause we use the same fn with send cw20 token
                    sendConfigs.amountConfig.sendCurrency,
                    sendConfigs.recipientConfig.recipient,
                    sendConfigs.memoConfig.memo,
                    sendConfigs.feeConfig.toStdFee(),
                    {
                      preferNoSetFee: true,
                      preferNoSetMemo: true,
                      networkType: chainStore.current.networkType,
                    },
                    {
                      onBroadcasted: (txHash) => {
                        smartNavigation.pushSmart("TxPendingResult", {
                          txHash: Buffer.from(txHash).toString("hex"),
                        });
                      },
                    },
                    {
                      contract_addr:
                        nft.version === 1
                          ? "orai1ase8wkkhczqdda83f0cd9lnuyvf47465j70hyk"
                          : "orai1c3phe2dcu852ypgvt0peqj8f5kx4x0s4zqcky4",
                      recipient: sendConfigs.recipientConfig.recipient,
                      to: sendConfigs.recipientConfig.recipient,
                      token_id: nft.id.toString(),
                      amount: quantity.toString(),
                      type: nft.version === 1 ? "721" : "1155",
                    }
                  );
                } catch (e) {
                  if (e?.message === "Request rejected") {
                    return;
                  }
                  if (
                    e?.message.includes("Cannot read properties of undefined")
                  ) {
                    return;
                  }
                  if (smartNavigation.canGoBack) {
                    smartNavigation.goBack();
                  } else {
                    smartNavigation.navigateSmart("Home", {});
                  }
                }
              }
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
              Submit
            </Text>
          </TouchableOpacity>
        </OWBox>
      </View>
    </PageWithScrollView>
  );
});
