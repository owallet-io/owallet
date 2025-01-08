import React, { FunctionComponent, useRef } from "react";
import { observer } from "mobx-react-lite";
import styled, { useTheme } from "styled-components";
import { Box } from "../../../components/box";
import { XAxis, YAxis } from "../../../components/axis";
import { useStore } from "../../../stores";
import { Body1, Subtitle3 } from "../../../components/typography";
import { ColorPalette } from "../../../styles";
import { Gutter } from "../../../components/gutter";
import SimpleBar from "simplebar-react";
import SimpleBarCore from "simplebar-core";
import { HeaderHeight } from "../../../layouts/header";
import { useNavigate } from "react-router";
import { TokenInfos } from "./token-info";
import { Modal } from "../../../components/modal";
import { CoinPretty, Dec, DecUtils } from "@owallet/unit";
import { AddressChip } from "../components/address-chip";
import { ReceiveModal } from "./receive-modal";
import { DenomHelper } from "@owallet/common";
import { ChainIdEVM } from "@owallet/types";
import Color from "color";
import { ChainImageFallback, CurrencyImageFallback } from "components/image";

const Styles = {
  Container: styled.div`
    height: 100vh;
    background: ${({ theme }) => {
      if (theme.mode === "light") {
        return "linear-gradient(90deg, #FCFAFF 2.44%, #FBFBFF 96.83%)";
      }
      return ColorPalette["gray-700"];
    }};

    display: flex;
    flex-direction: column;
  `,
  Header: styled.div`
    height: ${HeaderHeight};

    display: flex;
    flex-direction: column;
  `,
  Body: styled.div`
    height: calc(100vh - ${HeaderHeight});
  `,
  Balance: styled.div`
    font-weight: 500;
    font-size: 1.75rem;
    line-height: 2.125rem;
  `,
  BoxContainer: styled.div<{
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
      forChange ? "1rem 1rem 0.875rem 1rem" : "1rem 0.875rem"};
    border-radius: 0.75rem;
    margin: 0.85rem;
    border: ${({ isError }) =>
      isError
        ? `1.5px solid ${Color(ColorPalette["yellow-400"])
            .alpha(0.5)
            .toString()}`
        : undefined};

    box-shadow: ${(props) =>
      props.theme.mode === "light" && !props.isNotReady
        ? "0px 1px 4px 0px rgba(43, 39, 55, 0.10)"
        : "none"};;
    align-items: center;
  `,
};

export const TokenDetailModal: FunctionComponent<{
  close: () => void;
  chainId: string;
  coinMinimalDenom: string;
}> = observer(({ close, chainId, coinMinimalDenom }) => {
  const {
    chainStore,
    allAccountStore,
    queriesStore,
    priceStore,
    uiConfigStore,
  } = useStore();

  const theme = useTheme();

  const account = allAccountStore.getAccount(chainId) as any;
  const modularChainInfo = chainStore.getModularChain(chainId);
  const chainInfo = chainStore.getChain(chainId);
  const currency = (() => {
    if ("cosmos" in modularChainInfo) {
      return chainStore.getChain(chainId).forceFindCurrency(coinMinimalDenom);
    }

    return {
      coinMinimalDenom,
      coinDenom: coinMinimalDenom,
      coinDecimals: 0,
    };
  })();
  const denomHelper = new DenomHelper(currency.coinMinimalDenom);
  const isERC20 = denomHelper.type === "erc20";
  const isMainCurrency = (() => {
    if ("cosmos" in modularChainInfo) {
      const chainInfo = chainStore.getChain(chainId);
      return (
        (chainInfo.stakeCurrency || chainInfo.currencies[0])
          .coinMinimalDenom === currency.coinMinimalDenom
      );
    }
    return false;
  })();

  const isIBCCurrency = "paths" in currency;
  const isBtcLegacy = denomHelper.type === "legacy";
  const isBTC = chainInfo.features.includes("btc");

  const [isReceiveOpen, setIsReceiveOpen] = React.useState(false);

  const balance = (() => {
    if ("cosmos" in modularChainInfo) {
      const queryBalances = queriesStore.get(chainId).queryBalances;

      if (!isBTC) {
        return chainStore.isEvmChain(chainId) && (isMainCurrency || isERC20)
          ? queryBalances
              .getQueryEthereumHexAddress(account.ethereumHexAddress)
              .getBalance(currency)
          : queryBalances
              .getQueryBech32Address(account.bech32Address)
              .getBalance(currency);
      } else {
        if (isBtcLegacy) {
          return queryBalances
            .getQueryBtcLegacyAddress(account.btcLegacyAddress)
            .getBalance(currency);
        } else {
          return queryBalances
            .getQueryByAddress(account.addressDisplay)
            .getBalance(currency);
        }
      }
    }
  })();

  const navigate = useNavigate();

  // const querySupported = queriesStore.simpleQuery.queryGet<string[]>(
  //   process.env["KEPLR_EXT_CONFIG_SERVER"],
  //   "/tx-history/supports"
  // );

  // const isSupported: boolean = useMemo(() => {
  //   if ("cosmos" in modularChainInfo) {
  //     const chainInfo = chainStore.getChain(modularChainInfo.chainId);
  //     const map = new Map<string, boolean>();
  //     for (const chainIdentifier of querySupported.response?.data ?? []) {
  //       map.set(chainIdentifier, true);
  //     }

  //     return map.get(chainInfo.chainIdentifier) ?? false;
  //   }
  //   return false;
  // }, [chainStore, modularChainInfo, querySupported.response]);

  const buttons: {
    icon: React.ReactElement;
    text: string;
    onClick: () => void;
    disabled?: boolean;
  }[] = [
    {
      icon: (
        <svg
          width="21"
          height="20"
          viewBox="0 0 21 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M2.16669 1.66675H9.66669V9.16675H2.16669V1.66675ZM3.83335 3.33341V7.50008H8.00002V3.33341H3.83335ZM11.3334 1.66675H18.8334V9.16675H11.3334V1.66675ZM13 3.33341V7.50008H17.1667V3.33341H13ZM5.08335 4.58341H6.75335V6.25341H5.08335V4.58341ZM14.25 4.58341H15.92V6.25341H14.25V4.58341ZM11.33 10.8301H13V12.5001H11.33V10.8301ZM17.1634 10.8301H18.8334V12.5001H17.1634V10.8301ZM2.16669 10.8334H9.66669V18.3334H2.16669V10.8334ZM3.83335 12.5001V16.6667H8.00002V12.5001H3.83335ZM13.83 13.3301H15.5V14.9967H17.1667V16.6634H18.8334V18.3334H17.1634V16.6667H15.4967V15.0001H13.83V13.3301ZM5.08335 13.7501H6.75335V15.4201H5.08335V13.7501ZM11.33 16.6634H13V18.3334H11.33V16.6634Z"
            fill="#242325"
          />
        </svg>
      ),
      text: "Receive",
      onClick: () => {
        setIsReceiveOpen(true);
      },
      disabled: isIBCCurrency,
    },
    // {
    //   icon: (
    //     <svg
    //       xmlns="http://www.w3.org/2000/svg"
    //       width="20"
    //       height="20"
    //       fill="none"
    //       viewBox="0 0 20 20"
    //     >
    //       <path
    //         stroke="currentColor"
    //         strokeLinecap="round"
    //         strokeLinejoin="round"
    //         strokeWidth="1.56"
    //         d="M6.25 17.5L2.5 13.75m0 0L6.25 10M2.5 13.75h11.25m0-11.25l3.75 3.75m0 0L13.75 10m3.75-3.75H6.25"
    //       />
    //     </svg>
    //   ),
    //   text: "Swap",
    //   onClick: () => {
    //     navigate(
    //       `/ibc-swap?chainId=${chainId}&coinMinimalDenom=${coinMinimalDenom}&outChainId=${
    //         chainStore.getChain("noble").chainId
    //       }&outCoinMinimalDenom=uusdc`
    //     );
    //   },
    //   disabled: true,
    // },
    {
      icon: (
        <svg
          width="21"
          height="20"
          viewBox="0 0 21 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g clip-path="url(#clip0_3350_28316)">
            <path
              d="M0.743286 1.38745L20.5016 9.99995L0.744119 18.6133L3.78329 9.99995L0.743286 1.38745ZM5.25662 10.8333L3.58995 15.5541L16.3325 9.99995L3.58995 4.44662L5.25662 9.16662H9.66662V10.8333H5.25662Z"
              fill="#242325"
            />
          </g>
          <defs>
            <clipPath id="clip0_3350_28316">
              <rect
                width="20"
                height="20"
                fill="white"
                transform="translate(0.5)"
              />
            </clipPath>
          </defs>
        </svg>
      ),
      text: "Send",
      onClick: () => {
        if ("cosmos" in modularChainInfo) {
          if (modularChainInfo.chainId === ChainIdEVM.TRON) {
            navigate(
              `/send-tron?chainId=${chainId}&coinMinimalDenom=${coinMinimalDenom}&contractAddress=${coinMinimalDenom}`
            );
            return;
          }
          navigate(
            `/send?chainId=${chainId}&coinMinimalDenom=${coinMinimalDenom}`
          );
        }
      },
    },
  ];

  const simpleBarRef = useRef<SimpleBarCore>(null);
  // scroll to refresh
  const onScroll = () => {
    const el = simpleBarRef.current?.getContentElement();
    const scrollEl = simpleBarRef.current?.getScrollElement();
    if (el && scrollEl) {
      const rect = el.getBoundingClientRect();
      const scrollRect = scrollEl.getBoundingClientRect();

      const remainingBottomY =
        rect.y + rect.height - scrollRect.y - scrollRect.height;

      if (remainingBottomY < scrollRect.height / 10) {
      }
    }
  };

  return (
    <Styles.Container>
      <Styles.Header>
        <Box
          style={{
            flex: 1,
          }}
          alignY="center"
          paddingX="1.25rem"
        >
          <XAxis alignY="center">
            <Box
              style={{
                cursor: "pointer",
              }}
              onClick={(e) => {
                e.preventDefault();

                close();
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="1.5rem"
                height="1.5rem"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke={
                    theme.mode === "light"
                      ? ColorPalette["gray-200"]
                      : ColorPalette["gray-300"]
                  }
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M15.75 19.5L8.25 12l7.5-7.5"
                />
              </svg>
            </Box>
            <div style={{ flex: 1 }} />
            <Box
              style={{
                flex: 1,
                alignItems: "center",
                flexDirection: "row",
              }}
            >
              {/* <Body1
                as="span"
                color={
                  theme.mode === "light"
                    ? ColorPalette["gray-500"]
                    : ColorPalette["gray-200"]
                }
              >
                {(() => {
                  let denom = currency.coinDenom;
                  if ("originCurrency" in currency && currency.originCurrency) {
                    denom = currency.originCurrency.coinDenom;
                  }

                  return `${denom} on `;
                })()}
              </Body1> */}
              <ChainImageFallback chainInfo={chainInfo} size="1.1rem" />
              <Gutter size="0.375rem" />
              <Body1
                style={{
                  fontWeight: 600,
                }}
                as="span"
                color={
                  isIBCCurrency
                    ? theme.mode === "light"
                      ? ColorPalette["purple-400"]
                      : ColorPalette["white"]
                    : theme.mode === "light"
                    ? ColorPalette["gray-500"]
                    : ColorPalette["gray-200"]
                }
              >
                {modularChainInfo.chainName}
              </Body1>
            </Box>
            <div style={{ flex: 1 }} />
            <Box width="1.5rem" height="1.5rem" />
          </XAxis>
        </Box>
      </Styles.Header>
      <Styles.Body>
        <SimpleBar
          ref={simpleBarRef}
          onScroll={onScroll}
          style={{
            height: "100%",
            overflowY: "auto",
          }}
        >
          <Styles.BoxContainer>
            {!isIBCCurrency ? (
              <React.Fragment>
                <Gutter size="0.25rem" />
                <YAxis alignX="center">
                  <XAxis alignY="center">
                    <AddressChip
                      chainId={chainId}
                      address={
                        isBTC && isBtcLegacy
                          ? account.btcLegacyAddress
                          : account.addressDisplay
                      }
                    />
                    <Gutter size="0.25rem" />
                    {/* <QRCodeChip
                      onClick={() => {
                        setIsReceiveOpen(true);
                      }}
                    /> */}
                  </XAxis>
                </YAxis>
              </React.Fragment>
            ) : null}
            <Gutter size="1.375rem" />
            <Box
              style={{
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Box
                style={{
                  flex: 1,
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <CurrencyImageFallback
                  chainInfo={chainInfo}
                  currency={currency}
                  size="2rem"
                />
                <Gutter size="0.375rem" />
                <Styles.Balance
                  style={{
                    color:
                      theme.mode === "light"
                        ? ColorPalette["black"]
                        : ColorPalette["gray-10"],
                  }}
                >
                  {uiConfigStore.hideStringIfPrivacyMode(
                    balance
                      ? balance.balance
                          .maxDecimals(6)
                          .inequalitySymbol(true)
                          .shrink(true)
                          .hideIBCMetadata(true)
                          .toString()
                      : `0 ${currency.coinDenom}`,
                    4
                  )}
                </Styles.Balance>
              </Box>
              <Gutter size="0.25rem" />
              <Subtitle3 color={ColorPalette["gray-300"]}>
                {uiConfigStore.hideStringIfPrivacyMode(
                  balance
                    ? (() => {
                        const price = priceStore.calculatePrice(
                          balance.balance
                        );
                        return price ? price.toString() : "-";
                      })()
                    : "-",
                  2
                )}
              </Subtitle3>
            </Box>
            <Gutter size="1.25rem" />
            <Box
              style={{
                width: "100%",
                height: 1,
                backgroundColor: ColorPalette["gray-50"],
              }}
            />
            <Box
              style={{
                flex: 1,
                flexDirection: "row",
                justifyContent: "space-evenly",
                alignItems: "center",
              }}
            >
              {buttons.map((obj, i) => {
                return (
                  <React.Fragment key={i.toString()}>
                    {/* <CircleButton
                      text={obj.text}
                      icon={obj.icon}
                      onClick={obj.onClick}
                      disabled={obj.disabled}
                    /> */}
                    <Box>
                      <Box
                        style={{
                          cursor: "pointer",
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "center",
                        }}
                        onClick={obj.onClick}
                      >
                        <Box>{obj.icon}</Box>
                        <Gutter size="0.5rem" />
                        <Body1
                          style={{
                            color: ColorPalette["gray-400"],
                            fontWeight: 500,
                          }}
                        >
                          {obj.text}
                        </Body1>
                      </Box>
                    </Box>
                    {i < buttons.length - 1 ? (
                      <Box
                        style={{
                          width: 1,
                          height: 40,
                          backgroundColor: ColorPalette["gray-50"],
                        }}
                      />
                    ) : null}
                  </React.Fragment>
                );
              })}
            </Box>
          </Styles.BoxContainer>
          {/* 
          {(() => {
            if ("cosmos" in modularChainInfo) {
              const chainInfo = chainStore.getChain(chainId);
              if (
                chainInfo.stakeCurrency &&
                chainInfo.stakeCurrency.coinMinimalDenom ===
                  currency.coinMinimalDenom
              ) {
                return (
                  <React.Fragment>
                    <Gutter size="1.25rem" />
                    <StakedBalance chainId={chainId} />
                  </React.Fragment>
                );
              }
            }
            return null;
          })()} */}

          {(() => {
            const infos: {
              title: string;
              text: string;
              textDeco?: "green";
            }[] = [];

            if (currency.coinGeckoId) {
              const price = priceStore.calculatePrice(
                new CoinPretty(
                  currency,
                  DecUtils.getTenExponentN(currency.coinDecimals)
                )
              );
              if (price) {
                let textDeco: "green" | undefined = undefined;
                let text = price.roundTo(3).toString();

                if ("originCurrency" in currency && currency.originCurrency) {
                  infos.push({
                    title: `${currency.originCurrency.coinDenom} Price`,
                    text,
                    textDeco,
                  });
                } else {
                  infos.push({
                    title: `${currency.coinDenom} Price`,
                    text,
                    textDeco,
                  });
                }
              }
            }

            if ("paths" in currency && currency.paths.length > 0) {
              const path = currency.paths[currency.paths.length - 1];
              if (path.clientChainId) {
                const chainName = chainStore.hasChain(path.clientChainId)
                  ? chainStore.getChain(path.clientChainId).chainName
                  : path.clientChainId;
                infos.push({
                  title: "Channel",
                  text: `${chainName}/${path.channelId.replace(
                    "channel-",
                    ""
                  )}`,
                });
              }
            }

            if (infos.length === 0) {
              return null;
            }

            return (
              <React.Fragment>
                <Gutter size="1.25rem" />
                <TokenInfos title="" infos={infos} />
              </React.Fragment>
            );
          })()}

          <Gutter size="1.25rem" />
          {/* {(() => {
            if (msgHistory.pages.length === 0) {
              return (
                <Box padding="0.75rem" paddingTop="0">
                  <Box paddingX="0.375rem" marginBottom="0.5rem" marginTop="0">
                    <Box
                      width="5.125rem"
                      height="0.8125rem"
                      backgroundColor={
                        theme.mode === "light"
                          ? ColorPalette["white"]
                          : ColorPalette["gray-600"]
                      }
                    />
                  </Box>
                  <Stack gutter="0.5rem">
                    <MsgItemSkeleton />
                    <MsgItemSkeleton />
                  </Stack>
                </Box>
              );
            }

            if (msgHistory.pages.find((page) => page.error != null)) {
              return (
                <EmptyView
                  altSvg={
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="73"
                      height="73"
                      fill="none"
                      viewBox="0 0 73 73"
                    >
                      <path
                        stroke={
                          theme.mode === "light"
                            ? ColorPalette["gray-200"]
                            : ColorPalette["gray-400"]
                        }
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="6"
                        d="M46.15 49.601a13.635 13.635 0 00-9.626-4.006 13.636 13.636 0 00-9.72 4.006m37.03-13.125c0 15.11-12.249 27.357-27.358 27.357S9.12 51.585 9.12 36.476 21.367 9.12 36.476 9.12c15.11 0 27.357 12.248 27.357 27.357zm-34.197-6.839c0 1.26-.51 2.28-1.14 2.28-.63 0-1.14-1.02-1.14-2.28 0-1.26.51-2.28 1.14-2.28.63 0 1.14 1.02 1.14 2.28zm-1.14 0h.023v.046h-.023v-.046zm17.098 0c0 1.26-.51 2.28-1.14 2.28-.63 0-1.14-1.02-1.14-2.28 0-1.26.51-2.28 1.14-2.28.63 0 1.14 1.02 1.14 2.28zm-1.14 0h.023v.046h-.023v-.046z"
                      />
                    </svg>
                  }
                >
                  <Box marginX="2rem">
                    <Stack alignX="center" gutter="0.1rem">
                      <Subtitle3>Network error.</Subtitle3>
                      <Subtitle3
                        style={{
                          textAlign: "center",
                        }}
                      >
                        Please try again after a few minutes.
                      </Subtitle3>
                    </Stack>
                  </Box>
                </EmptyView>
              );
            }

            if (msgHistory.pages[0].response?.isUnsupported || !isSupported) {
              if (
                "cosmos" in modularChainInfo &&
                chainStore.getChain(chainId).embedded.embedded
              ) {
                return (
                  <EmptyView>
                    <Box marginX="2rem">
                      <Stack alignX="center" gutter="0.1rem">
                        <Subtitle3 style={{ fontWeight: 700 }}>
                          Transaction History Unavailable
                        </Subtitle3>
                        <Subtitle3
                          style={{
                            textAlign: "center",
                          }}
                        >
                          {`We're working on expanding the feature support for native chains.`}
                        </Subtitle3>
                      </Stack>
                    </Box>
                  </EmptyView>
                );
              }

              return (
                <EmptyView>
                  <Box marginX="2rem">
                    <Subtitle3>Non-native chains not supported</Subtitle3>
                  </Box>
                </EmptyView>
              );
            }

            if (msgHistory.pages[0].response?.msgs.length === 0) {
              return (
                <EmptyView>
                  <Box marginX="2rem">
                    <Subtitle3>No recent transaction history</Subtitle3>
                  </Box>
                </EmptyView>
              );
            }

            return (
              <RenderMessages
                msgHistory={msgHistory}
                targetDenom={coinMinimalDenom}
              />
            );
          })()} */}
        </SimpleBar>
      </Styles.Body>

      <Modal
        isOpen={isReceiveOpen}
        align="bottom"
        close={() => setIsReceiveOpen(false)}
      >
        <ReceiveModal chainId={chainId} close={() => setIsReceiveOpen(false)} />
      </Modal>
    </Styles.Container>
  );
});
