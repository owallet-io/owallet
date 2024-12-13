import React, {
  FunctionComponent,
  PropsWithChildren,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Stack } from "../../../../components/stack";
import { Box } from "../../../../components/box";
import { useStore } from "../../../../stores";
import { Column, Columns } from "../../../../components/column";
import { observer } from "mobx-react-lite";
import { ViewToken } from "../../index";
import {
  BaseTypography,
  Caption1,
  Caption2,
  Subtitle2,
  Subtitle3,
  Subtitle4,
} from "../../../../components/typography";
import { ColorPalette } from "../../../../styles";
import {
  ArrowRightIcon,
  LoadingIcon,
  QuestionIcon,
} from "../../../../components/icon";
import styled, { css, useTheme } from "styled-components";
import {
  ChainImageFallback,
  CurrencyImageFallback,
} from "../../../../components/image";
import { Tooltip } from "../../../../components/tooltip";
import { DenomHelper } from "@owallet/common";
import { XAxis } from "../../../../components/axis";
import { Gutter } from "../../../../components/gutter";
import Color from "color";
import { Skeleton } from "../../../../components/skeleton";
import { WrongViewingKeyError } from "@owallet/stores";
import { useNavigate } from "react-router";
import { Secret20Currency } from "@owallet/types";
import { FormattedMessage, useIntl } from "react-intl";
import { animated, useSpringValue, to } from "@react-spring/web";
import { defaultSpringConfig } from "../../../../styles/spring";
import { Bech32Address } from "@owallet/cosmos";
import { DecUtils, RatePretty } from "@owallet/unit";

const Styles = {
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
              : ColorPalette["gray-600"]};
          }
        `;
      }
    }}
    
  `,
  IconContainer: styled.div`
    color: ${ColorPalette["gray-300"]};
  `,
};

export const TokenTitleView: FunctionComponent<{
  title: string;
  tooltip?: string | React.ReactElement;

  right?: React.ReactElement;
}> = ({ title, tooltip, right }) => {
  const theme = useTheme();

  return (
    <Box
      style={{
        flex: 1,
      }}
    >
      <Columns sum={1} alignY="center">
        <Subtitle4
          style={{
            color:
              theme.mode === "light"
                ? ColorPalette["gray-500"]
                : ColorPalette["gray-200"],
          }}
        >
          {title}
        </Subtitle4>
        {tooltip ? (
          <Box marginLeft="0.25rem">
            <Tooltip content={tooltip}>
              <QuestionIcon
                width="1rem"
                height="1rem"
                color={
                  theme.mode === "light"
                    ? ColorPalette["gray-200"]
                    : ColorPalette["gray-300"]
                }
              />
            </Tooltip>
          </Box>
        ) : null}
        {right ? (
          <React.Fragment>
            <Column weight={1} />
            {right}
          </React.Fragment>
        ) : null}
      </Columns>
    </Box>
  );
};

interface TokenItemProps {
  viewToken: ViewToken;
  onClick?: () => void;
  disabled?: boolean;
  forChange?: boolean;
  isNotReady?: boolean;

  // For remaining unbonding time.
  altSentence?: string | React.ReactElement;

  // If this prop is provided, the copied button will be shown.
  copyAddress?: string;

  hideBalance?: boolean;
  showPrice24HChange?: boolean;
}

