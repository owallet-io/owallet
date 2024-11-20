import React, { useCallback, useEffect, useMemo } from "react";
import { FooterLayout } from "../../layouts/footer-layout/footer-layout";
import { observer } from "mobx-react-lite";
import { InfoAccountCard } from "./components/info-account-card";
import { TokensCard } from "./components/tokens-card";
import { useStore } from "../../stores";

import { LinkStakeView, StakeView } from "./stake";
import { CoinPretty, Dec, IntPretty, PricePretty } from "@owallet/unit";
// var Mixpanel = require('mixpanel');
import Mixpanel from "mixpanel";
import { sha256 } from "sha.js";
import {
  API,
  ChainIdEnum,
  DenomHelper,
  MapChainIdToNetwork,
  Network,
  unknownToken,
} from "@owallet/common";
import { debounce } from "lodash";
import "dotenv/config";
import { initPrice } from "hooks/use-multiple-assets";
import { clusterApiUrl, Connection, PublicKey } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

var mixpanelId = "acbafd21a85654933cbb0332c5a6f4f8";
const mixpanel = Mixpanel.init(mixpanelId);
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
  const accountSol = accountStore.getAccount(
    "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp"
  );
  const allBalances = hugeQueriesStore.getAllBalances(true);
  const balancesByChain = hugeQueriesStore.filterBalanceTokensByChain(
    allBalances,
    chainStore.current.chainId
  );
  useEffect(() => {
    (async () => {
      // connection
      const connection = new Connection(
        "https://swr.xnftdata.com/rpc-proxy/",
        "confirmed"
      );
      if (!accountSol.base58Address) return;
      // const tokenAddresses = res.result
      //     .map((item, index) => {
      //       return `${Network.SOLANA}%2B${
      //           item.tokenAddress
      //       }`;
      //     })
      //     .join(",");
      const test = await API.getMultipleTokenInfo({
        tokenAddresses: `${Network.SOLANA}%2BEs9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB`,
      });
      // console.log(test,"test");
      const publicKey = new PublicKey(accountSol.base58Address);
      const lamports = await connection.getBalance(publicKey);
      const solBalance = new CoinPretty(
        {
          coinDenom: "SOL",
          coinMinimalDenom: "sol",
          coinDecimals: 9,
          coinGeckoId: "solana",
          coinImageUrl:
            "https://assets.coingecko.com/coins/images/4128/standard/solana.png?1718769756",
        },
        new Dec(lamports)
      );
      // console.log(solBalance.toString(), "solBalance");
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
        publicKey,
        {
          programId: TOKEN_PROGRAM_ID,
        }
      );
      console.log(tokenAccounts.value, "tokenAccounts.value");
      // Extract and display balances for each token
      const tokenBalances = tokenAccounts.value.map(({ pubkey, account }) => {
        const info = account.data.parsed.info;
        const mintAddress = info.mint;
        const balance = info.tokenAmount.uiAmount;
        return { mintAddress, balance };
      });

      console.log("Token Balances:");
      tokenBalances.forEach(({ mintAddress, balance }) => {
        console.log(`- Mint: ${mintAddress}, Balance: ${balance}`);
      });
    })();
  }, [accountSol.base58Address]);
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
    // console.log(infoTokens, "infoTokens");
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
        totalPrice={(availableTotalPrice || initPrice)?.toString() || "-"}
      />

      {/*TODO:// need check again Claim reward */}
      {/* <ClaimReward /> */}
      {chainStore.isAllNetwork ||
      chainStore.current.networkType !== "cosmos" ? null : (
        <StakeView />
      )}
      <TokensCard
        dataTokens={chainStore.isAllNetwork ? allBalances : balancesByChain}
      />
    </FooterLayout>
  );
});
