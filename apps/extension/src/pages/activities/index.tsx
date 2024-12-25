import React, { FunctionComponent, useEffect, useMemo, useState } from "react";
import { Box } from "../../components/box";
import { MainHeaderLayout } from "../main/layouts/header";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { usePaginatedCursorQuery } from "../main/token-detail/hook";
import { ResMsgsHistory } from "../main/token-detail/types";
import { PaginationLimit, Relations } from "../main/token-detail/constants";
import { RenderMessages } from "../main/token-detail/messages";
import { ColorPalette } from "../../styles";
import { Stack } from "../../components/stack";
import { MsgItemSkeleton } from "../main/token-detail/msg-items/skeleton";
import styled, { useTheme } from "styled-components";
import { Gutter } from "../../components/gutter";
import { Dropdown } from "../../components/dropdown";
import { EmptyView } from "../../components/empty-view";
import { H4, Subtitle3 } from "../../components/typography";
import { useGlobarSimpleBar } from "../../hooks/global-simplebar";
import { IAccountStore, IChainInfoImpl, IChainStore } from "@owallet/stores";
import { action, computed, makeObservable, observable } from "mobx";
import { Bech32Address } from "@owallet/cosmos";
import { Buffer } from "buffer/";
import {
  API,
  convertObjChainAddressToString,
  formatAddress,
  getTimeMilliSeconds,
  MapNetworkToChainId,
  unknownToken,
} from "@owallet/common";
import { useLoadingIndicator } from "../../components/loading-indicator";
import { AllNetworkItemTx } from "@owallet/types";
import { CoinPretty, Dec } from "@owallet/unit";
import moment from "moment";
import Color from "color";

class OtherBech32Addresses {
  @observable.ref
  protected supportedChainList: IChainInfoImpl[] = [];

  constructor(
    protected readonly chainStore: IChainStore,
    protected readonly accountStore: IAccountStore,
    protected readonly baseChainId: string
  ) {
    makeObservable(this);
  }

  @action
  setSupportedChainList(chainInfos: IChainInfoImpl[]) {
    this.supportedChainList = chainInfos;
  }

  @computed
  get otherBech32Addresses(): {
    chainIdentifier: string;
    bech32Address: string;
  }[] {
    const baseAddress = this.accountStore.getAccount(
      this.baseChainId
    ).bech32Address;
    if (baseAddress) {
      return this.supportedChainList
        .filter((chainInfo) => {
          return chainInfo.chainId !== this.baseChainId;
        })
        .filter((chainInfo) => {
          const baseAccount = this.accountStore.getAccount(this.baseChainId);
          const account = this.accountStore.getAccount(chainInfo.chainId);
          if (!account.bech32Address) {
            return false;
          }
          return (
            Buffer.from(
              Bech32Address.fromBech32(account.bech32Address).address
            ).toString("hex") !==
            Buffer.from(
              Bech32Address.fromBech32(baseAccount.bech32Address).address
            ).toString("hex")
          );
        })
        .map((chainInfo) => {
          const account = this.accountStore.getAccount(chainInfo.chainId);
          return {
            chainIdentifier: chainInfo.chainIdentifier,
            bech32Address: account.bech32Address,
          };
        });
    }

    return [];
  }
}

const Styles = {
  Container: styled.div<{
    forChange: boolean | undefined;
    isError: boolean;
    disabled?: boolean;
    isNotReady?: boolean;
  }>`
    display: flex;
    flex-direction: column;
    background-color: #242325;
    border-top-left-radius: 24px;
    border-top-right-radius: 24px;
    margin-right: -16px;
    margin-left: -16px;
    padding: 16px;
  `,
  Title: styled.div`
    color: #f5f5f7;
    font-size: 16px;
    font-weight: 700;
    line-height: 24px; /* 150% */
    text-transform: uppercase;
    text-align: center;
  `,
  Date: styled.div`
    color: #f5f5f7;
    text-align: center;
    font-size: 14px;
    font-weight: 600;
    line-height: 20px; /* 142.857% */
  `,
  TokenItem: styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px solid #2d2855;
    &:hover: {
      background-color: #3b3569;
      border-radius: 8px;
      padding-left: 8px;
      padding-right: 8px;
      margin-left: -8px;
      margin-right: -8px;
    }
  `,
  WrapLeftBlock: styled.div`
    display: flex;
    flex-direction: row;
    gap: 12px;
  `,
  TokenWrap: styled.div`
    width: 44px;
    height: 44px;
    border-radius: 999px;
    background-color: #2d2855;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  `,
  ChainWrap: styled.div`
    position: absolute;
    right: -3px;
    bottom: -1px;
    border-radius: 999px;
    width: 21px;
    height: 21px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #242325;
    border: 1px solid #909298;
  `,
  BodyTokenItem: styled.div`
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
  `,
  TokenTitle: styled.div`
    color: #f5f5f7;
    font-weight: 500;
    font-size: 16px;
    line-height: 24px;
  `,
  TokenSubTitle: styled.div`
    color: #afaad8;
    font-weight: 400;
    font-size: 14px;
    line-height: 20px;
  `,
  RightBlock: styled.div`
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    align-items: flex-end;
  `,
};

