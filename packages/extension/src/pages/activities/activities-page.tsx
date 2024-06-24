import React, { useEffect, useState } from "react";
import styles from "./activities.module.scss";
import { FooterLayout } from "../../layouts/footer-layout/footer-layout";
import {
  API,
  ChainIdEnum,
  convertObjChainAddressToString,
  formatAddress,
  formatContractAddress,
  getOasisAddress,
  getTimeMilliSeconds,
  MapChainIdToNetwork,
  MapNetworkToChainId,
  unknownToken,
  urlTxHistory,
} from "@owallet/common";
import classnames from "classnames";
import { CoinPretty, Dec, PricePretty } from "@owallet/unit";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { AllNetworkItemTx } from "@owallet/types";
import moment from "moment";
// import { formatContractAddress, maskedNumber } from 'mobile/src/utils/helper';
import Colors from "../../theme/colors";
import { useLoadingIndicator } from "../../components/loading-indicator";

export const ActivitiesPage = observer(() => {
  const {
    accountStore,
    // hugeQueriesStore,
    chainStore,
    priceStore,
    keyRingStore,
  } = useStore();
  const { chainId } = chainStore.current;
  const mapChainNetwork = MapChainIdToNetwork[chainId];
  const account = accountStore.getAccount(chainId);
  const accountOrai = accountStore.getAccount(ChainIdEnum.Oraichain);
  const address = account.getAddressDisplay(
    keyRingStore.keyRingLedgerAddresses
  );
  const allArr = {
    [mapChainNetwork]:
      chainId === ChainIdEnum.OasisSapphire ||
      chainId === ChainIdEnum.OasisEmerald
        ? getOasisAddress(address)
        : address,
  };
  // chainStore.isAllNetwork
  // ? hugeQueriesStore.getAllAddrByChain
  // :
  const [histories, setHistories] = useState<AllNetworkItemTx[]>([]);
  // const [loading, setLoading] = useState(false);
  const loading = useLoadingIndicator();
  const getWalletHistory = async (addrByNetworks) => {
    try {
      loading.setIsLoading("history", true);
      const data = await API.getTxsAllNetwork({
        addrByNetworks: addrByNetworks,
        offset: 0,
        limit: 10,
      });
      setHistories(data.data);
    } catch (err) {
      console.log("getWalletHistory err", err);
    } finally {
      loading.setIsLoading("history", false);
    }
  };

  useEffect(() => {
    setHistories([]);
    const allAddress = convertObjChainAddressToString(allArr);
    if (!allAddress) return;
    getWalletHistory(allAddress);
  }, [chainId, chainStore.isAllNetwork, accountOrai.bech32Address]);
  return (
    <FooterLayout>
      <div className={styles.container}>
        <span className={styles.title}>Recent Activity</span>
        <div className={styles.listHistory}>
          {histories?.length > 0
            ? histories.map((item, index) => {
                const fiat = priceStore.defaultVsCurrency;
                console.log(item, "item");
                let currency = unknownToken;

                if (item.tokenInfos?.length > 0 && item.tokenInfos[0]) {
                  currency = {
                    coinDenom: item.tokenInfos[0]?.abbr,
                    coinImageUrl: item.tokenInfos[0]?.imgUrl,
                    coinGeckoId: item.tokenInfos[0]?.coingeckoId,
                    coinMinimalDenom: item.tokenInfos[0]?.denom,
                    coinDecimals: item.tokenInfos[0]?.decimal,
                  };
                }
                const amount =
                  item?.amount?.[0] && currency
                    ? new CoinPretty(currency, new Dec(item.amount[0]))
                    : new CoinPretty(unknownToken, new Dec("0"));
                const priceAmount = priceStore.calculatePrice(amount, fiat);
                const first =
                  index > 0 &&
                  moment(
                    getTimeMilliSeconds(histories[index - 1]?.timestamp)
                  ).format("MMM D, YYYY");
                const now = moment(getTimeMilliSeconds(item?.timestamp)).format(
                  "MMM D, YYYY"
                );
                const isSent =
                  item.userAddress?.toLowerCase() ===
                    item.fromAddress?.toLowerCase() ||
                  item.fromAddress?.toLowerCase() ===
                    item.toAddress?.toLowerCase();
                const method = isSent ? "Sent" : "Received";
                const chainInfo = chainStore.getChain(
                  MapNetworkToChainId[item.network]
                );
                const { coinDenom } = chainInfo.stakeCurrency;
                const { coinDenom: denom } = currency;
                return (
                  <div key={index} className={styles.itemHistory}>
                    <span className={styles.date}>Dec 8, 2023</span>
                    <div className={styles.tokenItem}>
                      <div className={styles.wrapLeftBlock}>
                        <div className={styles.logoTokenAndChain}>
                          <div className={styles.tokenWrap}>
                            <img
                              className={styles.token}
                              src={
                                currency?.coinImageUrl?.includes(
                                  "missing.png"
                                ) || !currency?.coinImageUrl
                                  ? unknownToken.coinImageUrl
                                  : currency?.coinImageUrl
                              }
                            />
                            <div className={styles.chainWrap}>
                              <img
                                className={styles.chain}
                                src={
                                  chainInfo?.stakeCurrency?.coinImageUrl ||
                                  unknownToken.coinImageUrl
                                }
                              />
                            </div>
                          </div>
                        </div>
                        <div className={styles.bodyTokenItem}>
                          <span className={styles.title}>{method}</span>
                          <span className={styles.subTitle}>
                            {formatContractAddress(item.txhash)}
                          </span>
                        </div>
                      </div>
                      <div className={styles.rightBlock}>
                        <span
                          style={{
                            color: !isSent
                              ? Colors["success-text-body"]
                              : Colors["error-text-body"],
                          }}
                          className={styles.title}
                        >
                          {`${!isSent ? "+" : "-"}${amount
                            .maxDecimals(4)
                            .trim(true)
                            ?.toString()
                            .replace("-", "")}`}
                        </span>
                        <span className={styles.subTitle}>
                          {priceAmount?.toString().replace("-", "")}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            : null}
        </div>
      </div>
    </FooterLayout>
  );
});
