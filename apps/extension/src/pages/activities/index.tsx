import React, { FunctionComponent, useEffect, useState } from "react";
import { Box } from "../../components/box";
import { MainHeaderLayout } from "../main/layouts/header";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { ColorPalette } from "../../styles";
import { Stack } from "../../components/stack";
import styled, { css, useTheme } from "styled-components";
import { Gutter } from "../../components/gutter";
import { EmptyView } from "../../components/empty-view";
import { Caption1, Subtitle2, Subtitle3 } from "../../components/typography";
import { useGlobarSimpleBar } from "../../hooks/global-simplebar";
import { IAccountStore, IChainInfoImpl, IChainStore } from "@owallet/stores";
import { action, computed, makeObservable, observable } from "mobx";
import { Bech32Address } from "@owallet/cosmos";
import { Buffer } from "buffer/";
import {
  API,
  ChainIdEnum,
  convertObjChainAddressToString,
  formatAddress,
  getTimeMilliSeconds,
  MapNetworkToChainId,
  unknownToken,
} from "@owallet/common";
import { AllNetworkItemTx } from "@owallet/types";
import { CoinPretty, Dec } from "@owallet/unit";
import moment from "moment";
import Color from "color";
import { FormattedMessage } from "react-intl";
import {
  ChainImageFallback,
  CurrencyImageFallback,
} from "../../components/image";
import { Skeleton } from "../../components/skeleton";
import { Column, Columns } from "../../components/column";
import { XAxis } from "../../components/axis";

