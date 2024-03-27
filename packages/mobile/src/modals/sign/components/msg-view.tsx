import React, { FunctionComponent, useEffect, useMemo, useState } from "react";
import { AppCurrency, Currency } from "@owallet/types";
import { CoinPrimitive } from "@owallet/stores";
import { observer } from "mobx-react-lite";
import { useStore } from "@src/stores";
import { useTheme } from "@src/themes/theme-provider";
import { StyleSheet, View } from "react-native";
import { removeDataInParentheses } from "@src/utils/helper";
import ItemReceivedToken from "@src/screens/transactions/components/item-received-token";
import { Bech32Address } from "@owallet/cosmos";
import { Coin, CoinUtils } from "@owallet/unit";
import FastImage from "react-native-fast-image";
import { clearDecimals, getPrice, hyphen } from "@src/modals/sign/helper";
import { AmountCard } from "@src/modals/sign/components/amount-card";
import {
  MsgTransfer,
  renderMsgExecuteContract,
} from "@src/modals/sign/messages";
import { useStyle } from "@src/styles";
import { Buffer } from "buffer";
import { Text } from "@src/components/text";
import yaml from "js-yaml";
import { Badge } from "@src/components/badge";
import { FormattedMessage } from "react-intl";
import { formatAddress } from "@owallet/common";
import { ScrollView } from "react-native-gesture-handler";

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginTop: 16,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 16,
  },
});
const renderImageCoin = (amount: CoinPrimitive, currencies: AppCurrency[]) => {
  if (!amount || !currencies) return;
  const coin = CoinUtils.convertCoinPrimitiveToCoinPretty(
    currencies,
    amount?.denom?.toLowerCase(),
    amount?.amount
  );

  if (coin?.currency?.coinImageUrl)
    return (
      <View
        style={{
          alignSelf: "center",
          paddingVertical: 8,
        }}
      >
        <FastImage
          style={{
            height: 30,
            width: 30,
          }}
          source={{
            uri: coin?.currency?.coinImageUrl,
          }}
        />
      </View>
    );
  return null;
};
export const SendMsgView: FunctionComponent<{
  currencies: AppCurrency[];
  amount: CoinPrimitive[];
  toAddress: string;
  fromAddress: string;
  receives: CoinPrimitive[];
}> = observer(({ amount, currencies, toAddress, fromAddress, receives }) => {
  const { priceStore } = useStore();
  const totalPrice =
    amount?.length === 1 ? getPrice(amount[0], currencies, priceStore) : "$0";
  const imageCoin =
    amount?.length === 1 ? renderImageCoin(amount[0], currencies) : null;
  const { colors } = useTheme();
  return (
    <View>
      <AmountCard
        imageCoin={imageCoin}
        amountStr={
          receives?.length > 0
            ? hyphen(
                receives
                  .map((coin) => {
                    return `-${coin.amount} ${removeDataInParentheses(
                      coin.denom
                    )}`;
                  })
                  .join(",")
              )
            : null
        }
        totalPrice={totalPrice}
      />
      <View
        style={[
          styles.container,
          { backgroundColor: colors["neutral-surface-card"] },
        ]}
      >
        <ItemReceivedToken
          label={"From"}
          valueDisplay={hyphen(Bech32Address.shortenAddress(fromAddress, 20))}
          value={fromAddress}
        />
        <ItemReceivedToken
          label={"To"}
          valueDisplay={hyphen(Bech32Address.shortenAddress(toAddress, 20))}
          value={toAddress}
        />
      </View>
    </View>
  );
});

