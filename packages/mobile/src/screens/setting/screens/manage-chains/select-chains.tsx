import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
} from "react";
import { observer } from "mobx-react-lite";
import { PageWithScrollView, PageWithView } from "@components/page";
import { OWBox } from "@components/card";
import { View } from "react-native";
import OWIcon from "@components/ow-icon/ow-icon";
import { fetchRetry, limitString, unknownToken } from "@owallet/common";
import { useTheme } from "@src/themes/theme-provider";
import OWText from "@components/text/ow-text";
import OWFlatList from "@components/page/ow-flat-list";
import { Toggle } from "@components/toggle";
import { OWSearchInput } from "@components/ow-search-input";
import { useStore } from "@src/stores";
import { _keyExtract } from "@utils/helper";

export const SelectChainsScreen: FunctionComponent = observer(() => {
  const { colors } = useTheme();
  const [chains, setChains] = useState([]);

  const [keyword, setKeyword] = useState("");
  const { chainStore } = useStore();
  const [chainEnables, setChainEnables] = useState({});
  useEffect(() => {
    (async () => {
      const data = await fetchRetry(
        "https://keplr-chain-registry.vercel.app/api/chains"
      );
      if (!data.chains) return;
      const sortedChains = [...data.chains].sort((a, b) => {
        const aHasChainInfo = chainInfoExists(a.chainId);
        const bHasChainInfo = chainInfoExists(b.chainId);
        // Sort: true comes first, false comes later
        return aHasChainInfo === bHasChainInfo ? 0 : aHasChainInfo ? -1 : 1;
      });
      setChains(sortedChains);
    })();
  }, []);
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
      chainInfoCheck[chain.chainId] = chainInfoExists(chain.chainId);
    }
    setChainEnables(chainInfoCheck);
  }, [chains]);

  const renderChain = ({ item }) => {
    return (
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",

          paddingVertical: 12,
          paddingHorizontal: 8,
          borderBottomWidth: 0.5,
          borderBottomColor: colors["neutral-border-default"],
          justifyContent: "space-between",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 16,
          }}
        >
          <View
            style={{
              alignItems: "center",
              justifyContent: "center",
              width: 44,
              height: 44,
              borderRadius: 44,
              backgroundColor: colors["neutral-surface-action"],
            }}
          >
            <OWIcon
              type="images"
              source={{
                uri: item?.chainSymbolImageUrl || unknownToken.coinImageUrl,
              }}
              style={{
                borderRadius: 999,
              }}
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
          onChange={async (value) => {
            if (!chainEnables?.[item.chainId]) {
              try {
                await chainStore.addChain(item);
                setChainEnables((prev) => ({
                  ...prev,
                  [item.chainId]: true,
                }));
              } catch (e) {
                console.log(e, "err add chain");
              }
            } else {
              try {
                await chainStore.removeChainInfo(item.chainId);
                setChainEnables((prev) => ({
                  ...prev,
                  [item.chainId]: false,
                }));
              } catch (e) {
                console.log(e, "err removeChain chain");
              }
            }

            // const chainInfo = chains.find(chain => chain.chainId === value);

            // setToggle(value);
          }}
        />
      </View>
    );
  };
  return (
    <PageWithView>
      <OWBox
        style={{
          paddingHorizontal: 16,
          marginTop: 0,
        }}
      >
        <View>
          <OWSearchInput
            containerStyle={{
              paddingBottom: 20,
            }}
            onValueChange={(txt) => {
              setKeyword(txt);
            }}
            placeHolder={"Search for by name"}
          />
        </View>
        <OWFlatList
          style={{
            marginTop: 35,
          }}
          data={chains.filter((chain, index) =>
            chain.chainName?.toLowerCase().includes(keyword?.toLowerCase())
          )}
          renderItem={renderChain}
          keyExtractor={_keyExtract}
        />
      </OWBox>
    </PageWithView>
  );
});