export const useIsNotReady = () => {
  const { chainStore, queriesStore } = useStore();

  const query = queriesStore.get(chainStore.chainInfos[0].chainId).cosmos
    .queryRPCStatus;

  return query.response == null && query.error == null;
};
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
  Container: styled.div<{ isNotReady?: boolean }>`
    background-color: ${(props) =>
      props.theme.mode === "light"
        ? props.isNotReady
          ? ColorPalette["skeleton-layer-0"]
          : ColorPalette.white
        : ColorPalette["gray-650"]};

    box-shadow: ${(props) =>
      props.theme.mode === "light" && !props.isNotReady
        ? "0px 1px 4px 0px rgba(43, 39, 55, 0.10)"
        : "none"};
    padding: 0.75rem;
    border-radius: 0.375rem;
  `,
  TokenContainer: styled.div<{
    forChange: boolean | undefined;
    isError: boolean;
    disabled?: boolean;
    isNotReady?: boolean;
  }>`
    background-color: ${(props) =>
      props.theme.mode === "light"
        ? props.isNotReady
          ? ColorPalette["skeleton-layer-0"]
          : ColorPalette.white
        : ColorPalette["gray-650"]};
    padding ${({ forChange }) =>
      forChange ? "0.875rem 0.25rem 0.875rem 1rem" : "1rem 0rem"};
    cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
    
    border: ${({ isError }) =>
      isError
        ? `1.5px solid ${Color(ColorPalette["yellow-400"])
            .alpha(0.5)
            .toString()}`
        : undefined};

    border-bottom: 1px solid ${ColorPalette["gray-50"]};

    ${({ disabled, theme }) => {
      if (!disabled) {
        return css`
          &:hover {
            background-color: ${theme.mode === "light"
              ? ColorPalette["gray-10"]
              : ColorPalette["gray-400"]};
          }
        `;
      }
    }}
    
  `,

  Title: styled.div`
    color: ${(props) =>
      props.theme.mode === "light"
        ? props.isNotReady
          ? ColorPalette["skeleton-layer-0"]
          : ColorPalette["gray-650"]
        : ColorPalette["gray-650"]};
    font-size: 16px;
    font-weight: 700;
    line-height: 24px; /* 150% */
    text-transform: uppercase;
    text-align: center;
  `,
  Date: styled.div`
    color: ${(props) =>
      props.theme.mode === "light"
        ? props.isNotReady
          ? ColorPalette["skeleton-layer-0"]
          : ColorPalette["gray-450"]
        : ColorPalette["gray-650"]};
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
  const account = accountStore.getAccount(ChainIdEnum.Oraichain);
  const isNotReady = useIsNotReady();

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
  }, [account.bech32Address]);

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
    <MainHeaderLayout>
      <Box paddingX="0.75rem" paddingBottom="1.5rem">
        <Stack gutter="0.75rem">
          <Styles.Container>
            <Styles.Title>Last 30 transactions</Styles.Title>
            <div>
              {histories?.length > 0 ? (
                histories.map((item, index) => {
                  const fiat = priceStore.defaultVsCurrency;
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
                  const now = moment(
                    getTimeMilliSeconds(item?.timestamp)
                  ).format("MMM D, YYYY");
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

                      <Styles.TokenContainer isNotReady={isNotReady}>
                        <Columns sum={1} gutter="0.5rem" alignY="center">
                          <Skeleton
                            type="circle"
                            layer={1}
                            isNotReady={isNotReady}
                          >
                            <CurrencyImageFallback
                              chainInfo={chainInfo}
                              currency={currency}
                              size="2rem"
                            />
                            <Box
                              style={{
                                position: "absolute",
                                right: -10,
                                bottom: -6,
                                borderWidth: 1,
                                borderColor: ColorPalette["black"],
                              }}
                            >
                              <ChainImageFallback
                                chainInfo={chainInfo}
                                size="1.1rem"
                              />
                            </Box>
                          </Skeleton>

                          <Gutter size="0.75rem" />

                          <Stack gutter="0.25rem">
                            <XAxis alignY="center">
                              <Skeleton
                                layer={1}
                                isNotReady={isNotReady}
                                dummyMinWidth="3.25rem"
                              >
                                <Subtitle2
                                  color={
                                    theme.mode === "light"
                                      ? ColorPalette["gray-700"]
                                      : ColorPalette["gray-10"]
                                  }
                                  style={{
                                    wordBreak: "break-all",
                                  }}
                                >
                                  {method}
                                </Subtitle2>
                              </Skeleton>
                            </XAxis>
                            <XAxis alignY="center">
                              <Skeleton
                                layer={1}
                                isNotReady={isNotReady}
                                dummyMinWidth="4.5rem"
                              >
                                <Caption1
                                  style={{ color: ColorPalette["gray-300"] }}
                                >
                                  {formatAddress(item.txhash, 5)}
                                </Caption1>
                              </Skeleton>
                            </XAxis>
                          </Stack>

                          <Column weight={1} />

                          <Columns sum={1} gutter="0.25rem" alignY="center">
                            <Stack gutter="0.25rem" alignX="right">
                              <Skeleton
                                layer={1}
                                isNotReady={isNotReady}
                                dummyMinWidth="4.5rem"
                              >
                                <Subtitle3 color={ColorPalette["gray-300"]}>
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
                                </Subtitle3>
                              </Skeleton>
                              <Styles.TokenSubTitle>
                                {priceAmount?.toString().replace("-", "")}
                              </Styles.TokenSubTitle>
                            </Stack>
                          </Columns>
                        </Columns>
                      </Styles.TokenContainer>
                    </div>
                  );
                })
              ) : (
                <Box marginY="2rem">
                  <EmptyView>
                    <Stack alignX="center" gutter="0.1rem">
                      <Subtitle3 style={{ fontWeight: 700 }}>
                        <FormattedMessage id="page.main.available.search-empty-view-title" />
                      </Subtitle3>
                      <Subtitle3>
                        <FormattedMessage id="page.main.available.search-empty-view-paragraph" />
                      </Subtitle3>
                    </Stack>
                  </EmptyView>
                </Box>
              )}
            </div>
          </Styles.Container>
        </Stack>
      </Box>
    </MainHeaderLayout>
  );
});