export const MsgTransferView: FunctionComponent<{
  currencies: AppCurrency[];
  amount: CoinPrimitive;
  receiver: string;
}> = observer(({ amount, currencies, receiver }) => {
  const { priceStore } = useStore();
  const totalPrice = getPrice(amount, currencies, priceStore);
  const imageCoin = renderImageCoin(amount, currencies);
  const { colors } = useTheme();
  return (
    <View>
      <AmountCard
        imageCoin={imageCoin}
        amountStr={hyphen(
          `-${amount?.amount} ${removeDataInParentheses(amount?.denom)}`
        )}
        totalPrice={totalPrice}
      />
      <View
        style={[
          styles.container,
          { backgroundColor: colors["neutral-surface-card"] },
        ]}
      >
        <ItemReceivedToken
          label={"Receiver"}
          valueDisplay={hyphen(Bech32Address.shortenAddress(receiver, 20))}
          value={receiver}
        />
      </View>
    </View>
  );
});
export const MsgBeginRedelegateView: FunctionComponent<{
  currencies: AppCurrency[];
  amount: CoinPrimitive;
  validatorSrcAddress: string;
  validatorDstAddress: string;
}> = observer(
  ({ amount, currencies, validatorSrcAddress, validatorDstAddress }) => {
    const { priceStore, accountStore, chainStore } = useStore();
    const walletAddress = accountStore.getAccount(
      chainStore.current.chainId
    ).bech32Address;
    const totalPrice = getPrice(amount, currencies, priceStore);
    const imageCoin = renderImageCoin(amount, currencies);
    const { colors } = useTheme();
    return (
      <View>
        <AmountCard
          imageCoin={imageCoin}
          amountStr={hyphen(
            `-${amount?.amount} ${removeDataInParentheses(amount?.denom)}`
          )}
          totalPrice={totalPrice}
        />
        <View
          style={[
            styles.container,
            { backgroundColor: colors["neutral-surface-card"] },
          ]}
        >
          <ItemReceivedToken
            label={"Wallet"}
            valueDisplay={hyphen(
              Bech32Address.shortenAddress(walletAddress, 20)
            )}
            value={walletAddress}
          />
          <ItemReceivedToken
            label={"From Validator"}
            valueDisplay={hyphen(
              Bech32Address.shortenAddress(validatorSrcAddress, 24)
            )}
            value={validatorSrcAddress}
          />
          <ItemReceivedToken
            label={"To Validator"}
            valueDisplay={hyphen(
              Bech32Address.shortenAddress(validatorDstAddress, 24)
            )}
            value={validatorDstAddress}
          />
        </View>
      </View>
    );
  }
);

export const UnDelegateView: FunctionComponent<{
  currencies: AppCurrency[];
  amount: CoinPrimitive;
  validatorAddress: string;
}> = observer(({ amount, currencies, validatorAddress }) => {
  const { priceStore, accountStore, chainStore } = useStore();
  const walletAddress = accountStore.getAccount(
    chainStore.current.chainId
  ).bech32Address;
  const totalPrice = getPrice(amount, currencies, priceStore);
  const imageCoin = renderImageCoin(amount, currencies);
  const { colors } = useTheme();
  return (
    <View>
      <AmountCard
        imageCoin={imageCoin}
        amountStr={hyphen(
          `${amount?.amount} ${removeDataInParentheses(amount?.denom)}`
        )}
        totalPrice={totalPrice}
      />
      <View
        style={[
          styles.container,
          { backgroundColor: colors["neutral-surface-card"] },
        ]}
      >
        <ItemReceivedToken
          label={"Wallet"}
          valueDisplay={hyphen(Bech32Address.shortenAddress(walletAddress, 20))}
          value={walletAddress}
        />
        <ItemReceivedToken
          label={"Validator"}
          valueDisplay={hyphen(
            Bech32Address.shortenAddress(validatorAddress, 24)
          )}
          value={validatorAddress}
        />
      </View>
    </View>
  );
});

export const MsgDelegateView: FunctionComponent<{
  currencies: AppCurrency[];
  amount: CoinPrimitive;
  validatorAddress: string;
}> = observer(({ amount, currencies, validatorAddress }) => {
  const { priceStore, accountStore, chainStore } = useStore();
  const walletAddress = accountStore.getAccount(
    chainStore.current.chainId
  ).bech32Address;
  const totalPrice = getPrice(amount, currencies, priceStore);
  const imageCoin = renderImageCoin(amount, currencies);
  const { colors } = useTheme();
  return (
    <View>
      <AmountCard
        imageCoin={imageCoin}
        amountStr={hyphen(
          `${amount?.amount} ${removeDataInParentheses(amount?.denom)}`
        )}
        totalPrice={totalPrice}
      />
      <View
        style={[
          styles.container,
          { backgroundColor: colors["neutral-surface-card"] },
        ]}
      >
        <ItemReceivedToken
          label={"Wallet"}
          valueDisplay={hyphen(Bech32Address.shortenAddress(walletAddress, 20))}
          value={walletAddress}
        />
        <ItemReceivedToken
          label={"Validator"}
          valueDisplay={hyphen(
            Bech32Address.shortenAddress(validatorAddress, 24)
          )}
          value={validatorAddress}
        />
      </View>
    </View>
  );
});

