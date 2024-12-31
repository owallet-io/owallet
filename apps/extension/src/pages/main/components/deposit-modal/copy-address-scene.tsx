import React, { FunctionComponent, useState } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../../stores";
import { FormattedMessage, useIntl } from "react-intl";
import { useTheme } from "styled-components";
import { useFocusOnMount } from "../../../../hooks/use-focus-on-mount";
import { Box } from "../../../../components/box";
import { ColorPalette } from "../../../../styles";
import { XAxis, YAxis } from "../../../../components/axis";
import {
  Caption1,
  Subtitle1,
  Subtitle3,
} from "../../../../components/typography";
import { Gutter } from "../../../../components/gutter";
import { SearchTextInput } from "../../../../components/input";
import SimpleBar from "simplebar-react";
import { ChainImageFallback, Image } from "../../../../components/image";
import { Bech32Address, ChainIdHelper } from "@owallet/cosmos";
import {
  CheckToggleIcon,
  CopyOutlineIcon,
  QRCodeIcon,
  StarIcon,
} from "../../../../components/icon";
import { IconButton } from "../../../../components/icon-button";
import {
  useSceneEvents,
  useSceneTransition,
} from "../../../../components/transition";
import { ChainIdEVM, ModularChainInfo } from "@owallet/types";

export const CopyAddressScene: FunctionComponent<{
  close: () => void;
}> = observer(({ close }) => {
  const {
    chainStore,
    accountStore,
    keyRingStore,
    uiConfigStore,
    analyticsStore,
    tronAccountStore,
  } = useStore();

  const intl = useIntl();
  const theme = useTheme();
  const [search, setSearch] = useState("");

  const searchRef = useFocusOnMount<HTMLInputElement>();

  useSceneEvents({
    onDidVisible: () => {
      if (searchRef.current) {
        searchRef.current.focus();
      }
    },
  });

  const [sortPriorities, setSortPriorities] = useState<
    Record<string, true | undefined>
  >(() => {
    if (!keyRingStore.selectedKeyInfo) {
      return {};
    }
    const res: Record<string, true | undefined> = {};
    for (const modularChainInfo of chainStore.modularChainInfosInUI) {
      if (
        uiConfigStore.copyAddressConfig.isBookmarkedChain(
          keyRingStore.selectedKeyInfo.id,
          modularChainInfo.chainId
        )
      ) {
        res[ChainIdHelper.parse(modularChainInfo.chainId).identifier] = true;
      }
    }
    return res;
  });

  const addresses: {
    modularChainInfo: ModularChainInfo;
    bech32Address?: string;
    ethereumAddress?: string;
    starknetAddress?: string;
  }[] = chainStore.modularChainInfosInUI
    .map((modularChainInfo) => {
      const accountInfo = accountStore.getAccount(modularChainInfo.chainId);

      const bech32Address = (() => {
        if (!("cosmos" in modularChainInfo)) {
          return undefined;
        }

        if (modularChainInfo.chainId.startsWith("eip155")) {
          return undefined;
        }

        return accountInfo.bech32Address;
      })();
      const ethereumAddress = (() => {
        if (!("cosmos" in modularChainInfo)) {
          return undefined;
        }

        if (modularChainInfo.chainId.startsWith("injective")) {
          return undefined;
        }

        if (modularChainInfo.chainId === ChainIdEVM.TRON) {
          const accountTronInfo = tronAccountStore.getAccount(
            modularChainInfo.chainId
          );

          return accountTronInfo.base58Address;
        }

        return accountInfo.hasEthereumHexAddress
          ? accountInfo.ethereumHexAddress
          : undefined;
      })();

      return {
        modularChainInfo,
        bech32Address,
        ethereumAddress,
      };
    })
    .filter(({ modularChainInfo, bech32Address }) => {
      const s = search.trim().toLowerCase();
      if (s.length === 0) {
        return true;
      }

      if (modularChainInfo.chainId.toLowerCase().includes(s)) {
        return true;
      }

      if (modularChainInfo.chainName.toLowerCase().includes(s)) {
        return true;
      }

      if (bech32Address) {
        const bech32Split = bech32Address.split("1");
        if (bech32Split.length > 0) {
          if (bech32Split[0].toLowerCase().includes(s)) {
            return true;
          }
        }
      }

      if ("cosmos" in modularChainInfo && modularChainInfo.cosmos != null) {
        const cosmosChainInfo = modularChainInfo.cosmos;
        if (cosmosChainInfo.stakeCurrency) {
          if (
            cosmosChainInfo.stakeCurrency.coinDenom.toLowerCase().includes(s)
          ) {
            return true;
          }
        }
        if (cosmosChainInfo.currencies.length > 0) {
          const currency = cosmosChainInfo.currencies[0];
          if (!currency.coinMinimalDenom.startsWith("ibc/")) {
            if (currency.coinDenom.toLowerCase().includes(s)) {
              return true;
            }
          }
        }
      }
    })
    .sort((a, b) => {
      const aChainIdentifier = ChainIdHelper.parse(
        a.modularChainInfo.chainId
      ).identifier;
      const bChainIdentifier = ChainIdHelper.parse(
        b.modularChainInfo.chainId
      ).identifier;

      const aPriority = sortPriorities[aChainIdentifier];
      const bPriority = sortPriorities[bChainIdentifier];

      if (aPriority && bPriority) {
        return 0;
      }
      if (aPriority) {
        return -1;
      }
      if (bPriority) {
        return 1;
      }
      return 0;
    });

  const [blockInteraction, setBlockInteraction] = useState(false);

  return (
    <Box
      paddingTop="1.25rem"
      backgroundColor={
        theme.mode === "light" ? ColorPalette.white : ColorPalette["gray-600"]
      }
    >
      <YAxis alignX="center">
        <Subtitle1
          color={
            theme.mode === "light"
              ? ColorPalette["gray-700"]
              : ColorPalette.white
          }
        >
          <FormattedMessage id="page.main.components.deposit-modal.title" />
        </Subtitle1>
      </YAxis>

      <Gutter size="0.75rem" />

      <Box paddingX="0.75rem">
        <SearchTextInput
          ref={searchRef}
          value={search}
          onChange={(e) => {
            e.preventDefault();

            setSearch(e.target.value);
          }}
          placeholder={intl.formatMessage({
            id: "page.main.components.deposit-modal.search-placeholder",
          })}
        />
      </Box>

      <Gutter size="0.75rem" />

      <SimpleBar
        style={{
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
          height: "21.5rem",
        }}
      >
        {addresses.length === 0 ? (
          <Box
            alignX="center"
            alignY="center"
            paddingX="1.625rem"
            paddingTop="3.1rem"
            paddingBottom="3.2rem"
          >
            <Image
              width="140px"
              height="160px"
              src={require(theme.mode === "light"
                ? "../../../../public/assets/img/copy-address-no-search-result-light.png"
                : "../../../../public/assets/img/copy-address-no-search-result.png")}
              alt="copy-address-no-search-result-image"
            />
            <Gutter size="0.75rem" />

            <Subtitle3
              color={ColorPalette["gray-300"]}
              style={{ textAlign: "center" }}
            >
              <FormattedMessage
                id="page.main.components.deposit-modal.empty-text"
                values={{
                  //@ts-ignore
                  link: (chunks) => (
                    <Subtitle3
                      as="a"
                      style={{
                        cursor: "pointer",
                        textDecoration: "underline",
                      }}
                      onClick={(e) => {
                        e.preventDefault();

                        if (keyRingStore.selectedKeyInfo) {
                          analyticsStore.logEvent(
                            "click_menu_manageChainVisibility"
                          );
                          browser.tabs
                            .create({
                              url: `/register.html#?route=enable-chains&vaultId=${keyRingStore.selectedKeyInfo.id}&skipWelcome=true`,
                            })
                            .then(() => {
                              window.close();
                            });
                        }
                      }}
                    >
                      {chunks}
                    </Subtitle3>
                  ),
                }}
              />
            </Subtitle3>
          </Box>
        ) : null}

        <Box paddingX="0.75rem">
          {addresses
            .map((address) => {
              if (address.ethereumAddress && address.bech32Address) {
                return [
                  {
                    modularChainInfo: address.modularChainInfo,
                    bech32Address: address.bech32Address,
                  },
                  {
                    ...address,
                  },
                ];
              }

              return address;
            })
            .flat()
            .map((address) => {
              return (
                <CopyAddressItem
                  key={
                    ChainIdHelper.parse(address.modularChainInfo.chainId)
                      .identifier +
                    address.bech32Address +
                    (address.ethereumAddress || "")
                  }
                  address={address}
                  close={close}
                  blockInteraction={blockInteraction}
                  setBlockInteraction={setBlockInteraction}
                  setSortPriorities={setSortPriorities}
                />
              );
            })}
        </Box>
      </SimpleBar>
    </Box>
  );
});