export const TokenItem: FunctionComponent<TokenItemProps> = observer(
  ({
    viewToken,
    onClick,
    disabled,
    forChange,
    isNotReady,
    altSentence,
    copyAddress,
    hideBalance,
    showPrice24HChange,
  }) => {
    const { priceStore, price24HChangesStore, uiConfigStore } = useStore();
    const navigate = useNavigate();
    const intl = useIntl();
    const theme = useTheme();

    const [isHover, setIsHover] = useState(false);

    const pricePretty = priceStore.calculatePrice(viewToken.token);

    const isIBC = useMemo(() => {
      return viewToken.token.currency.coinMinimalDenom.startsWith("ibc/");
    }, [viewToken.token.currency]);

    const coinDenom = useMemo(() => {
      if (
        "originCurrency" in viewToken.token.currency &&
        viewToken.token.currency.originCurrency
      ) {
        return viewToken.token.currency.originCurrency.coinDenom;
      }
      return viewToken.token.currency.coinDenom;
    }, [viewToken.token.currency]);

    console.log("viewToken.chainInfo", viewToken.chainInfo);

    const tag = useMemo(() => {
      const currency = viewToken.token.currency;
      const denomHelper = new DenomHelper(currency.coinMinimalDenom);
      if (
        denomHelper.type === "native" &&
        currency.coinMinimalDenom.startsWith("ibc/")
      ) {
        return {
          text: "IBC",
          tooltip: (() => {
            const start = currency.coinDenom.indexOf("(");
            const end = currency.coinDenom.lastIndexOf(")");

            if (start < 0 || end < 0) {
              return "Unknown";
            }

            return currency.coinDenom.slice(start + 1, end);
          })(),
        };
      }
      if (denomHelper.type !== "native") {
        return {
          text: denomHelper.type,
        };
      }
    }, [viewToken.token.currency]);

    const price24HChange = (() => {
      if (!showPrice24HChange) {
        return undefined;
      }
      if (!viewToken.token.currency.coinGeckoId) {
        return undefined;
      }
      return price24HChangesStore.get24HChange(
        viewToken.token.currency.coinGeckoId
      );
    })();

    return (
      <Styles.Container
        forChange={forChange}
        isError={viewToken.error != null}
        disabled={disabled}
        isNotReady={isNotReady}
        onMouseEnter={() => {
          setIsHover(true);
        }}
        onMouseOver={() => {
          setIsHover(true);
        }}
        onMouseLeave={() => {
          setIsHover(false);
        }}
        onClick={async (e) => {
          e.preventDefault();

          if (
            viewToken.error?.data &&
            viewToken.error.data instanceof WrongViewingKeyError
          ) {
            navigate(
              `/setting/token/add?chainId=${
                viewToken.chainInfo.chainId
              }&contractAddress=${
                (viewToken.token.currency as Secret20Currency).contractAddress
              }`
            );

            return;
          }

          if (onClick) {
            onClick();
          }
        }}
      >
        <Columns sum={1} gutter="0.5rem" alignY="center">
          <Skeleton type="circle" layer={1} isNotReady={isNotReady}>
            <CurrencyImageFallback
              chainInfo={viewToken.chainInfo}
              currency={viewToken.token.currency}
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
                chainInfo={viewToken.chainInfo}
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
                  {coinDenom}
                </Subtitle2>
              </Skeleton>

              {price24HChange ? (
                <React.Fragment>
                  <Gutter size="0.25rem" />
                  <Box alignY="center" height="1px">
                    <PriceChangeTag rate={price24HChange} />
                  </Box>
                </React.Fragment>
              ) : null}

              {viewToken.isFetching ? (
                <DelayedLoadingRender isFetching={viewToken.isFetching}>
                  <Box
                    marginLeft="0.25rem"
                    style={{
                      color: ColorPalette["gray-300"],
                    }}
                  >
                    <LoadingIcon width="1rem" height="1rem" />
                  </Box>
                </DelayedLoadingRender>
              ) : viewToken.error ? (
                <Box
                  marginLeft="0.25rem"
                  style={{
                    color: ColorPalette["yellow-400"],
                  }}
                >
                  <Tooltip
                    content={(() => {
                      if (
                        viewToken.error?.message ===
                        "Wrong viewing key for this address or viewing key not set"
                      ) {
                        return intl.formatMessage({
                          id: "page.main.components.token.wrong-viewing-key-error",
                        });
                      }

                      return (
                        viewToken.error.message ||
                        "Failed to query response from endpoint. Check again in a few minutes."
                      );
                    })()}
                  >
                    <ErrorIcon size="1rem" />
                  </Tooltip>
                </Box>
              ) : undefined}
            </XAxis>
            <XAxis alignY="center">
              <Skeleton
                layer={1}
                isNotReady={isNotReady}
                dummyMinWidth="4.5rem"
              >
                <Caption1 style={{ color: ColorPalette["gray-300"] }}>
                  {isIBC
                    ? `${viewToken.chainInfo.chainName}`
                    : viewToken.chainInfo.chainName}
                </Caption1>
              </Skeleton>

              {tag ? (
                <React.Fragment>
                  <Gutter size="0.25rem" />
                  <Box alignY="center" height="1px">
                    <TokenTag
                      text={tag.text.toUpperCase()}
                      tooltip={tag.tooltip}
                    />
                  </Box>
                </React.Fragment>
              ) : null}

              {!isNotReady && copyAddress ? (
                <Box alignY="center" height="1px">
                  <XAxis alignY="center">
                    <Gutter size="0.125rem" />
                    <CopyAddressButton
                      address={copyAddress}
                      parentIsHover={isHover}
                    />
                  </XAxis>
                </Box>
              ) : null}
            </XAxis>
          </Stack>

          <Column weight={1} />

          <Columns sum={1} gutter="0.25rem" alignY="center">
            <Stack gutter="0.25rem" alignX="right">
              {!hideBalance ? (
                <Skeleton
                  layer={1}
                  isNotReady={isNotReady}
                  dummyMinWidth="3.25rem"
                >
                  <Subtitle3
                    color={
                      theme.mode === "light"
                        ? ColorPalette["gray-700"]
                        : ColorPalette["gray-10"]
                    }
                  >
                    {uiConfigStore.hideStringIfPrivacyMode(
                      viewToken.token
                        .hideDenom(true)
                        .maxDecimals(6)
                        .inequalitySymbol(true)
                        .shrink(true)
                        .toString(),
                      2
                    )}
                  </Subtitle3>
                </Skeleton>
              ) : null}
              <Skeleton
                layer={1}
                isNotReady={isNotReady}
                dummyMinWidth="4.5rem"
              >
                {viewToken.error?.data &&
                viewToken.error.data instanceof WrongViewingKeyError ? (
                  <Box position="relative" alignX="right">
                    <Subtitle3
                      color={
                        theme.mode === "light"
                          ? ColorPalette["gray-200"]
                          : ColorPalette["gray-100"]
                      }
                      style={{
                        textDecoration: "underline",
                        position: "absolute",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <FormattedMessage id="page.main.components.token.set-your-viewing-key" />
                    </Subtitle3>
                    <Subtitle3
                      style={{
                        textDecoration: "underline",
                        whiteSpace: "nowrap",
                        opacity: 0,
                      }}
                    >
                      &nbps;
                    </Subtitle3>
                  </Box>
                ) : (
                  <Subtitle3 color={ColorPalette["gray-300"]}>
                    {(() => {
                      if (hideBalance) {
                        return "";
                      }

                      if (altSentence) {
                        return altSentence;
                      }

                      return uiConfigStore.hideStringIfPrivacyMode(
                        pricePretty
                          ? pricePretty.inequalitySymbol(true).toString()
                          : "-",
                        2
                      );
                    })()}
                  </Subtitle3>
                )}
              </Skeleton>
            </Stack>

            {forChange ? (
              <Styles.IconContainer>
                <ArrowRightIcon />
              </Styles.IconContainer>
            ) : null}
          </Columns>
        </Columns>
      </Styles.Container>
    );
  }
);

const ErrorIcon: FunctionComponent<{
  size: string;
}> = ({ size }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.5"
        d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
      />
    </svg>
  );
};

let initialOnLoad = false;
setTimeout(() => {
  initialOnLoad = true;
}, 1000);

const DelayedLoadingRender: FunctionComponent<
  PropsWithChildren<{
    isFetching: boolean;
  }>
> = ({ isFetching, children }) => {
  const [show, setShow] = useState(false);

  useLayoutEffect(() => {
    if (isFetching) {
      const id = setTimeout(
        () => {
          setShow(true);
        },

        initialOnLoad ? 500 : 1000
      );

      return () => {
        clearTimeout(id);
      };
    } else {
      setShow(false);
    }
  }, [isFetching]);

  if (!show) {
    return null;
  }

  return <React.Fragment>{children}</React.Fragment>;
};

const pxToRem = (px: number) => {
  const base = parseFloat(
    getComputedStyle(document.documentElement).fontSize.replace("px", "")
  );
  return px / base;
};

const getCopyAddressButtonBackgroundColor = (theme: {
  mode: "dark" | "light";
}): string => {
  return theme.mode === "light"
    ? Color(ColorPalette["gray-10"]).alpha(0).toString()
    : Color(ColorPalette["gray-550"]).alpha(0).toString();
};

const getCopyAddressButtonHoverBackgroundColor = (theme: {
  mode: "dark" | "light";
}): string => {
  return theme.mode === "light"
    ? Color(ColorPalette["gray-100"]).alpha(0.5).toString()
    : ColorPalette["gray-450"];
};

const CopyAddressButton: FunctionComponent<{
  address: string;

  parentIsHover: boolean;
}> = ({ address, parentIsHover }) => {
  const INITIAL_COPY_ADDRESS_CONTAINER_SIZE = 20;

  const theme = useTheme();

  const [containerWidthRem, setContainerWidthRem] = useState(
    pxToRem(INITIAL_COPY_ADDRESS_CONTAINER_SIZE)
  );
  const [isAnimatingClick, setIsAnimatingClick] = useState(false);
  const [isHover, setIsHover] = useState(false);

  const animatedOpacity = useSpringValue(0, {
    config: defaultSpringConfig,
  });
  const lastAnimatedOpacity = useRef(0);
  const animatedWidth = useSpringValue(containerWidthRem, {
    config: defaultSpringConfig,
  });
  const lastAnimatedWidth = useRef(containerWidthRem);
  const animatedBackgroundColor = useSpringValue(
    getCopyAddressButtonBackgroundColor(theme),
    {
      config: defaultSpringConfig,
    }
  );
  const lastAnimatedBackgroundColor = useRef(
    getCopyAddressButtonBackgroundColor(theme)
  );

  const seq = useRef(0);

  const [_, setAnimationStack] = useState<
    {
      id: string;

      type: "width" | "opacity" | "background";
      to: number | string;

      isAnimating: boolean;
      blockProceedingAnimations: boolean;

      onRest?: () => void;
    }[]
  >([]);

  const animateStack = useCallback(() => {
    setAnimationStack((prev) => {
      const blockAnimationIndex = prev.findIndex(
        (anim) => anim.blockProceedingAnimations
      );
      const notBlockedAnimations =
        blockAnimationIndex >= 0
          ? prev.slice(0, blockAnimationIndex + 1)
          : prev;

      const anims = notBlockedAnimations.filter((anim) => {
        return !anim.isAnimating;
      });

      if (anims.length > 0) {
        for (const anim of anims) {
          anim.isAnimating = true;
          const removeAnim = () => {
            setAnimationStack((prev) => {
              const index = prev.findIndex((a) => a.id === anim.id);
              if (index >= 0) {
                prev.splice(index, 1);
                return [...prev];
              } else {
                return prev;
              }
            });
          };
          const onRest = () => {
            if (anim.onRest) {
              anim.onRest();
            }

            removeAnim();
          };

          if (anim.type === "opacity") {
            const changed = lastAnimatedOpacity.current !== anim.to;
            if (changed) {
              animatedOpacity.start(anim.to as number, {
                onRest: onRest,
              });
            } else {
              removeAnim();
            }
            lastAnimatedOpacity.current = anim.to as number;
          } else if (anim.type === "width") {
            const changed = lastAnimatedWidth.current !== anim.to;
            if (changed) {
              animatedWidth.start(anim.to as number, {
                onRest: onRest,
              });
            } else {
              removeAnim();
            }
            lastAnimatedWidth.current = anim.to as number;
          } else if (anim.type === "background") {
            const changed = lastAnimatedBackgroundColor.current !== anim.to;
            if (changed) {
              animatedBackgroundColor.start(anim.to as string, {
                onRest: onRest,
              });
            } else {
              removeAnim();
            }
            lastAnimatedBackgroundColor.current = anim.to as string;
          }
        }

        return [...prev];
      } else {
        return prev;
      }
    });
  }, [animatedBackgroundColor, animatedOpacity, animatedWidth]);

  const pushAnimation = useCallback(
    (animation: {
      type: "width" | "opacity" | "background";
      to: number | string;

      blockProceedingAnimations?: boolean;

      onRest?: () => void;
    }) => {
      setAnimationStack((prev) => {
        prev.push({
          ...animation,
          id: (seq.current++).toString(),
          blockProceedingAnimations:
            animation.blockProceedingAnimations ?? false,
          isAnimating: false,
        });

        return [...prev];
      });

      animateStack();
    },
    [animateStack]
  );

  useEffect(() => {
    if (parentIsHover) {
      pushAnimation({
        type: "opacity",
        to: 1,
      });
    } else {
      pushAnimation({
        type: "opacity",
        to: 0,
      });
    }
  }, [parentIsHover, pushAnimation]);

  useEffect(() => {
    if (isHover || isAnimatingClick) {
      pushAnimation({
        type: "background",
        to: getCopyAddressButtonHoverBackgroundColor(theme),
      });
    } else {
      pushAnimation({
        type: "background",
        to: getCopyAddressButtonBackgroundColor(theme),
      });
    }
  }, [isAnimatingClick, isHover, pushAnimation, theme]);

  const resizeRef = useRef<HTMLDivElement | null>(null);

  const [resizeObserver] = useState(() => {
    return new ResizeObserver((entries) => {
      if (entries.length > 0) {
        const entry = entries[0];
        const boxSize = Array.isArray(entry.borderBoxSize)
          ? entry.borderBoxSize[0]
          : entry.borderBoxSize;

        const width = boxSize.inlineSize;
        setContainerWidthRem(pxToRem(width));
      }
    });
  });
  useEffect(() => {
    if (resizeRef.current) {
      const div = resizeRef.current;
      resizeObserver.observe(div, {});

      return () => {
        resizeObserver.unobserve(div);
      };
    }
  }, [resizeObserver]);

  // For animating when click
  const [clickAnimation, setClickAnimation] = useState(false);

  useEffect(() => {
    if (clickAnimation) {
      setIsAnimatingClick(true);
      pushAnimation({
        type: "width",
        to: containerWidthRem,
        blockProceedingAnimations: true,
      });

      const timeoutId = setTimeout(() => {
        setClickAnimation(false);
      }, 750);

      return () => {
        clearTimeout(timeoutId);
      };
    } else {
      pushAnimation({
        type: "width",
        to: pxToRem(INITIAL_COPY_ADDRESS_CONTAINER_SIZE),
        onRest: () => {
          setIsAnimatingClick(false);
        },
      });
    }
  }, [clickAnimation, containerWidthRem, pushAnimation]);

  return (
    <Tooltip
      enabled={false}
      isAlwaysOpen={!isAnimatingClick && isHover}
      content={Bech32Address.shortenAddress(address, 36)}
    >
      <animated.div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "flex-end",
          alignItems: "center",
          overflow: "hidden",
          cursor: "pointer",

          width: to(animatedWidth, (v) => `${v}rem`),
          height: pxToRem(INITIAL_COPY_ADDRESS_CONTAINER_SIZE) + "rem",
          opacity: animatedOpacity,

          borderRadius: "9999999px",
          backgroundColor: animatedBackgroundColor,
        }}
        onMouseEnter={() => {
          setIsHover(true);
        }}
        onMouseOver={() => {
          setIsHover(true);
        }}
        onMouseLeave={() => {
          setIsHover(false);
        }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();

          if (!isAnimatingClick) {
            setClickAnimation(true);

            navigator.clipboard.writeText(address);
          }
        }}
      >
        <div
          ref={resizeRef}
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Gutter size="0.25rem" />
          <Caption2
            color={
              theme.mode === "light"
                ? ColorPalette["gray-300"]
                : ColorPalette["gray-200"]
            }
            style={{
              whiteSpace: "nowrap",
            }}
          >
            <FormattedMessage id="page.main.components.token-item.copy-address.copied" />
          </Caption2>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            fill="none"
            viewBox="0 0 20 20"
          >
            <path
              stroke={
                theme.mode === "light"
                  ? ColorPalette["gray-200"]
                  : ColorPalette["gray-300"]
              }
              strokeLinecap="round"
              strokeWidth="1.371"
              d="M12 6H7.371C6.614 6 6 6.614 6 7.371V12"
            />
            <rect
              width="5.629"
              height="5.629"
              x="8.186"
              y="8.186"
              stroke={
                theme.mode === "light"
                  ? ColorPalette["gray-200"]
                  : ColorPalette["gray-300"]
              }
              strokeWidth="1.371"
              rx="0.686"
            />
          </svg>
        </div>
      </animated.div>
    </Tooltip>
  );
};

