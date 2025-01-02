import React, { FunctionComponent, useEffect, useRef, useState } from "react";
import styled, { useTheme } from "styled-components";
import { ColorPalette } from "../../../../styles";
import { CloseIcon, LinkIcon } from "../../../../components/icon";
import { Box } from "../../../../components/box";
import { Stack } from "../../../../components/stack";
import { useNavigate } from "react-router";
import { Gutter } from "../../../../components/gutter";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../../stores";
import {
  Body2,
  Button2,
  Caption1,
  H3,
  H5,
  Subtitle2,
  Subtitle4,
} from "../../../../components/typography";
import { XAxis } from "../../../../components/axis";
import { Bleed } from "../../../../components/bleed";
import { FormattedMessage } from "react-intl";
import { useLocation } from "react-router-dom";
import { isRunningInSidePanel, toggleSidePanelMode } from "../../../../utils";
import { dispatchGlobalEventExceptSelf } from "../../../../utils/global-events";
import { Column, Columns } from "../../../../components/column";
import {
  GetSidePanelEnabledMsg,
  GetSidePanelIsSupportedMsg,
} from "@owallet/background";
import { InExtensionMessageRequester } from "@owallet/router-extension";
import { BACKGROUND_PORT } from "@owallet/router";
import Color from "color";

const manifestData = chrome.runtime.getManifest();

enum MenuEnum {
  ADD_TOKEN = 1,
  MANAGE_CHAINS = 2,
  ADDR_BOOK = 3,
  CONNECTED_DAPP = 4,
  PREFERENCES = 5,
  LOCK = 6,
  ABOUT_USER = 7,
  SIDEPANEL = 9,
  SETTINGS = 10,
}

const dataItem = [
  {
    name: "Add Token",
    icon: require("assets/svg/tdesign_add_circle.svg"),
    id: MenuEnum.ADD_TOKEN,
  },
  {
    name: "Manage Chains",
    icon: require("assets/svg/tdesign_list.svg"),
    id: MenuEnum.MANAGE_CHAINS,
  },
  {
    name: "Contacts",
    icon: require("assets/svg/tdesign_address_book.svg"),
    id: MenuEnum.ADDR_BOOK,
  },
  {
    name: "Lock Wallet",
    icon: require("assets/svg/tdesign_lock_on.svg"),
    id: MenuEnum.LOCK,
    isBorderBottom: true,
  },
  {
    name: "About us",
    icon: require("assets/svg/tdesign_info_circle.svg"),
    id: MenuEnum.ABOUT_USER,
    value: `v${manifestData.version}`,
    isBorderBottom: true,
  },
  // {
  //   name: "Settings",
  //   icon: require("assets/svg/tdesign_adjustment.svg"),
  //   id: MenuEnum.SETTINGS,
  // },
];

const Styles = {
  MenuItem: styled(H3)`
    color: ${(props) =>
      props.theme.mode === "light"
        ? ColorPalette["gray-700"]
        : ColorPalette["white"]};

    cursor: pointer;
  `,
  Flex1: styled.div`
    flex: 1;
  `,
  Title: styled(Subtitle2)`
    color: ${(props) =>
      props.theme.mode === "light"
        ? ColorPalette["gray-700"]
        : ColorPalette["gray-10"]};
  `,
  Paragraph: styled(Body2)`
    color: ${ColorPalette["gray-300"]};
  `,
  StartIcon: styled(Body2)`
    background-color: ${ColorPalette["gray-50"]};
    padding: 0.55rem;
    justify-content: center;
    align-items: center;
    border-radius: 999rem;
  `,
};

interface PageButtonProps {
  title: string | React.ReactNode;
  paragraph?: string;
  startIcon?: string;
  onClick?: () => void;
}

const MenuItem: FunctionComponent<PageButtonProps> = ({
  title,
  paragraph,
  startIcon,
  onClick,
}) => {
  return (
    <div
      style={{
        cursor: "pointer",
      }}
      onClick={
        onClick &&
        ((e) => {
          e.preventDefault();
          onClick();
        })
      }
    >
      <Columns sum={1} alignY="center">
        <Column weight={1}>
          <Stack>
            <Columns sum={1} gutter="0.475rem" alignY="center">
              {startIcon ? (
                <Styles.StartIcon>
                  <img width={16} src={startIcon} />
                </Styles.StartIcon>
              ) : null}
              <Styles.Title>{title}</Styles.Title>
              {paragraph ? (
                <Styles.Paragraph>{paragraph}</Styles.Paragraph>
              ) : null}
            </Columns>
          </Stack>
        </Column>
      </Columns>
    </div>
  );
};