export const WithdrawDelegateView: FunctionComponent<{
  validatorAddress: string;
}> = observer(({ validatorAddress }) => {
  const { colors } = useTheme();
  return (
    <View>
      <View
        style={{
          backgroundColor: colors["neutral-surface-card"],
          paddingHorizontal: 16,
        }}
      >
        <ItemReceivedToken
          label={"Validator"}
          valueDisplay={hyphen(
            Bech32Address.shortenAddress(validatorAddress, 24)
          )}
          value={validatorAddress}
        />
      </View>
    </View>
  );
});

export const MsgExecuteContractView: FunctionComponent<{
  currencies: Currency[];
  callbackCodeHash: string | undefined;
  contract: string;
  // eslint-disable-next-line @typescript-eslint/ban-types
  msg: object | string;
  sent: CoinPrimitive[];
}> = observer(({ sent, currencies, contract, callbackCodeHash, msg }) => {
  const { priceStore, accountStore, chainStore } = useStore();
  const totalPrice =
    sent?.length === 1 ? getPrice(sent[0], currencies, priceStore) : null;
  const imageCoin =
    sent?.length === 1 ? renderImageCoin(sent[0], currencies) : null;
  const { colors } = useTheme();
  const isSecretWasm = callbackCodeHash != null;
  return (
    <View>
      {sent?.length > 0 ? (
        <AmountCard
          imageCoin={imageCoin}
          amountStr={hyphen(
            sent
              .map((coin) => {
                return `${coin.amount} ${coin.denom}`;
              })
              .join(",")
          )}
          totalPrice={totalPrice}
        />
      ) : (
        <ScrollView
          style={{
            backgroundColor: colors["neutral-surface-bg"],
            padding: 16,
            borderRadius: 24,
            maxHeight: 300,
          }}
        >
          <WasmExecutionMsgView msg={msg} />
        </ScrollView>
      )}
      <View
        style={[
          styles.container,
          { backgroundColor: colors["neutral-surface-card"] },
        ]}
      >
        {isSecretWasm && (
          <React.Fragment>
            <Badge
              color="primary"
              style={{ marginTop: "6px", marginBottom: "6px" }}
            >
              <FormattedMessage id="sign.list.message.wasm/MsgExecuteContract.content.badge.secret-wasm" />
            </Badge>
          </React.Fragment>
        )}
        <ItemReceivedToken
          label={"To Contract"}
          valueDisplay={hyphen(Bech32Address.shortenAddress(contract, 26))}
          value={contract}
        />
      </View>
    </View>
  );
});
export const IBCMsgTransferView: FunctionComponent<MsgTransfer["value"]> =
  observer(({ sender, receiver, token, source_channel, source_port }) => {
    const { colors } = useTheme();
    return (
      <View>
        <View
          style={[
            styles.container,
            { backgroundColor: colors["neutral-surface-card"] },
          ]}
        >
          <ItemReceivedToken
            label={"Amount"}
            valueDisplay={`${token?.amount}`}
            btnCopy={false}
          />
          <ItemReceivedToken
            label={"Denom"}
            valueDisplay={`${removeDataInParentheses(token?.denom)}`}
            valueProps={{
              size: token?.denom?.length > 20 ? 12 : 16,
            }}
            btnCopy={false}
          />
          <ItemReceivedToken
            label={"From"}
            valueDisplay={formatAddress(sender)}
            value={sender}
          />
          <ItemReceivedToken
            label={"To"}
            valueDisplay={formatAddress(receiver)}
            value={receiver}
          />
          {source_channel && (
            <ItemReceivedToken
              label={"Channel"}
              valueDisplay={source_channel}
              btnCopy={false}
            />
          )}
          {source_port && (
            <ItemReceivedToken
              label={"Port"}
              valueDisplay={source_port}
              btnCopy={false}
            />
          )}
        </View>
      </View>
    );
  });

