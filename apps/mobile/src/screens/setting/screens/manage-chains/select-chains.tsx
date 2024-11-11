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
import { ChainIdHelper } from "@owallet/cosmos";

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
        const chainsFilter = data.chains.filter(
          (chain) =>
            !EmbedChainInfos.some(
              (embedChain) => embedChain.chainId === chain.chainId
            ) &&
            !/test|dev/i.test(chain?.chainName) &&
            !chain?.chainId.includes("eip155")
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
        const [eip, chainNumber] = chainId.split(":");
        const hex = chainNumber === 1 ? "01" : Number(chainNumber).toString(16);
        const chainInfo = chainStore.getChain(`0x${hex}`);
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
              {item.features?.includes("eth-address-gen") && !!item?.evm
                ? "Evm"
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