const CopyAddressItem: FunctionComponent<{
  address: {
    modularChainInfo: ModularChainInfo;
    bech32Address?: string;
    ethereumAddress?: string;
    starknetAddress?: string;
  };
  close: () => void;

  blockInteraction: boolean;
  setBlockInteraction: (block: boolean) => void;
  setSortPriorities: (
    fn: (
      value: Record<string, true | undefined>
    ) => Record<string, true | undefined>
  ) => void;
}> = observer(
  ({
    address,
    close,
    blockInteraction,
    setBlockInteraction,
    setSortPriorities,
  }) => {
    const { analyticsStore, keyRingStore, uiConfigStore, chainStore } =
      useStore();

    const theme = useTheme();

    const sceneTransition = useSceneTransition();

    const [hasCopied, setHasCopied] = useState(false);

    const isBookmarked = keyRingStore.selectedKeyInfo
      ? uiConfigStore.copyAddressConfig.isBookmarkedChain(
          keyRingStore.selectedKeyInfo.id,
          address.modularChainInfo.chainId
        )
      : false;

    const [isCopyContainerHover, setIsCopyContainerHover] = useState(false);
    const [isBookmarkHover, setIsBookmarkHover] = useState(false);

    const isEVMOnlyChain =
      "cosmos" in address.modularChainInfo &&
      address.modularChainInfo.cosmos != null &&
      chainStore.isEvmOnlyChain(address.modularChainInfo.chainId);

    return (
      <Box height="4rem" borderRadius="0.375rem" alignY="center">
        <XAxis alignY="center">
          <Box
            height="4rem"
            borderRadius="0.375rem"
            alignY="center"
            backgroundColor={(() => {
              if (blockInteraction) {
                return;
              }

              if (isBookmarkHover) {
                return;
              }

              if (isCopyContainerHover) {
                return theme.mode === "light"
                  ? ColorPalette["gray-10"]
                  : ColorPalette["gray-550"];
              }

              return;
            })()}
            onHoverStateChange={(isHover) => {
              setIsCopyContainerHover(isHover);
            }}
            cursor={blockInteraction ? undefined : "pointer"}
            paddingLeft="1rem"
            style={{
              flex: 1,
            }}
            onClick={async (e) => {
              e.preventDefault();

              await navigator.clipboard.writeText(
                address.starknetAddress ||
                  address.ethereumAddress ||
                  address.bech32Address ||
                  ""
              );
              setHasCopied(true);
              setBlockInteraction(true);

              analyticsStore.logEvent("click_copyAddress_copy", {
                chainId: address.modularChainInfo.chainId,
                chainName: address.modularChainInfo.chainName,
              });
              setHasCopied(true);

              setTimeout(() => {
                close();
              }, 500);
            }}
          >
            <XAxis alignY="center">
              <Gutter size="0.5rem" />
              <Box
                style={{
                  borderRadius: "99rem",
                  backgroundColor: ColorPalette["gray-50"],
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "0.25rem",
                }}
              >
                <ChainImageFallback
                  chainInfo={address.modularChainInfo}
                  size="2rem"
                />
              </Box>

              <Gutter size="0.5rem" />
              <YAxis>
                <Subtitle3
                  color={
                    theme.mode === "light"
                      ? ColorPalette["gray-700"]
                      : ColorPalette["gray-10"]
                  }
                >
                  {address.modularChainInfo.chainName}
                </Subtitle3>
                <Gutter size="0.25rem" />
                <Caption1 color={ColorPalette["gray-300"]}>
                  {(() => {
                    if (address.ethereumAddress) {
                      return address.ethereumAddress.length <= 42
                        ? `${address.ethereumAddress.slice(
                            0,
                            10
                          )}...${address.ethereumAddress.slice(-8)}`
                        : address.ethereumAddress;
                    }

                    if (address.bech32Address) {
                      return Bech32Address.shortenAddress(
                        address.bech32Address,
                        20
                      );
                    }
                  })()}
                </Caption1>
              </YAxis>

              <div
                style={{
                  flex: 1,
                }}
              />

              <Box padding="0.5rem" alignX="center" alignY="center">
                {hasCopied ? (
                  <CheckToggleIcon
                    width="1.25rem"
                    height="1.25rem"
                    color={ColorPalette["green-400"]}
                  />
                ) : (
                  <CopyOutlineIcon
                    width="1.25rem"
                    height="1.25rem"
                    color={
                      theme.mode === "light"
                        ? ColorPalette["gray-300"]
                        : ColorPalette.white
                    }
                  />
                )}
              </Box>
              <Gutter size="0.5rem" />
            </XAxis>
          </Box>

          <Gutter size="0.38rem" />
          <XAxis alignY="center">
            <IconButton
              padding="0.5rem"
              hoverColor={
                theme.mode === "light"
                  ? ColorPalette["gray-50"]
                  : ColorPalette["gray-500"]
              }
              disabled={hasCopied}
              onClick={() => {
                sceneTransition.push("qr-code", {
                  chainId: address.modularChainInfo.chainId,
                  address:
                    address.starknetAddress ||
                    address.ethereumAddress ||
                    address.bech32Address,
                });
              }}
            >
              <QRCodeIcon
                width="1.25rem"
                height="1.25rem"
                color={
                  theme.mode === "light"
                    ? ColorPalette["gray-300"]
                    : ColorPalette.white
                }
              />
            </IconButton>

            <Gutter size="0.75rem" direction="horizontal" />
          </XAxis>
          <XAxis alignY="center">
            <Box
              cursor={
                blockInteraction || (!isEVMOnlyChain && address.ethereumAddress)
                  ? undefined
                  : "pointer"
              }
              onHoverStateChange={(isHover) => {
                setIsBookmarkHover(isHover);
              }}
              style={{
                opacity: !isEVMOnlyChain && address.ethereumAddress ? 0 : 1,
                pointerEvents:
                  !isEVMOnlyChain && address.ethereumAddress
                    ? "none"
                    : undefined,
                color: (() => {
                  if (isBookmarked) {
                    if (!blockInteraction && isBookmarkHover) {
                      return theme.mode === "light"
                        ? ColorPalette["purple-300"]
                        : ColorPalette["purple-500"];
                    }
                    return ColorPalette["purple-400"];
                  }

                  if (!blockInteraction && isBookmarkHover) {
                    return theme.mode === "light"
                      ? ColorPalette["gray-200"]
                      : ColorPalette["gray-400"];
                  }

                  return theme.mode === "light"
                    ? ColorPalette["gray-100"]
                    : ColorPalette["gray-300"];
                })(),
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();

                if (blockInteraction) {
                  return;
                }

                const newIsBookmarked = !isBookmarked;

                analyticsStore.logEvent("click_favoriteChain", {
                  chainId: address.modularChainInfo.chainId,
                  chainName: address.modularChainInfo.chainName,
                  isFavorite: newIsBookmarked,
                });

                if (keyRingStore.selectedKeyInfo) {
                  if (newIsBookmarked) {
                    uiConfigStore.copyAddressConfig.bookmarkChain(
                      keyRingStore.selectedKeyInfo.id,
                      address.modularChainInfo.chainId
                    );
                  } else {
                    uiConfigStore.copyAddressConfig.unbookmarkChain(
                      keyRingStore.selectedKeyInfo.id,
                      address.modularChainInfo.chainId
                    );

                    setSortPriorities((priorities) => {
                      const identifier = ChainIdHelper.parse(
                        address.modularChainInfo.chainId
                      ).identifier;
                      const newPriorities = { ...priorities };
                      if (newPriorities[identifier]) {
                        delete newPriorities[identifier];
                      }
                      return newPriorities;
                    });
                  }
                }
              }}
            >
              <StarIcon width="1.25rem" height="1.25rem" />
            </Box>
            <Gutter size="0.75rem" direction="horizontal" />
          </XAxis>
        </XAxis>
      </Box>
    );
  }
);