export const WasmExecutionMsgView: FunctionComponent<{
  // eslint-disable-next-line @typescript-eslint/ban-types
  msg: object | string;
}> = observer(({ msg }) => {
  const { chainStore, accountStore } = useStore();

  const style = useStyle();

  // TODO: Toggle open button?
  // const [isOpen, setIsOpen] = useState(true);
  // const toggleOpen = () => setIsOpen((isOpen) => !isOpen);

  const [detailsMsg, setDetailsMsg] = useState(() =>
    JSON.stringify(msg, null, 2)
  );
  const [warningMsg, setWarningMsg] = useState("");

  useEffect(() => {
    // If msg is string, it will be the message for secret-wasm.
    // So, try to decrypt.
    // But, if this msg is not encrypted via OWallet, OWallet cannot decrypt it.
    // TODO: Handle the error case. If an error occurs, rather than rejecting the signing, it informs the user that OWallet cannot decrypt it and allows the user to choose.
    if (typeof msg === "string") {
      (async () => {
        try {
          let cipherText = Buffer.from(Buffer.from(msg, "base64"));
          // Msg is start with 32 bytes nonce and 32 bytes public key.
          const nonce = cipherText.slice(0, 32);
          cipherText = cipherText.slice(64);

          const owallet = await accountStore
            .getAccount(chainStore.current.chainId)
            .getOWallet();
          if (!owallet) {
            throw new Error("Can't get the owallet API");
          }

          const enigmaUtils = owallet.getEnigmaUtils(
            chainStore.current.chainId
          );
          let plainText = Buffer.from(
            await enigmaUtils.decrypt(cipherText, nonce)
          );
          // Remove the contract code hash.
          plainText = plainText.slice(64);

          setDetailsMsg(
            JSON.stringify(JSON.parse(plainText.toString()), null, 2)
          );
          setWarningMsg("");
        } catch {
          setWarningMsg(
            "Failed to decrypt Secret message. This may be due to OWallet viewing key not matching the transaction viewing key."
          );
        }
      })();
    }
  }, [accountStore, chainStore, chainStore.current.chainId, msg]);

  return (
    <Text style={style.flatten(["margin-top-8"])}>
      <Text>{`\n${detailsMsg}`}</Text>
      {warningMsg ? (
        <Text style={style.flatten(["color-danger-200"])}>{warningMsg}</Text>
      ) : null}
    </Text>
  );
});

// eslint-disable-next-line @typescript-eslint/ban-types
export const UnknownMsgView: FunctionComponent<{ msg: object }> = observer(
  ({ msg }) => {
    const style = useStyle();
    const { priceStore, chainStore } = useStore();
    const prettyMsg = useMemo(() => {
      try {
        return yaml.dump(msg);
      } catch (e) {
        console.log(e);
        return "Failed to decode the msg";
      }
    }, [msg]);
    const { colors } = useTheme();
    console.log(msg, "msg kaka");
    if (msg?.value?.msg?.transfer) {
      const currencies = chainStore.current.currencies;
      const contract = msg?.value?.contract;
      const balance = msg?.value?.msg?.transfer?.amount;
      const amount = {
        denom: contract,
        amount: balance,
      };
      const totalPrice =
        amount?.denom && amount?.amount
          ? getPrice(amount, currencies, priceStore)
          : null;
      const imageCoin =
        amount?.denom && amount?.amount
          ? renderImageCoin(amount, currencies)
          : null;
      const { colors } = useTheme();
      const recipient = msg?.value?.msg?.transfer?.recipient;
      const sender = msg?.value?.sender;
      const coin =
        amount.denom && amount.amount
          ? CoinUtils.convertCoinPrimitiveToCoinPretty(
              currencies,
              amount.denom?.toLowerCase(),
              amount.amount
            )
          : null;
      return (
        <View>
          {coin && (
            <AmountCard
              imageCoin={imageCoin}
              amountStr={hyphen(`-${coin?.toString()}`)}
              totalPrice={totalPrice}
            />
          )}
          <View
            style={[
              styles.container,
              { backgroundColor: colors["neutral-surface-card"] },
            ]}
          >
            {sender && (
              <ItemReceivedToken
                label={"From"}
                valueDisplay={hyphen(Bech32Address.shortenAddress(sender, 20))}
                value={sender}
              />
            )}
            {recipient && (
              <ItemReceivedToken
                label={"To"}
                valueDisplay={hyphen(
                  Bech32Address.shortenAddress(recipient, 20)
                )}
                value={recipient}
              />
            )}
            {contract && (
              <ItemReceivedToken
                label={"Contract"}
                valueDisplay={hyphen(
                  Bech32Address.shortenAddress(contract, 20)
                )}
                value={contract}
              />
            )}
          </View>
        </View>
      );
    }
    return (
      <View
        style={{
          flex: 1,
        }}
      >
        <ScrollView
          horizontal={true}
          style={{
            backgroundColor: colors["neutral-surface-bg"],
            padding: 16,
            borderRadius: 24,
            maxHeight: 300,
          }}
        >
          <Text style={style.flatten(["body3", "color-text-black-low"])}>
            {prettyMsg}
          </Text>
        </ScrollView>
      </View>
    );
  }
);