const TokenTag: FunctionComponent<{
  text: string;
  tooltip?: string;
}> = ({ text, tooltip }) => {
  const theme = useTheme();

  return (
    <Tooltip enabled={!!tooltip} content={tooltip}>
      <Box
        alignX="center"
        alignY="center"
        backgroundColor={
          theme.mode === "light"
            ? ColorPalette["purple-50"]
            : ColorPalette["gray-500"]
        }
        borderRadius="0.375rem"
        height="1rem"
        paddingX="0.375rem"
      >
        <BaseTypography
          style={{
            fontWeight: 400,
            fontSize: "0.6875rem",
          }}
          color={
            theme.mode === "light"
              ? ColorPalette["purple-400"]
              : ColorPalette["gray-200"]
          }
        >
          {text}
        </BaseTypography>
      </Box>
    </Tooltip>
  );
};

const PriceChangeTag: FunctionComponent<{
  rate: RatePretty;
}> = ({ rate }) => {
  const info: {
    text: string;
    isNeg: boolean;
  } = (() => {
    if (rate.toDec().abs().lte(DecUtils.getTenExponentN(-4))) {
      return {
        text: "0.00%",
        isNeg: false,
      };
    } else {
      const res = rate
        .maxDecimals(2)
        .trim(false)
        .shrink(true)
        .inequalitySymbol(false)
        .toString();

      const isNeg = res.startsWith("-");
      return {
        text: isNeg ? res.replace("-", "") : res,
        isNeg,
      };
    }
  })();

  const theme = useTheme();

  return (
    <Box
      height="1.125rem"
      minHeight="1.125rem"
      borderRadius="0.375rem"
      paddingX="0.25rem"
      alignY="center"
      backgroundColor={(() => {
        if (theme.mode === "light") {
          return info.isNeg
            ? ColorPalette["orange-50"]
            : ColorPalette["green-50"];
        }

        return info.isNeg
          ? Color(ColorPalette["orange-700"]).alpha(0.4).toString()
          : Color(ColorPalette["green-700"]).alpha(0.2).toString();
      })()}
      color={(() => {
        if (theme.mode === "light") {
          return info.isNeg
            ? ColorPalette["orange-400"]
            : ColorPalette["green-500"];
        }

        return info.isNeg
          ? ColorPalette["orange-400"]
          : ColorPalette["green-400"];
      })()}
    >
      <XAxis alignY="center">
        {info.isNeg ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="10"
            fill="none"
            viewBox="0 0 12 10"
          >
            <path stroke="currentColor" d="M1 1l4 5.5 2.667-3L11 9" />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="10"
            fill="none"
            viewBox="0 0 12 10"
          >
            <path stroke="currentColor" d="M1 9l4-5.5 2.667 3L11 1" />
          </svg>
        )}
        <Gutter size="0.25rem" />
        <Caption2>{info.text}</Caption2>
      </XAxis>
    </Box>
  );
};