export const ActivitiesPage: FunctionComponent = observer(() => {
  const {
    accountStore,
    hugeQueriesStore,
    chainStore,
    priceStore,
    keyRingStore,
  } = useStore();

  const allArr = hugeQueriesStore.getAllAddrByChain;
  console.log("allArr", allArr);

  const [histories, setHistories] = useState<AllNetworkItemTx[]>([]);
  const getWalletHistory = async (addrByNetworks) => {
    try {
      const data = await API.getTxsAllNetwork({
        addrByNetworks: addrByNetworks,
        offset: 0,
        limit: 30,
      });
      setHistories(data.data);
    } catch (err) {
      console.log("getWalletHistory err", err);
    } finally {
    }
  };

  useEffect(() => {
    setHistories([]);
    const allAddress = convertObjChainAddressToString(allArr);
    if (!allAddress) return;
    getWalletHistory(allAddress);
  }, []);

  const theme = useTheme();

  const globalSimpleBar = useGlobarSimpleBar();
  useEffect(() => {
    if (globalSimpleBar.ref.current) {
      const scrollElement = globalSimpleBar.ref.current.getScrollElement();
      if (scrollElement) {
        // scroll to refresh
        const onScroll = () => {
          const el = globalSimpleBar.ref.current?.getContentElement();
          const scrollEl = globalSimpleBar.ref.current?.getScrollElement();
          if (el && scrollEl) {
            const rect = el.getBoundingClientRect();
            const scrollRect = scrollEl.getBoundingClientRect();

            const remainingBottomY =
              rect.y + rect.height - scrollRect.y - scrollRect.height;

            if (remainingBottomY < scrollRect.height / 10) {
              // Do something like load more
            }
          }
        };

        scrollElement.addEventListener("scroll", onScroll);

        return () => {
          scrollElement.removeEventListener("scroll", onScroll);
        };
      }
    }
  }, [globalSimpleBar.ref]);

  return (
    <MainHeaderLayout
      headerContainerStyle={{
        borderBottomStyle: "solid",
        borderBottomWidth: "1px",
        borderBottomColor:
          theme.mode === "light"
            ? ColorPalette["gray-100"]
            : ColorPalette["gray-500"],
      }}
    >
      <Box>
        <Styles.Container>
          <Styles.Title>Last 30 transactions</Styles.Title>
          <div>
            {histories?.length > 0 ? (
              histories.map((item, index) => {
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
                return (
                  <div
                    style={{
                      opacity: currency === unknownToken ? 0.5 : 1,
                      cursor: "pointer",
                    }}
                    key={index}
                    onClick={() => {
                      window.open(item?.explorer);
                    }}
                  >
                    {first != now || index === 0 ? (
                      <Styles.Date>{now}</Styles.Date>
                    ) : null}
                    <Styles.TokenItem>
                      <Styles.WrapLeftBlock>
                        <div>
                          <Styles.TokenWrap>
                            <img
                              style={{
                                width: 32,
                                height: 32,
                                borderRadius: 999,
                              }}
                              src={
                                currency?.coinImageUrl?.includes(
                                  "missing.png"
                                ) ||
                                !currency?.coinImageUrl ||
                                currency?.coinImageUrl?.includes("missing.svg")
                                  ? unknownToken.coinImageUrl
                                  : currency?.coinImageUrl
                              }
                            />
                            <Styles.ChainWrap>
                              <img
                                style={{
                                  width: 18,
                                  height: 18,
                                  borderRadius: 999,
                                }}
                                src={
                                  chainInfo?.chainSymbolImageUrl ||
                                  unknownToken.coinImageUrl
                                }
                              />
                            </Styles.ChainWrap>
                          </Styles.TokenWrap>
                        </div>
                        <Styles.BodyTokenItem>
                          <Styles.TokenTitle>{method}</Styles.TokenTitle>
                          <Styles.TokenSubTitle>
                            {formatAddress(item.txhash, 5)}
                          </Styles.TokenSubTitle>
                        </Styles.BodyTokenItem>
                      </Styles.WrapLeftBlock>
                      <Styles.RightBlock>
                        <Styles.TokenTitle
                          style={{
                            color: !isSent
                              ? ColorPalette["green-500"]
                              : ColorPalette["red-500"],
                          }}
                        >
                          {`${!isSent ? "+" : "-"}${amount
                            .maxDecimals(4)
                            .trim(true)
                            ?.toString()
                            .replace("-", "")}`}
                        </Styles.TokenTitle>
                        <Styles.TokenSubTitle>
                          {priceAmount?.toString().replace("-", "")}
                        </Styles.TokenSubTitle>
                      </Styles.RightBlock>
                    </Styles.TokenItem>
                  </div>
                );
              })
            ) : (
              <div
                style={{
                  height: "calc(100vh - 200px)",
                }}
              >
                <EmptyView />
              </div>
            )}
          </div>
        </Styles.Container>
      </Box>
    </MainHeaderLayout>
  );
});
