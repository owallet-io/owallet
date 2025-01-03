import React, {
  FunctionComponent,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import {
  Buttons,
  ClaimAll,
  CopyAddress,
  IBCTransferView,
  StakeWithKeplrDashboardButton,
  UpdateNoteModal,
  UpdateNotePageData,
} from "./components";
import { Stack } from "../../components/stack";
import { CoinPretty, PricePretty } from "@owallet/unit";
import {
  ArrowDownIcon,
  ArrowTopRightOnSquareIcon,
} from "../../components/icon";
import { Box } from "../../components/box";
import { Modal } from "../../components/modal";
import { Gutter } from "../../components/gutter";
import { Toggle } from "../../components/toggle";
import {
  Caption2,
  H1,
  Subtitle3,
  Subtitle1,
  Subtitle4,
} from "../../components/typography";
import { ColorPalette, SidePanelMaxWidth } from "../../styles";
import { AvailableTabView } from "./available";
import { StakedTabView } from "./staked";
import { SearchTextInput } from "../../components/input";
import { animated, useSpringValue, easings } from "@react-spring/web";
import { defaultSpringConfig } from "../../styles/spring";
import { IChainInfoImpl, QueryError } from "@owallet/stores";
import { Skeleton } from "../../components/skeleton";
import { FormattedMessage, useIntl } from "react-intl";
import { useGlobarSimpleBar } from "../../hooks/global-simplebar";
import styled, { useTheme } from "styled-components";
import { IbcHistoryView } from "./components/ibc-history-view";
import { XAxis, YAxis } from "../../components/axis";
import { DepositModal } from "./components/deposit-modal";
import { MainHeaderLayout, MainHeaderLayoutRef } from "./layouts/header";
import { amountToAmbiguousAverage, isRunningInSidePanel } from "../../utils";
import { InExtensionMessageRequester } from "@owallet/router-extension";
import {
  ChainInfoWithCoreTypes,
  LogAnalyticsEventMsg,
} from "@owallet/background";
import { BACKGROUND_PORT } from "@owallet/router";
import { BottomTabsHeightRem } from "../../bottom-tabs";
import { DenomHelper } from "@owallet/common";
import { NewSidePanelHeaderTop } from "./new-side-panel-header-top";
import { ModularChainInfo } from "@owallet/types";
import Color from "color";
import { DoubleSortIcon } from "components/icon/double-sort";
import { useNavigate } from "react-router";

export interface ViewToken {
  token: CoinPretty;
  chainInfo: IChainInfoImpl | ModularChainInfo;
  isFetching: boolean;
  error: QueryError<any> | undefined;
}

const StylesCustom = {
  Container: styled.div<{
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
      forChange ? "0.875rem 0.25rem 0.875rem 1rem" : "1rem 0.875rem"};
    border-radius: 0.375rem;
    
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
    
  `,
};

export const useIsNotReady = () => {
  const { chainStore, queriesStore } = useStore();

  const query = queriesStore.get(chainStore.chainInfos[0].chainId).cosmos
    .queryRPCStatus;

  return query.response == null && query.error == null;
};

type TabStatus = "available" | "staked";

export const MainPage: FunctionComponent<{
  setIsNotReady: (isNotReady: boolean) => void;
}> = observer(({ setIsNotReady }) => {
  const {
    analyticsStore,
    hugeQueriesStore,
    uiConfigStore,
    keyRingStore,
    priceStore,
  } = useStore();

  const isNotReady = useIsNotReady();
  const intl = useIntl();
  const theme = useTheme();
  const navigate = useNavigate();

  const setIsNotReadyRef = useRef(setIsNotReady);
  setIsNotReadyRef.current = setIsNotReady;
  useLayoutEffect(() => {
    setIsNotReadyRef.current(isNotReady);
  }, [isNotReady]);

  const [tabStatus, setTabStatus] = React.useState<TabStatus>("available");

  const availableTotalPrice = useMemo(() => {
    // Need to fill the price with the selected chain
    let result: PricePretty | undefined;
    for (const bal of hugeQueriesStore.allKnownBalances) {
      if (uiConfigStore.currentNetwork === "all") {
        if (bal.price) {
          if (!result) {
            result = bal.price;
          } else {
            result = result.add(bal.price);
          }
        }
      } else {
        if (bal.chainInfo.chainId === uiConfigStore.currentNetwork) {
          if (bal.price) {
            if (!result) {
              result = bal.price;
            } else {
              result = result.add(bal.price);
            }
          }
        }
      }
    }
    return result;
  }, [hugeQueriesStore.allKnownBalances, uiConfigStore.currentNetwork]);

  const availableTotalPriceEmbedOnlyUSD = useMemo(() => {
    let result: PricePretty | undefined;
    for (const bal of hugeQueriesStore.allKnownBalances) {
      if (!("currencies" in bal.chainInfo)) {
        continue;
      }
      if (!(bal.chainInfo.embedded as ChainInfoWithCoreTypes).embedded) {
        continue;
      }
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

  const stakedTotalPrice = useMemo(() => {
    let result: PricePretty | undefined;
    for (const bal of hugeQueriesStore.delegations) {
      if (uiConfigStore.currentNetwork === "all") {
        if (bal.price) {
          if (!result) {
            result = bal.price;
          } else {
            result = result.add(bal.price);
          }
        }
      } else {
        if (bal.chainInfo.chainId === uiConfigStore.currentNetwork) {
          if (bal.price) {
            if (!result) {
              result = bal.price;
            } else {
              result = result.add(bal.price);
            }
          }
        }
      }
    }

    for (const bal of hugeQueriesStore.unbondings) {
      if (uiConfigStore.currentNetwork === "all") {
        if (bal.viewToken.price) {
          if (!result) {
            result = bal.viewToken.price;
          } else {
            result = result.add(bal.viewToken.price);
          }
        }
      } else {
        if (bal.viewToken.chainInfo.chainId === uiConfigStore.currentNetwork) {
          if (bal.viewToken.price) {
            if (!result) {
              result = bal.viewToken.price;
            } else {
              result = result.add(bal.viewToken.price);
            }
          }
        }
      }
    }
    return result;
  }, [
    hugeQueriesStore.delegations,
    hugeQueriesStore.unbondings,
    uiConfigStore.currentNetwork,
  ]);

  const stakedTotalPriceEmbedOnlyUSD = useMemo(() => {
    let result: PricePretty | undefined;
    for (const bal of hugeQueriesStore.delegations) {
      if (!("currencies" in bal.chainInfo)) {
        continue;
      }
      if (!(bal.chainInfo.embedded as ChainInfoWithCoreTypes).embedded) {
        continue;
      }
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
    for (const bal of hugeQueriesStore.unbondings) {
      if (!("currencies" in bal.viewToken.chainInfo)) {
        continue;
      }
      if (
        !(bal.viewToken.chainInfo.embedded as ChainInfoWithCoreTypes).embedded
      ) {
        continue;
      }
      if (bal.viewToken.price) {
        const price = priceStore.calculatePrice(bal.viewToken.token, "usd");
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
  }, [hugeQueriesStore.delegations, hugeQueriesStore.unbondings, priceStore]);

  const lastTotalAvailableAmbiguousAvg = useRef(-1);
  const lastTotalStakedAmbiguousAvg = useRef(-1);
  useEffect(() => {
    if (!isNotReady) {
      const totalAvailableAmbiguousAvg = availableTotalPriceEmbedOnlyUSD
        ? amountToAmbiguousAverage(availableTotalPriceEmbedOnlyUSD)
        : 0;
      const totalStakedAmbiguousAvg = stakedTotalPriceEmbedOnlyUSD
        ? amountToAmbiguousAverage(stakedTotalPriceEmbedOnlyUSD)
        : 0;
      if (
        lastTotalAvailableAmbiguousAvg.current !== totalAvailableAmbiguousAvg ||
        lastTotalStakedAmbiguousAvg.current !== totalStakedAmbiguousAvg
      ) {
        new InExtensionMessageRequester().sendMessage(
          BACKGROUND_PORT,
          new LogAnalyticsEventMsg("user_properties", {
            totalAvailableFiatAvg: totalAvailableAmbiguousAvg,
            totalStakedFiatAvg: totalStakedAmbiguousAvg,
            id: keyRingStore.selectedKeyInfo?.id,
            keyType: keyRingStore.selectedKeyInfo?.insensitive[
              "keyRingType"
            ] as string | undefined,
          })
        );
      }
      lastTotalAvailableAmbiguousAvg.current = totalAvailableAmbiguousAvg;
      lastTotalStakedAmbiguousAvg.current = totalStakedAmbiguousAvg;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    availableTotalPriceEmbedOnlyUSD,
    isNotReady,
    stakedTotalPriceEmbedOnlyUSD,
  ]);

  const [isOpenDepositModal, setIsOpenDepositModal] = React.useState(false);

  const searchRef = useRef<HTMLInputElement | null>(null);
  const [search, setSearch] = useState("");
  const [isEnteredSearch, setIsEnteredSearch] = useState(false);
  useEffect(() => {
    // Give focus whenever available tab is selected.
    if (!isNotReady && tabStatus === "available") {
      // And clear search text.
      setSearch("");

      if (searchRef.current) {
        searchRef.current.focus({
          preventScroll: true,
        });
      }
    }
  }, [tabStatus, isNotReady]);
  useEffect(() => {
    // Log if a search term is entered at least once.
    if (isEnteredSearch) {
      analyticsStore.logEvent("input_searchAssetOrChain", {
        pageName: "main",
      });
    }
  }, [analyticsStore, isEnteredSearch]);
  useEffect(() => {
    // Log a search term with delay.
    const handler = setTimeout(() => {
      if (isEnteredSearch && search) {
        analyticsStore.logEvent("input_searchAssetOrChain", {
          inputValue: search,
          pageName: "main",
        });
      }
    }, 1000);

    return () => {
      clearTimeout(handler);
    };
  }, [analyticsStore, search, isEnteredSearch]);

  const searchScrollAnim = useSpringValue(0, {
    config: defaultSpringConfig,
  });
  const globalSimpleBar = useGlobarSimpleBar();

  const animatedPrivacyModeHover = useSpringValue(0, {
    config: defaultSpringConfig,
  });

  const [isChangelogModalOpen, setIsChangelogModalOpen] = useState(false);
  useEffect(() => {
    if (uiConfigStore.changelogConfig.showingInfo.length > 0) {
      setIsChangelogModalOpen(true);
    }
  }, [uiConfigStore.changelogConfig.showingInfo.length]);

  const [isRefreshButtonVisible, setIsRefreshButtonVisible] = useState(false);
  const [isRefreshButtonLoading, setIsRefreshButtonLoading] = useState(false);
  const forcePreventScrollRefreshButtonVisible = useRef(false);
  useEffect(() => {
    if (!isRunningInSidePanel()) {
      return;
    }

    const scrollElement = globalSimpleBar.ref.current?.getScrollElement();
    if (scrollElement) {
      let lastScrollTop = 0;
      let lastScrollTime = Date.now();
      const listener = (e: Event) => {
        if (e.target) {
          const { scrollTop } = e.target as HTMLDivElement;

          const gap = scrollTop - lastScrollTop;
          if (gap > 0) {
            setIsRefreshButtonVisible(false);
          } else if (gap < 0) {
            if (!forcePreventScrollRefreshButtonVisible.current) {
              setIsRefreshButtonVisible(true);
            }
          }

          lastScrollTop = scrollTop;
          lastScrollTime = Date.now();
        }
      };
      scrollElement.addEventListener("scroll", listener);

      const interval = setInterval(() => {
        if (lastScrollTop <= 10) {
          if (Date.now() - lastScrollTime >= 5000) {
            if (!forcePreventScrollRefreshButtonVisible.current) {
              setIsRefreshButtonVisible(true);
            } else {
              lastScrollTime = Date.now();
            }
          }
        }
      }, 1000);

      return () => {
        scrollElement.removeEventListener("scroll", listener);
        clearInterval(interval);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const mainHeaderLayoutRef = useRef<MainHeaderLayoutRef | null>(null);
  const name = keyRingStore.selectedKeyInfo?.name || "OWallet Account";

  return (
    <MainHeaderLayout
      ref={mainHeaderLayoutRef}
      isNotReady={isNotReady}
      fixedTop={(() => {
        if (isNotReady) {
          return;
        }

        if (uiConfigStore.showNewSidePanelHeaderTop) {
          return {
            height: "3rem",
            element: (
              <NewSidePanelHeaderTop
                onClick={() => {
                  uiConfigStore.setShowNewSidePanelHeaderTop(false);

                  if (mainHeaderLayoutRef.current) {
                    mainHeaderLayoutRef.current.openSideMenu();
                  }
                }}
                onCloseClick={() => {
                  uiConfigStore.setShowNewSidePanelHeaderTop(false);
                }}
              />
            ),
          };
        }
      })()}
    >
      <RefreshButton
        visible={
          !isNotReady &&
          isRunningInSidePanel() &&
          (isRefreshButtonVisible || isRefreshButtonLoading)
        }
        onSetIsLoading={(isLoading) => {
          setIsRefreshButtonLoading(isLoading);
        }}
      />

      <Box paddingX="0.75rem" paddingBottom="1.5rem">
        <Stack gutter="0.75rem">
          <Styles.Container isNotReady={isNotReady}>
            <Box
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingBottom: "1rem",
                cursor: "pointer",
              }}
            >
              <Box
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                }}
                onClick={() => {
                  navigate("/wallet/select");
                }}
              >
                <img
                  width={24}
                  height={24}
                  style={{
                    borderRadius: 999,
                  }}
                  src={require("assets/images/default-avatar.png")}
                />
                <Gutter size="0.5rem" />
                <Subtitle1>{name}</Subtitle1>
                <Gutter size="0.5rem" />
                <ArrowDownIcon
                  width="1.25rem"
                  height="1.25rem"
                  color={ColorPalette["gray-300"]}
                />
              </Box>
              <CopyAddress
                onClick={() => {
                  analyticsStore.logEvent("click_copyAddress");
                  setIsOpenDepositModal(true);
                }}
                isNotReady={isNotReady}
              />
            </Box>
            <Box
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
              }}
              position="relative"
            >
              <Box
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  justifyContent: "flex-start",
                }}
              >
                <Box
                  alignX={isNotReady ? "center" : undefined}
                  onHoverStateChange={(isHover) => {
                    if (!isNotReady) {
                      animatedPrivacyModeHover.start(isHover ? 1 : 0);
                    } else {
                      animatedPrivacyModeHover.set(0);
                    }
                  }}
                >
                  <Skeleton isNotReady={isNotReady}>
                    <YAxis alignX="center">
                      <XAxis alignY="center">
                        <Subtitle3
                          style={{
                            color: ColorPalette["gray-300"],
                            cursor: "pointer",
                          }}
                          onClick={(e) => {
                            e.preventDefault();
                            if (tabStatus === "available") {
                              setTabStatus("staked" as TabStatus);
                            } else {
                              setTabStatus("available" as TabStatus);
                            }
                          }}
                        >
                          {tabStatus === "available"
                            ? intl.formatMessage({
                                id: "page.main.chart.available",
                              })
                            : intl.formatMessage({
                                id: "page.main.chart.staked",
                              })}
                        </Subtitle3>
                        <div
                          style={{
                            cursor: "pointer",
                            opacity: 1,
                            marginTop: "4px",
                          }}
                          onClick={(e) => {
                            e.preventDefault();
                            if (tabStatus === "available") {
                              setTabStatus("staked" as TabStatus);
                            } else {
                              setTabStatus("available" as TabStatus);
                            }
                          }}
                        >
                          <DoubleSortIcon width="1rem" height="1rem" />
                        </div>
                        {/* <animated.div
                          style={{
                            position: "relative",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            height: "1px",
                            overflowX: "clip",
                            width: animatedPrivacyModeHover.to(
                              (v) => `${v * 1.25}rem`
                            ),
                          }}
                        >
                          <Styles.PrivacyModeButton
                            as={animated.div}
                            style={{
                              position: "absolute",
                              right: 0,
                              cursor: "pointer",
                              opacity: animatedPrivacyModeHover.to((v) =>
                                Math.max(0, (v - 0.3) * (10 / 3))
                              ),
                              marginTop: "2px",
                            }}
                            onClick={(e) => {
                              e.preventDefault();
                              if (tabStatus === "available") {
                                setTabStatus("staked" as TabStatus);
                              } else {
                                setTabStatus("available" as TabStatus);
                              }
                            }}
                          >
                            <DoubleSortIcon width="1rem" height="1rem" />
                          </Styles.PrivacyModeButton>
                        </animated.div> */}
                      </XAxis>
                    </YAxis>
                  </Skeleton>
                  <Gutter size="0.5rem" />
                  <Skeleton isNotReady={isNotReady} dummyMinWidth="8.125rem">
                    <H1
                      style={{
                        cursor: "pointer",
                        color:
                          theme.mode === "light"
                            ? ColorPalette["gray-700"]
                            : ColorPalette["gray-10"],
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        uiConfigStore.toggleIsPrivacyMode();
                      }}
                    >
                      {uiConfigStore.hideStringIfPrivacyMode(
                        tabStatus === "available"
                          ? availableTotalPrice?.toString() || "-"
                          : stakedTotalPrice?.toString() || "-",
                        4
                      )}
                    </H1>
                  </Skeleton>
                </Box>
              </Box>
            </Box>
            <Gutter size="1rem" />
            {tabStatus === "available" ? (
              <Buttons
                onClickDeposit={() => {
                  setIsOpenDepositModal(true);
                  analyticsStore.logEvent("click_deposit");
                }}
                onClickBuy={() => {}}
                isNotReady={isNotReady}
              />
            ) : null}
            {tabStatus === "staked" && !isNotReady ? (
              <StakeWithKeplrDashboardButton
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  analyticsStore.logEvent("click_owalletDashboard", {
                    tabName: tabStatus,
                  });

                  browser.tabs.create({
                    url: "https://owallet.io/staking",
                  });
                }}
              >
                <FormattedMessage id="page.main.chart.stake-with-keplr-dashboard-button" />
                <Box color={ColorPalette["gray-300"]} marginLeft="0.5rem">
                  <ArrowTopRightOnSquareIcon width="1rem" height="1rem" />
                </Box>
              </StakeWithKeplrDashboardButton>
            ) : null}
          </Styles.Container>

          <ClaimAll isNotReady={isNotReady} />

          <IbcHistoryView isNotReady={isNotReady} />

          <Gutter size="0" />

          {tabStatus === "available" ? (
            <StylesCustom.Container>
              {!isNotReady ? (
                <Stack>
                  {tabStatus === "available" ? (
                    <Box
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        paddingBottom: "1.5rem",
                      }}
                    >
                      <Box
                        style={{
                          width: "65%",
                        }}
                      >
                        <SearchTextInput
                          ref={searchRef}
                          value={search}
                          onChange={(e) => {
                            e.preventDefault();

                            setSearch(e.target.value);

                            if (e.target.value.trim().length > 0) {
                              if (!isEnteredSearch) {
                                setIsEnteredSearch(true);
                              }

                              const simpleBarScrollRef =
                                globalSimpleBar.ref.current?.getScrollElement();
                              if (
                                simpleBarScrollRef &&
                                simpleBarScrollRef.scrollTop < 218
                              ) {
                                searchScrollAnim.start(218, {
                                  from: simpleBarScrollRef.scrollTop,
                                  onChange: (anim: any) => {
                                    const v =
                                      anim.value != null ? anim.value : anim;
                                    if (typeof v === "number") {
                                      simpleBarScrollRef.scrollTop = v;
                                    }
                                  },
                                });
                              }
                            }
                          }}
                          placeholder={intl.formatMessage({
                            id: "page.main.search-placeholder",
                          })}
                        />
                      </Box>
                      <React.Fragment>
                        <Caption2
                          onClick={() => {
                            uiConfigStore.setHideLowBalance(
                              !uiConfigStore.isHideLowBalance
                            );
                          }}
                          color={ColorPalette["gray-300"]}
                        >
                          <FormattedMessage id="page.main.available.hide-low-balance" />
                        </Caption2>

                        <Toggle
                          height={16}
                          width={32}
                          isOpen={uiConfigStore.isHideLowBalance}
                          setIsOpen={() => {
                            uiConfigStore.setHideLowBalance(
                              !uiConfigStore.isHideLowBalance
                            );
                          }}
                        />
                      </React.Fragment>
                    </Box>
                  ) : null}
                </Stack>
              ) : null}
              <AvailableTabView
                search={search}
                isNotReady={isNotReady}
                onClickGetStarted={() => {
                  setIsOpenDepositModal(true);
                }}
                onMoreTokensClosed={() => {
                  forcePreventScrollRefreshButtonVisible.current = true;
                  setTimeout(() => {
                    forcePreventScrollRefreshButtonVisible.current = false;
                  }, 1500);
                }}
              />
            </StylesCustom.Container>
          ) : (
            <StylesCustom.Container>
              <StakedTabView
                onMoreTokensClosed={() => {
                  forcePreventScrollRefreshButtonVisible.current = true;
                  setTimeout(() => {
                    forcePreventScrollRefreshButtonVisible.current = false;
                  }, 1500);
                }}
              />
            </StylesCustom.Container>
          )}

          {tabStatus === "available" &&
          uiConfigStore.isDeveloper &&
          !isNotReady ? (
            <IBCTransferView />
          ) : null}
        </Stack>
      </Box>

      <Modal
        isOpen={isOpenDepositModal}
        align="bottom"
        close={() => setIsOpenDepositModal(false)}
        forceNotUseSimplebar={true}
      >
        <DepositModal close={() => setIsOpenDepositModal(false)} />
      </Modal>

      <Modal
        isOpen={isChangelogModalOpen}
        close={() => {
          // setIsChangelogModalOpen(false);
        }}
        onCloseTransitionEnd={() => {
          uiConfigStore.changelogConfig.clearLastInfo();
        }}
        align="center"
      >
        <UpdateNoteModal
          close={() => {
            setIsChangelogModalOpen(false);
          }}
          updateNotePageData={(() => {
            const res: UpdateNotePageData[] = [];
            for (const info of uiConfigStore.changelogConfig.showingInfo) {
              for (const scene of info.scenes) {
                res.push({
                  title: scene.title,
                  image:
                    scene.image && scene.aspectRatio
                      ? {
                          default: scene.image.default,
                          light: scene.image.light,
                          aspectRatio: scene.aspectRatio,
                        }
                      : undefined,
                  paragraph: scene.paragraph,
                  isSidePanelBeta: info.isSidePanelBeta,
                });
              }
            }

            return res;
          })()}
        />
      </Modal>
    </MainHeaderLayout>
  );
});

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
  PrivacyModeButton: styled.div`
    color: ${(props) =>
      props.theme.mode === "light"
        ? ColorPalette["gray-300"]
        : ColorPalette["gray-400"]};

    &:hover {
      color: ${(props) =>
        props.theme.mode === "light"
          ? ColorPalette["gray-200"]
          : ColorPalette["gray-300"]};
    }
  `,
};

const visibleTranslateY = -40;
const invisibleTranslateY = 100;
const RefreshButton: FunctionComponent<{
  visible: boolean;

  onSetIsLoading: (isLoading: boolean) => void;
}> = observer(({ visible, onSetIsLoading }) => {
  const { chainStore, queriesStore, accountStore, priceStore } = useStore();

  const theme = useTheme();

  const translateY = useSpringValue(
    visible ? visibleTranslateY : invisibleTranslateY,
    {
      config: defaultSpringConfig,
    }
  );
  useEffect(() => {
    translateY.start(visible ? visibleTranslateY : invisibleTranslateY);
  }, [translateY, visible]);

  const onSetIsLoadingRef = useRef(onSetIsLoading);
  onSetIsLoadingRef.current = onSetIsLoading;

  const [isLoading, _setIsLoading] = useState(false);
  const setIsLoading = (isLoading: boolean) => {
    _setIsLoading(isLoading);
    onSetIsLoadingRef.current(isLoading);
  };

  const refresh = async () => {
    if (isLoading) {
      return;
    }

    setIsLoading(true);

    try {
      const promises: Promise<unknown>[] = [];

      promises.push(priceStore.waitFreshResponse());
      for (const modularChainInfo of chainStore.modularChainInfosInUI) {
        if ("cosmos" in modularChainInfo) {
          const chainInfo = chainStore.getChain(modularChainInfo.chainId);
          const account = accountStore.getAccount(chainInfo.chainId);

          if (
            !chainStore.isEvmChain(chainInfo.chainId) &&
            account.bech32Address !== ""
          ) {
            const queries = queriesStore.get(chainInfo.chainId);
            const queryBalance = queries.queryBalances.getQueryBech32Address(
              account.bech32Address
            );
            const queryRewards =
              queries.cosmos.queryRewards.getQueryBech32Address(
                account.bech32Address
              );
            queryBalance.fetch();

            promises.push(queryRewards.waitFreshResponse());
          }

          if (
            chainStore.isEvmChain(chainInfo.chainId) &&
            account.ethereumHexAddress
          ) {
            const queries = queriesStore.get(chainInfo.chainId);
            const queryBalance =
              queries.queryBalances.getQueryEthereumHexAddress(
                account.ethereumHexAddress
              );
            queryBalance.fetch();

            for (const currency of chainInfo.currencies) {
              const query = queriesStore
                .get(chainInfo.chainId)
                .queryBalances.getQueryEthereumHexAddress(
                  account.ethereumHexAddress
                );

              const denomHelper = new DenomHelper(currency.coinMinimalDenom);
              if (denomHelper.type === "erc20") {
                query.fetch();
              }
            }
          }
        }
      }

      for (const chainInfo of chainStore.chainInfosInUI) {
        const account = accountStore.getAccount(chainInfo.chainId);

        if (account.bech32Address === "") {
          continue;
        }
        const queries = queriesStore.get(chainInfo.chainId);
        const queryUnbonding =
          queries.cosmos.queryUnbondingDelegations.getQueryBech32Address(
            account.bech32Address
          );
        const queryDelegation =
          queries.cosmos.queryDelegations.getQueryBech32Address(
            account.bech32Address
          );

        promises.push(queryUnbonding.waitFreshResponse());
        promises.push(queryDelegation.waitFreshResponse());
      }

      await Promise.all([
        Promise.all(promises),
        new Promise((resolve) => setTimeout(resolve, 2000)),
      ]);
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoading(false);
    }
  };

  const rotate = useSpringValue(0, {
    config: {
      duration: 1250,
      easing: easings.linear,
    },
  });
  const isLoadingRef = useRef(isLoading);
  isLoadingRef.current = isLoading;
  const prevIsLoading = useRef(isLoading);
  useEffect(() => {
    if (prevIsLoading.current !== isLoading && isLoading) {
      if (isLoading) {
        const onRest = () => {
          if (isLoadingRef.current) {
            rotate.start(360, {
              from: 0,
              onRest,
            });
          }
        };

        rotate.start(360, {
          from: 0,
          onRest,
        });
      }
    }

    prevIsLoading.current = isLoading;
  }, [rotate, isLoading]);

  return (
    <animated.div
      onClick={(e) => {
        e.preventDefault();

        refresh();
      }}
      style={{
        pointerEvents: translateY.to((v) =>
          v >= visibleTranslateY / 2 ? "none" : "auto"
        ),

        position: "fixed",
        marginBottom: BottomTabsHeightRem,
        bottom: 0,
        zIndex: 10,

        width: "100%",
        maxWidth: SidePanelMaxWidth,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",

        cursor: isLoading ? "progress" : "pointer",
      }}
    >
      <animated.div
        style={{
          padding: "0.75rem 1rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",

          borderRadius: "999999px",
          background:
            theme.mode === "light"
              ? ColorPalette["white"]
              : ColorPalette["gray-500"],
          boxShadow:
            theme.mode === "light"
              ? "0px 4px 12px 0px rgba(0, 0, 0, 0.12)"
              : "0px 0px 24px 0px rgba(0, 0, 0, 0.25)",

          translateY: translateY.to((v) => `${v}%`),
        }}
      >
        <Subtitle4
          color={
            theme.mode === "light"
              ? ColorPalette["gray-600"]
              : ColorPalette["gray-50"]
          }
        >
          Refresh
        </Subtitle4>
        <Gutter size="0.25rem" />
        <animated.svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="none"
          stroke="none"
          viewBox="0 0 16 16"
          style={{
            transform: rotate.to((v) => `rotate(${v}deg)`),
          }}
        >
          <path
            stroke={
              theme.mode === "light"
                ? ColorPalette["gray-600"]
                : ColorPalette["gray-50"]
            }
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.33"
            d="M11.182 6.232h3.328v0M2.49 13.095V9.768m0 0h3.328m-3.329 0l2.12 2.122a5.5 5.5 0 009.202-2.466M3.188 6.577a5.5 5.5 0 019.202-2.467l2.121 2.121m0-3.327V6.23"
          />
        </animated.svg>
      </animated.div>
    </animated.div>
  );
});