export const MenuBar: FunctionComponent<{
  isOpen: boolean;
  close: () => void;

  showSidePanelRecommendationTooltip?: boolean;
}> = observer(({ isOpen, close, showSidePanelRecommendationTooltip }) => {
  const { analyticsStore, keyRingStore, uiConfigStore } = useStore();

  const location = useLocation();

  const theme = useTheme();
  const navigate = useNavigate();

  const [sidePanelSupported, setSidePanelSupported] = useState(false);
  const [sidePanelEnabled, setSidePanelEnabled] = useState(false);
  useEffect(() => {
    const msg = new GetSidePanelIsSupportedMsg();
    new InExtensionMessageRequester()
      .sendMessage(BACKGROUND_PORT, msg)
      .then((res) => {
        setSidePanelSupported(res.supported);

        const msg = new GetSidePanelEnabledMsg();
        new InExtensionMessageRequester()
          .sendMessage(BACKGROUND_PORT, msg)
          .then((res) => {
            setSidePanelEnabled(res.enabled);
          });
      });
  }, []);

  const [
    animateSidePanelRecommendationTooltip,
    setAnimateSidePanelRecommendationTooltip,
  ] = useState(false);
  const prevIsOpen = useRef(isOpen);
  useEffect(() => {
    if (showSidePanelRecommendationTooltip) {
      if (prevIsOpen.current && isOpen) {
        setTimeout(() => {
          setAnimateSidePanelRecommendationTooltip(true);
        }, 750);
      }
    }
    if (prevIsOpen.current !== isOpen) {
      prevIsOpen.current = isOpen;
    }
  }, [isOpen, showSidePanelRecommendationTooltip]);

  const actionMenu = async (id) => {
    switch (id) {
      case MenuEnum.LOCK:
        await keyRingStore.lock();
        dispatchGlobalEventExceptSelf("owallet_keyring_locked");
        break;
      case MenuEnum.ADD_TOKEN:
        navigate("/setting/token/list");
        break;
      case MenuEnum.ADDR_BOOK:
        navigate("/setting/contacts/list");
        break;

      case MenuEnum.MANAGE_CHAINS:
        if (keyRingStore.selectedKeyInfo) {
          analyticsStore.logEvent("click_menu_manageChainVisibility");
          browser.tabs
            .create({
              url: `/register.html#?route=enable-chains&vaultId=${keyRingStore.selectedKeyInfo.id}&skipWelcome=true`,
            })
            .then(() => {
              if (!isRunningInSidePanel()) {
                window.close();
              } else {
                close();
              }
            });
        }
        break;
      default:
    }
  };

  return (
    <Box
      height="100%"
      width="fit-content"
      alignX="left"
      backgroundColor={
        theme.mode === "light" ? ColorPalette.white : ColorPalette["gray-600"]
      }
      paddingTop="1.125rem"
      paddingX="1.75rem"
      paddingBottom="1.25rem"
      style={{
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Bleed horizontal="0.15rem">
        <Box alignX="left">
          <Box onClick={close} cursor="pointer">
            <CloseIcon
              width="1.5rem"
              height="1.5rem"
              color={
                theme.mode === "light"
                  ? ColorPalette["gray-200"]
                  : ColorPalette["gray-50"]
              }
            />
          </Box>
        </Box>
      </Bleed>
      <Gutter size="1.25rem" />

      <Stack gutter="1.5rem">
        {dataItem.map((item, index) => {
          return (
            <MenuItem
              key={index}
              title={item.name}
              onClick={() => actionMenu(item.id)}
              startIcon={item.icon}
              paragraph={item.value}
            />
          );
        })}

        {location.pathname !== "/setting" ? (
          <MenuItem
            key={"setting"}
            title={"Settings"}
            onClick={() => {
              navigate("/setting");
            }}
            startIcon={require("assets/svg/tdesign_adjustment.svg")}
          />
        ) : null}
      </Stack>

      <Styles.Flex1 />

      <Box width="100%" minWidth="14rem">
        <Bleed horizontal="0.5rem">
          {sidePanelSupported ? (
            <Box
              backgroundColor={
                theme.mode === "light"
                  ? ColorPalette["gray-10"]
                  : ColorPalette["gray-500"]
              }
              borderRadius="0.75rem"
              padding="0.75rem"
            >
              <XAxis alignY="center">
                <H5
                  color={
                    theme.mode === "light"
                      ? ColorPalette["gray-600"]
                      : ColorPalette["gray-50"]
                  }
                >
                  Display Configuration
                </H5>
                <div style={{ flex: 1 }} />
              </XAxis>
              <Gutter size="0.75rem" />
              <Columns sum={2}>
                <Column weight={1}>
                  <PanelModeItem
                    onClick={() => {
                      toggleSidePanelMode(!sidePanelEnabled, (res) => {
                        setSidePanelEnabled(res);

                        if (res) {
                          uiConfigStore.setShowNewSidePanelHeaderTop(false);
                        }
                      });
                    }}
                    animateSidePanelRecommendationTooltip={
                      animateSidePanelRecommendationTooltip
                    }
                    isSelected={sidePanelEnabled}
                    isSidePanel={true}
                    text={
                      <React.Fragment>
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 12 12"
                          fill="none"
                          stroke="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M7.5 1.5V10.5M3.9 1.5H8.1C8.94008 1.5 9.36012 1.5 9.68099 1.66349C9.96323 1.8073 10.1927 2.03677 10.3365 2.31901C10.5 2.63988 10.5 3.05992 10.5 3.9V8.1C10.5 8.94008 10.5 9.36012 10.3365 9.68099C10.1927 9.96323 9.96323 10.1927 9.68099 10.3365C9.36012 10.5 8.94008 10.5 8.1 10.5H3.9C3.05992 10.5 2.63988 10.5 2.31901 10.3365C2.03677 10.1927 1.8073 9.96323 1.66349 9.68099C1.5 9.36012 1.5 8.94008 1.5 8.1V3.9C1.5 3.05992 1.5 2.63988 1.66349 2.31901C1.8073 2.03677 2.03677 1.8073 2.31901 1.66349C2.63988 1.5 3.05992 1.5 3.9 1.5Z"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <Gutter size="0.25rem" />
                        <Subtitle4>Side Panel</Subtitle4>
                      </React.Fragment>
                    }
                  />
                </Column>
                <Gutter size="0.5rem" />
                <Column weight={1}>
                  <PanelModeItem
                    onClick={() => {
                      toggleSidePanelMode(!sidePanelEnabled, (res) => {
                        setSidePanelEnabled(res);

                        if (res) {
                          uiConfigStore.setShowNewSidePanelHeaderTop(false);
                        }
                      });
                    }}
                    isSidePanel={false}
                    isSelected={!sidePanelEnabled}
                    text={
                      <React.Fragment>
                        <svg
                          width="13"
                          height="12"
                          viewBox="0 0 13 12"
                          fill="none"
                          stroke="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M2.75 7H5.75M5.75 7V10M5.75 7L2.25 10.5M10.75 5H7.75M7.75 5V2M7.75 5L11.25 1.5"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <Gutter size="0.25rem" />
                        <Subtitle4> Modal</Subtitle4>
                      </React.Fragment>
                    }
                  />
                </Column>
              </Columns>
            </Box>
          ) : null}

          <Gutter size="1rem" />

          <Box
            width="6.5rem"
            style={{
              border: `1px solid ${
                theme.mode === "light"
                  ? ColorPalette["gray-100"]
                  : ColorPalette["gray-400"]
              }`,
            }}
          />

          <Gutter size="1rem" />

          <Box
            cursor="pointer"
            onClick={(e) => {
              e.preventDefault();
              browser.tabs.create({
                url: "https://chains.keplr.app/",
              });
            }}
          >
            <XAxis alignY="center">
              <Button2
                color={
                  theme.mode === "light"
                    ? ColorPalette["gray-200"]
                    : ColorPalette["gray-300"]
                }
              >
                <FormattedMessage id="page.main.components.menu-bar.go-to-keplr-chain-registry" />
              </Button2>

              <Gutter size="0.25rem" />

              <LinkIcon
                width="1.125rem"
                height="1.125rem"
                color={
                  theme.mode === "light"
                    ? ColorPalette["gray-200"]
                    : ColorPalette["gray-300"]
                }
              />
            </XAxis>
          </Box>
        </Bleed>
      </Box>
    </Box>
  );
});

const PanelModeItemStylesImageContainer = styled.div<{
  isSelected: boolean;
}>`
  transition: opacity 0.15s linear;

  opacity: ${(props) =>
    props.isSelected ? 1 : props.theme.mode === "light" ? 0.7 : 0.5};
  mix-blend-mode: luminosity;
`;

const PanelModeItemStylesTextContainer = styled(Box)<{
  isSelected: boolean;
}>`
  transition: color 0.15s linear;

  color: ${(props) => {
    if (props.theme.mode === "light") {
      return props.isSelected
        ? ColorPalette["purple-400"]
        : ColorPalette["gray-300"];
    }

    return props.isSelected
      ? ColorPalette["gray-50"]
      : ColorPalette["gray-300"];
  }};
`;

const PanelModeItemStylesContainer = styled(Box)<{
  isSelected: boolean;
}>`
  transition: background-color 0.15s linear, box-shadow 0.15s linear;

  background-color: ${(props) => {
    if (props.theme.mode === "light") {
      return props.isSelected
        ? "rgba(86, 111, 236, 0.10)"
        : ColorPalette["white"];
    }

    return props.isSelected
      ? "rgba(86, 111, 236, 0.10)"
      : ColorPalette["gray-450"];
  }};

  box-shadow: ${(props) => {
    if (props.theme.mode === "light") {
      return props.isSelected
        ? `0 0 0 1px ${ColorPalette["purple-300"]} inset`
        : `0 0 0 1px ${ColorPalette["gray-50"]} inset`;
    }

    return props.isSelected
      ? `0 0 0 1px ${ColorPalette["purple-300"]} inset`
      : "0 0 0 1px rgba(66, 66, 71, 0.20) inset";
  }};

  &:hover {
    background-color: ${(props) => {
      if (props.isSelected) {
        return;
      }

      return Color(ColorPalette["purple-300"]).alpha(0.05).toString();
    }};

    box-shadow: ${(props) => {
      if (props.isSelected) {
        return;
      }

      return `0 0 0 1px ${Color(ColorPalette["purple-300"])
        .alpha(0.5)
        .toString()} inset`;
    }};

    ${PanelModeItemStylesImageContainer} {
      opacity: 1;
    }

    ${PanelModeItemStylesTextContainer} {
      color: ${(props) => {
        if (props.theme.mode === "light") {
          return ColorPalette["purple-400"];
        }

        return ColorPalette["gray-50"];
      }};
    }
  }
`;

const PanelModeItemStylesTooltip = styled.div<{
  isMounted: boolean;
}>`
  transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);

  transform: ${(props) => (props.isMounted ? "scale(1)" : "scale(0)")};
  transform-origin: 50% 95%;
`;

const PanelModeItem: FunctionComponent<{
  isSelected: boolean;
  onClick: () => void;

  isSidePanel: boolean;
  text: React.ReactElement;

  animateSidePanelRecommendationTooltip?: boolean;
}> = ({
  isSelected,
  onClick,
  isSidePanel,
  text,
  animateSidePanelRecommendationTooltip,
}) => {
  const theme = useTheme();

  return (
    <PanelModeItemStylesContainer
      position="relative"
      isSelected={isSelected}
      borderRadius="0.5rem"
      paddingY="0.5rem"
      cursor={isSelected ? undefined : "pointer"}
      onClick={(e) => {
        e.preventDefault();

        if (!isSelected) {
          onClick();
        }
      }}
    >
      {animateSidePanelRecommendationTooltip ? <AnimatedTooltip /> : null}
      {isSidePanel ? <div>New</div> : <div>Classic</div>}
      <Box alignX="center">
        <Gutter size="0.5rem" />
        <PanelModeItemStylesTextContainer isSelected={isSelected}>
          <XAxis alignY="center">{text}</XAxis>
        </PanelModeItemStylesTextContainer>
      </Box>
    </PanelModeItemStylesContainer>
  );
};

const AnimatedTooltip: FunctionComponent = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <PanelModeItemStylesTooltip
      isMounted={isMounted}
      style={{
        position: "absolute",
        zIndex: 2,
        bottom: "105%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",

        whiteSpace: "nowrap",
      }}
    >
      <Box
        position="relative"
        backgroundColor={ColorPalette["purple-300"]}
        borderRadius="0.5rem"
      >
        <Box paddingX="0.75rem" paddingY="0.5rem">
          <Caption1 color={ColorPalette["gray-50"]}>
            Try the new mode ✨
          </Caption1>
        </Box>
        <div
          style={{
            position: "absolute",
            top: "99%",
            left: "50%",
            transform: "translateX(-50%)",
            lineHeight: 0,
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="13"
            height="7"
            fill="none"
            stroke="none"
            viewBox="0 0 13 7"
          >
            <path
              fill={ColorPalette["purple-300"]}
              d="M4.9 5.867a2 2 0 003.2 0L12.5 0H.5l4.4 5.867z"
            />
          </svg>
        </div>
      </Box>
    </PanelModeItemStylesTooltip>
  );
};
