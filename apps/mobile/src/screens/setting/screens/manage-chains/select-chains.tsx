import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
} from "react";
import { observer } from "mobx-react-lite";
import { PageWithScrollView, PageWithView } from "@components/page";
import { OWBox } from "@components/card";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import OWIcon from "@components/ow-icon/ow-icon";
import {
  delay,
  EmbedChainInfos,
  fetchRetry,
  limitString,
  unknownToken,
} from "@owallet/common";
import { useTheme } from "@src/themes/theme-provider";
import OWText from "@components/text/ow-text";
import OWFlatList from "@components/page/ow-flat-list";
import { Toggle } from "@components/toggle";
import { OWSearchInput } from "@components/ow-search-input";
import { useStore } from "@src/stores";
import { _keyExtract, showToast } from "@utils/helper";
import { ChainIdHelper, Bech32Address } from "@owallet/cosmos";
import { ChainInfo } from "@owallet/types";

const embedChainInfos: ChainInfo[] = [
  {
    rpc: "https://sapphire.oasis.io",
    rest: "https://sapphire.oasis.io",
    grpc: "https://grpc.oasis.dev",
    chainId: "oasis-1",
    chainName: "Oasis Mainnet",
    chainSymbolImageUrl:
      "https://s2.coinmarketcap.com/static/img/coins/64x64/7653.png",
    stakeCurrency: {
      coinDenom: "ROSE",
      coinMinimalDenom: "rose",
      coinDecimals: 9,
      coinGeckoId: "oasis-network",
      coinImageUrl:
        "https://s2.coinmarketcap.com/static/img/coins/64x64/7653.png",
    },
    currencies: [
      {
        coinDenom: "ROSE",
        coinMinimalDenom: "rose",
        coinDecimals: 9,
        coinGeckoId: "oasis-network",
        coinImageUrl:
          "https://s2.coinmarketcap.com/static/img/coins/64x64/7653.png",
      },
    ],
    bip44: {
      coinType: 474,
    },
    bech32Config: Bech32Address.defaultBech32Config("oasis"),
    feeCurrencies: [
      {
        coinDenom: "ROSE",
        coinMinimalDenom: "rose",
        coinDecimals: 9,
        coinGeckoId: "oasis-network",
        coinImageUrl:
          "https://s2.coinmarketcap.com/static/img/coins/64x64/7653.png",
        gasPriceStep: {
          high: 0,
          low: 0,
          average: 0,
        },
      },
    ],
    features: ["oasis", "gen-address", "not-support-staking"],
    txExplorer: {
      name: "Oasis scan",
      txUrl: "https://www.oasisscan.com/transactions/{txHash}",
      accountUrl: "https://www.oasisscan.com/accounts/detail/{address}",
    },
  },
  {
    chainId: "oraibtc-mainnet-1",
    chainName: "OraiBTC Bridge",
    rpc: "https://btc.rpc.orai.io",
    rest: "https://btc.lcd.orai.io",
    chainSymbolImageUrl:
      "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/Oraichain/chain.png",
    stakeCurrency: {
      coinDenom: "ORAIBTC",
      coinMinimalDenom: "uoraibtc",
      coinDecimals: 6,
      coinImageUrl:
        "https://assets.coingecko.com/coins/images/1/small/bitcoin.png",
    },
    bip44: {
      coinType: 118,
    },
    bech32Config: Bech32Address.defaultBech32Config("oraibtc"),
    // List of all coin/tokens used in this chain.
    get currencies() {
      return [this.stakeCurrency];
    },
    get feeCurrencies() {
      return [
        {
          ...this.stakeCurrency,
          gasPriceStep: {
            low: 0,
            average: 0,
            high: 0,
          },
        },
      ];
    },
    features: ["stargate", "ibc-transfer", "cosmwasm"],
    txExplorer: {
      name: "Scanium",
      txUrl: "https://scanium.io/OraiBtcMainnet/tx/{txHash}",
    },
  },
  {
    rpc: "https://blockstream.info/api",
    rest: "https://blockstream.info/api",
    chainId: "bitcoin",
    chainName: "Bitcoin",
    chainSymbolImageUrl:
      "https://assets.coingecko.com/coins/images/1/small/bitcoin.png",
    bip44: {
      coinType: 0,
    },
    bip84: {
      coinType: 0,
    },
    stakeCurrency: {
      coinDenom: "BTC",
      coinMinimalDenom: "segwit:btc",
      coinDecimals: 8,
      coinGeckoId: "bitcoin",
      coinImageUrl:
        "https://assets.coingecko.com/coins/images/1/small/bitcoin.png",
    },
    bech32Config: Bech32Address.defaultBech32Config("bc"),
    currencies: [
      {
        type: "legacy",
        coinDenom: "BTC",
        coinMinimalDenom: "legacy:btc",
        coinDecimals: 8,
        coinGeckoId: "bitcoin",
        coinImageUrl:
          "https://assets.coingecko.com/coins/images/1/small/bitcoin.png",
      },
      {
        type: "segwit",
        coinDenom: "BTC",
        coinMinimalDenom: "segwit:btc",
        coinDecimals: 8,
        coinGeckoId: "bitcoin",
        coinImageUrl:
          "https://assets.coingecko.com/coins/images/1/small/bitcoin.png",
      },
    ],
    get feeCurrencies() {
      return [
        {
          coinDenom: "BTC",
          coinMinimalDenom: "segwit:btc",
          coinDecimals: 8,
          coinGeckoId: "bitcoin",
          coinImageUrl:
            "https://assets.coingecko.com/coins/images/1/small/bitcoin.png",
          gasPriceStep: {
            low: 144,
            average: 18,
            high: 1,
          },
        },
        {
          coinDenom: "BTC",
          coinMinimalDenom: "legacy:btc",
          coinDecimals: 8,
          coinGeckoId: "bitcoin",
          coinImageUrl:
            "https://assets.coingecko.com/coins/images/1/small/bitcoin.png",
          gasPriceStep: {
            low: 144,
            average: 18,
            high: 1,
          },
        },
      ];
    },

    features: ["gen-address", "btc", "not-support-staking"],
    txExplorer: {
      name: "BlockStream",
      txUrl: "https://blockstream.info/tx/{txHash}",
      accountUrl: "https://blockstream.info/address/{address}",
    },
  },
  {
    chainId: "oraibridge-subnet-2",
    chainName: "OraiBridge",
    chainSymbolImageUrl:
      "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/Oraichain/chain.png",
    rpc: "https://bridge-v2.rpc.orai.io",
    rest: "https://bridge-v2.lcd.orai.io",
    stakeCurrency: {
      coinDenom: "ORAIB",
      coinMinimalDenom: "uoraib",
      coinDecimals: 6,
      coinImageUrl:
        "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/Oraichain/chain.png",
    },
    bip44: {
      coinType: 118,
    },
    bech32Config: Bech32Address.defaultBech32Config("oraib"),
    // List of all coin/tokens used in this chain.
    get currencies() {
      return [
        this.stakeCurrency,
        {
          coinDenom: "BEP20 ORAI",
          coinMinimalDenom: "oraib0xA325Ad6D9c92B55A3Fc5aD7e412B1518F96441C0",
          coinDecimals: 18,
          coinGeckoId: "oraichain-token",
          coinImageUrl:
            "https://raw.githubusercontent.com/cosmos/chain-registry/master/oraichain/images/orai-token.png",
        },
        {
          coinDenom: "BEP20 AIRI",
          coinMinimalDenom: "oraib0x7e2A35C746F2f7C240B664F1Da4DD100141AE71F",
          coinDecimals: 18,
          coinGeckoId: "airight",
          coinImageUrl:
            "https://raw.githubusercontent.com/cosmos/chain-registry/refs/heads/master/oraichain/images/airi.png",
        },
        {
          coinDenom: "BEP20 USDT",
          coinMinimalDenom: "oraib0x55d398326f99059fF775485246999027B3197955",
          coinDecimals: 18,
          coinGeckoId: "tether",
          coinImageUrl:
            "https://s2.coinmarketcap.com/static/img/coins/64x64/825.png",
        },
      ];
    },
    get feeCurrencies() {
      return [
        {
          ...this.stakeCurrency,
          gasPriceStep: {
            low: 0,
            average: 0,
            high: 0,
          },
        },
      ];
    },
    features: ["stargate", "ibc-transfer", "cosmwasm"],
    txExplorer: {
      name: "Orai Bridge Scan",
      txUrl: "https://scan.bridge.orai.io/txs/{txHash}",
      accountUrl: "https://scan.bridge.orai.io/account/{address}",
    },
  },
  {
    rpc: "https://sapphire.oasis.io",
    rest: "https://sapphire.oasis.io",
    chainId: "eip155:23294",
    evm: {
      websocket: "wss://sapphire.oasis.io/ws",
      rpc: "https://sapphire.oasis.io",
      chainId: 23294,
    },
    chainSymbolImageUrl:
      "https://s2.coinmarketcap.com/static/img/coins/64x64/7653.png",
    chainName: "Oasis Sapphire",
    bip44: {
      coinType: 60,
    },
    stakeCurrency: {
      coinDenom: "ROSE",
      coinMinimalDenom: "rose",
      coinDecimals: 18,
      coinGeckoId: "oasis-network",
      coinImageUrl:
        "https://s2.coinmarketcap.com/static/img/coins/64x64/7653.png",
    },
    currencies: [
      {
        coinDenom: "ROSE",
        coinMinimalDenom: "rose",
        coinDecimals: 18,
        coinGeckoId: "oasis-network",
        coinImageUrl:
          "https://s2.coinmarketcap.com/static/img/coins/64x64/7653.png",
      },
    ],
    get feeCurrencies() {
      return [this.stakeCurrency];
    },

    features: ["not-support-staking", "oasis-address"],
    txExplorer: {
      name: "Oasis Saphire Scan",
      txUrl: "https://explorer.oasis.io/mainnet/sapphire/tx/{txHash}",
      accountUrl:
        "https://explorer.oasis.io/mainnet/sapphire/address/{address}",
    },
  },
  {
    rpc: "https://rpc.ankr.com/fantom",
    rest: "https://rpc.ankr.com/fantom",
    chainId: "eip155:250",
    chainName: "Fantom Opera",
    bip44: {
      coinType: 60,
    },
    evm: {
      websocket: "wss://fantom.callstaticrpc.com",
      rpc: "https://rpc.ankr.com/fantom",
      chainId: 250,
    },
    stakeCurrency: {
      coinDenom: "FTM",
      coinMinimalDenom: "ftm",
      coinDecimals: 18,
      coinGeckoId: "fantom",
      coinImageUrl:
        "https://assets.coingecko.com/coins/images/4001/standard/Fantom_round.png?1696504642",
    },
    chainSymbolImageUrl: "https://icons.llamao.fi/icons/chains/rsz_fantom.jpg",
    get currencies() {
      return [
        {
          coinDenom: "FTM",
          coinMinimalDenom: "ftm",
          coinDecimals: 18,
          coinGeckoId: "fantom",
          coinImageUrl:
            "https://assets.coingecko.com/coins/images/4001/standard/Fantom_round.png?1696504642",
        },
      ];
    },
    get feeCurrencies() {
      return [
        {
          ...this.stakeCurrency,
          gasPriceStep: {
            low: 1,
            average: 1.25,
            high: 1.5,
          },
        },
      ];
    },
    features: ["not-support-staking"],
    txExplorer: {
      name: "FanTom Scan",
      txUrl: "https://ftmscan.com/tx/{txHash}",
      accountUrl: "https://ftmscan.com/address/{address}",
    },
  },
  {
    rpc: "https://emerald.oasis.dev",
    rest: "https://emerald.oasis.dev",
    chainId: "eip155:42262",
    chainSymbolImageUrl:
      "https://s2.coinmarketcap.com/static/img/coins/64x64/7653.png",
    chainName: "Oasis Emerald",
    evm: {
      websocket: "wss://emerald.oasis.io/ws",
      rpc: "https://emerald.oasis.dev",
      chainId: 42262,
    },
    bip44: {
      coinType: 60,
    },
    stakeCurrency: {
      coinDenom: "ROSE",
      coinMinimalDenom: "rose",
      coinDecimals: 18,
      coinGeckoId: "oasis-network",
      coinImageUrl:
        "https://s2.coinmarketcap.com/static/img/coins/64x64/7653.png",
    },
    currencies: [
      {
        coinDenom: "ROSE",
        coinMinimalDenom: "rose",
        coinDecimals: 18,
        coinGeckoId: "oasis-network",
        coinImageUrl:
          "https://s2.coinmarketcap.com/static/img/coins/64x64/7653.png",
      },
    ],
    get feeCurrencies() {
      return [this.stakeCurrency];
    },

    features: ["not-support-staking", "oasis-address"],
    txExplorer: {
      name: "Oasis Emerald Scan",
      txUrl: "https://explorer.oasis.io/mainnet/emerald/tx/{txHash}",
      accountUrl: "https://explorer.oasis.io/mainnet/emerald/address/{address}",
    },
  },
];
export const SelectChainsScreen: FunctionComponent = observer(() => {
  const { colors } = useTheme();
  const [chains, setChains] = useState([]);

  const [keyword, setKeyword] = useState("");
  const { chainStore, keyRingStore } = useStore();
  const [isLoading, setIsLoading] = useState(false);
  const [chainEnables, setChainEnables] = useState({});
  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const data = await fetchRetry(
          "https://keplr-chain-registry.vercel.app/api/chains"
        );
        if (!data.chains) return;
        const chainsFilter = embedChainInfos
          .concat(data.chains)
          .filter(
            (chain) =>
              !EmbedChainInfos.some(
                (embedChain) => embedChain.chainId === chain.chainId
              ) && !/test|dev/i.test(chain?.chainName)
          );
        const sortedChains = chainsFilter.sort((a, b) => {
          const aHasChainInfo = chainInfoExists(a.chainId);
          const bHasChainInfo = chainInfoExists(b.chainId);
          // Sort: true comes first, false comes later
          return aHasChainInfo === bHasChainInfo ? 0 : aHasChainInfo ? -1 : 1;
        });

        setChains(sortedChains);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);
  const onEnableOrDisableChain = useCallback(
    async (item) => {
      const vaultId = keyRingStore.selectedKeyInfo.id;
      const chainIdentifier = ChainIdHelper.parse(item.chainId).identifier;
      if (!chainEnables?.[item.chainId]) {
        try {
          //@ts-ignore
          await window.owallet.experimentalSuggestChain(item);

          setChainEnables((prev) => ({
            ...prev,
            [item.chainId]: true,
          }));
          await delay(300);
          await chainStore.enableChainInfoInUIWithVaultId(
            vaultId,
            ...[chainIdentifier]
          );
        } catch (e) {
          showToast({
            type: "danger",
            message: "Rejected",
          });
          console.log(e, "err add chain");
        }
      } else {
        try {
          await chainStore.removeChainInfo(item.chainId);
          await delay(100);
          setChainEnables((prev) => ({
            ...prev,
            [item.chainId]: false,
          }));
          await delay(200);
          await chainStore.disableChainInfoInUIWithVaultId(
            vaultId,
            ...[chainIdentifier]
          );
        } catch (e) {
          showToast({
            type: "danger",
            message: "Do not disable chain native from the config.",
          });
          console.log(e, "err removeChain chain");
        }
      }
    },
    [chainEnables]
  );
  // Create a function to check if the chainInfo exists
  const chainInfoExists = (chainId) => {
    try {
      if (!chainId.includes("eip155")) {
        const chainInfo = chainStore.getChain(chainId);
        return !!chainInfo; // Returns true if chainInfo exists, false otherwise
      } else {
        const chainInfo = chainStore.getChain(chainId);
        return !!chainInfo;
      }
    } catch (e) {
      return false;
    }
  };

  useEffect(() => {
    if (!chains?.length) return;

    const chainInfoCheck = {};
    for (const chain of chains) {
      if (!chain?.chainId) continue;
      chainInfoCheck[chain.chainId] = chainInfoExists(chain.chainId);
    }
    setChainEnables(chainInfoCheck);
  }, [chains]);

  const styles = styling(colors);
  const renderChain = ({ item }) => {
    return (
      <TouchableOpacity
        onPress={() => onEnableOrDisableChain(item)}
        style={styles.chainContainer}
      >
        <View style={styles.chainInfo}>
          <View style={styles.chainIcon}>
            <OWIcon
              type="images"
              source={{
                uri: item?.chainSymbolImageUrl || unknownToken.coinImageUrl,
              }}
              style={styles.chainIconImage}
              size={38}
            />
          </View>
          <View>
            <OWText size={16} weight="600">
              {limitString(item?.chainName, 20)}
            </OWText>
            <OWText size={15} color={colors["neutral-text-body"]} weight="500">
              {item.chainId?.includes("eip155:")
                ? "Evm"
                : item.features?.includes("oasis")
                ? "Oasis"
                : item.features?.includes("btc")
                ? "BTC"
                : "Cosmos"}
            </OWText>
          </View>
        </View>
        <Toggle
          on={chainEnables?.[item.chainId]}
          onChange={() => onEnableOrDisableChain(item)}
        />
      </TouchableOpacity>
    );
  };
  console.log(chains, "chains kaka");
  return (
    <PageWithView>
      <OWBox style={styles.pageContainer}>
        <View>
          <OWSearchInput
            containerStyle={styles.searchContainer}
            onValueChange={(txt) => {
              setKeyword(txt);
            }}
            placeHolder={"Search for by name"}
          />
        </View>
        <OWFlatList
          loading={isLoading}
          style={styles.flatList}
          data={chains.filter(
            (chain, index) =>
              chain.chainName?.toLowerCase().includes(keyword?.toLowerCase()) ||
              chain.chainId?.toLowerCase().includes(keyword?.toLowerCase())
          )}
          renderItem={renderChain}
          keyExtractor={_keyExtract}
        />
      </OWBox>
    </PageWithView>
  );
});
const styling = (colors) => {
  return StyleSheet.create({
    pageContainer: {
      paddingHorizontal: 16,
      marginTop: 0,
      backgroundColor: colors["neutral-surface-card"],
    },
    searchContainer: {
      paddingBottom: 20,
    },
    flatList: {
      marginTop: 35,
    },
    chainContainer: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
      paddingHorizontal: 8,
      borderBottomWidth: 0.5,
      borderBottomColor: colors["neutral-border-default"],
      justifyContent: "space-between",
    },
    chainInfo: {
      flexDirection: "row",
      alignItems: "center",
      gap: 16,
    },
    chainIcon: {
      alignItems: "center",
      justifyContent: "center",
      width: 44,
      height: 44,
      borderRadius: 44,
      backgroundColor: colors["neutral-surface-action"],
    },
    chainIconImage: {
      borderRadius: 999,
    },
  });
};
