import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FooterLayout } from "../../layouts/footer-layout/footer-layout";
import { observer } from "mobx-react-lite";
import { InfoAccountCard } from "./components/info-account-card";
import { TokensCard } from "./components/tokens-card";
import { useStore } from "../../stores";
import Switch from "react-switch";
import { StakeView } from "./stake";
import { IntPretty, PricePretty } from "@owallet/unit";
import Mixpanel from "mixpanel";
import { sha256 } from "sha.js";
import {
  API,
  ChainIdEnum,
  DenomHelper,
  MapChainIdToNetwork,
  unknownToken,
} from "@owallet/common";
import { debounce } from "lodash";
import "dotenv/config";
import colors from "theme/colors";
var mixpanel = process.env.REACT_APP_MIX_PANEL_TOKEN
  ? Mixpanel.init(process.env.REACT_APP_MIX_PANEL_TOKEN)
  : null;
export const HomePage = observer(() => {
  const {
    chainStore,
    hugeQueriesStore,
    priceStore,
    accountStore,
    tokensStore,
    keyRingStore,
  } = useStore();
  const accountOrai = accountStore.getAccount(ChainIdEnum.Oraichain);
  const allBalances = hugeQueriesStore.getAllBalances(true);
  const balancesByChain = hugeQueriesStore.filterBalanceTokensByChain(
    allBalances,
    chainStore.current.chainId
  );

  const [isOpen, setOpen] = useState(false);

  const availableTotalPriceEmbedOnlyUSD = useMemo(() => {
    let result: PricePretty | undefined;
    for (const bal of hugeQueriesStore.allKnownBalances) {
      if (bal.price) {
        const price = priceStore.calculatePrice(bal.token, "usd");
        if (price) {
          if (!result) {
            result = price;
          } else {
            result = result.add(price);
          }
        }
      }
    }
    return result;
  }, [hugeQueriesStore.allKnownBalances, priceStore]);

  const debouncedSetUaw = useCallback(
    debounce((availableTotalPriceEmbedOnlyUSD) => {
      if (!availableTotalPriceEmbedOnlyUSD || !accountOrai.bech32Address)
        return;
      const hashedAddress = new sha256()
        .update(accountOrai.bech32Address)
        .digest("hex");

      const amount = new IntPretty(availableTotalPriceEmbedOnlyUSD || "0")
        .maxDecimals(2)
        .shrink(true)
        .trim(true)
        .locale(false)
        .inequalitySymbol(true);
      const logEvent = {
        userId: hashedAddress,
        totalPrice: amount?.toString() || "0",
        currency: "usd",
      };
      if (mixpanel) {
        mixpanel.track("OWallet Extension - Assets Managements", logEvent);
      }

      // Example API call or expensive operation
    }, 400), // Adjust the debounce time (ms) as needed
    []
  );
  useEffect(() => {
    debouncedSetUaw(availableTotalPriceEmbedOnlyUSD);
    return () => {};
  }, [accountOrai.bech32Address, availableTotalPriceEmbedOnlyUSD?.toString()]);
  const availableTotalPrice = useMemo(() => {
    let result: PricePretty | undefined;
    let balances = chainStore.isAllNetwork
      ? hugeQueriesStore.allKnownBalances
      : hugeQueriesStore.allKnownBalances.filter(
          (token) => token.chainInfo.chainId === chainStore.current.chainId
        );
    for (const bal of balances) {
      if (bal.price) {
        if (!result) {
          result = bal.price;
        } else {
          result = result.add(bal.price);
        }
      }
    }
    return result;
  }, [
    hugeQueriesStore.allKnownBalances,
    chainStore.isAllNetwork,
    chainStore.current.chainId,
  ]);

  const fetchAllErc20 = async (chainId, addressEvmHex) => {
    const chainInfo = chainStore.getChain(chainId);
    // Attempt to register the denom in the returned response.
    // If it's already registered anyway, it's okay because the method below doesn't do anything.
    // Better to set it as an array all at once to reduce computed.
    if (!MapChainIdToNetwork[chainInfo.chainId]) return;
    const response = await API.getAllBalancesEvm({
      address: addressEvmHex,
      network: MapChainIdToNetwork[chainInfo.chainId],
    });

    if (!response.result) return;

    const allTokensAddress = response.result
      .filter(
        (token) =>
          !!chainInfo.currencies.find(
            (coin) =>
              new DenomHelper(
                coin.coinMinimalDenom
              ).contractAddress?.toLowerCase() !==
              token.tokenAddress?.toLowerCase()
          ) && MapChainIdToNetwork[chainInfo.chainId]
      )
      .map((coin) => {
        const str = `${
          MapChainIdToNetwork[chainInfo.chainId]
        }%2B${new URLSearchParams(coin.tokenAddress)
          .toString()
          .replace("=", "")}`;
        return str;
      });

    if (allTokensAddress?.length === 0) return;

    const tokenInfos = await API.getMultipleTokenInfo({
      tokenAddresses: allTokensAddress.join(","),
    });

    const infoTokens = tokenInfos
      .filter(
        (item, index, self) =>
          index ===
            self.findIndex((t) => t.contractAddress === item.contractAddress) &&
          chainInfo.currencies.findIndex(
            (item2) =>
              new DenomHelper(
                item2.coinMinimalDenom
              ).contractAddress.toLowerCase() ===
              item.contractAddress.toLowerCase()
          ) < 0
      )
      .map((tokeninfo) => {
        const infoToken = {
          coinImageUrl: tokeninfo.imgUrl || unknownToken.coinImageUrl,
          coinDenom: tokeninfo.abbr,
          coinGeckoId: tokeninfo.coingeckoId || unknownToken.coinGeckoId,
          coinDecimals: tokeninfo.decimal,
          coinMinimalDenom: `erc20:${tokeninfo.contractAddress}:${tokeninfo.name}`,
          contractAddress: tokeninfo.contractAddress,
          type: "erc20",
        };
        tokensStore.addToken(chainId, infoToken);
        return infoToken;
      });
    //@ts-ignore
    chainInfo.addCurrencies(...infoTokens);
  };

  const accountEvm = accountStore.getAccount(
    ChainIdEnum.BNBChain
  ).evmosHexAddress;

  useEffect(() => {
    if (tokensStore.isInitialized && accountEvm) {
      const evms = [ChainIdEnum.BNBChain, ChainIdEnum.Ethereum];
      for (const chainId of evms) {
        fetchAllErc20(chainId, accountEvm);
      }
    }

    return () => {};
  }, [tokensStore.isInitialized, accountEvm]);
  return (
    <FooterLayout>
      <InfoAccountCard
        isLoading={false}
        totalPrice={availableTotalPrice?.toString() || "-"}
      />
      {chainStore.isAllNetwork ||
      chainStore.current.networkType !== "cosmos" ? null : (
        <StakeView />
      )}
      <div>
        <span>Side panel</span>
        <Switch
          onColor={colors["highlight-surface-active"]}
          uncheckedIcon={false}
          checkedIcon={false}
          height={20}
          width={35}
          onChange={async () => {
            if (true) {
              if (
                typeof chrome !== "undefined" &&
                typeof chrome.sidePanel !== "undefined"
              ) {
                (async () => {
                  const selfCloseId = Math.random() * 100000;
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore
                  window.__self_id_for_closing_view_side_panel = selfCloseId;
                  const viewsBefore = browser.extension.getViews();

                  try {
                    const activeTabs = await browser.tabs.query({
                      active: true,
                      currentWindow: true,
                    });
                    if (activeTabs.length > 0) {
                      const id = activeTabs[0].id;
                      if (id != null) {
                        await chrome.sidePanel.open({
                          tabId: id,
                        });
                      }
                    }
                  } catch (e) {
                    console.log(e);
                  } finally {
                    for (const view of viewsBefore) {
                      if (
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        window.__self_id_for_closing_view_side_panel !==
                        selfCloseId
                      ) {
                        view.window.close();
                      }
                    }

                    window.close();
                  }
                })();
              } else {
                window.close();
              }
            } else {
              const selfCloseId = Math.random() * 100000;
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              window.__self_id_for_closing_view_side_panel = selfCloseId;
              const views = browser.extension.getViews();

              for (const view of views) {
                if (
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore
                  window.__self_id_for_closing_view_side_panel !== selfCloseId
                ) {
                  view.window.close();
                }
              }

              window.close();
            }
          }}
          checked={chainStore.isHideDust}
        />
      </div>
      <TokensCard
        dataTokens={chainStore.isAllNetwork ? allBalances : balancesByChain}
      />
    </FooterLayout>
  );
});
