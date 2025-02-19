import React, { FunctionComponent, PropsWithChildren } from "react";
import { GlobalSimpleBarProvider } from "./hooks/global-simplebar";
import { Link, useLocation } from "react-router-dom";
import { ColorPalette } from "./styles";
import { useTheme } from "styled-components";
import { YAxis } from "./components/axis";
import { Caption2 } from "./components/typography";
import { Box } from "./components/box";

export const BottomTabsHeightRem = "3.75rem";

const BottomTabActiveStateContext = React.createContext<{
  isActive: boolean;
} | null>(null);

export const BottomTabsRouteProvider: FunctionComponent<
  PropsWithChildren<{
    isNotReady: boolean;

    tabs: {
      pathname: string;
      icon: React.ReactNode;
      text: string;
    }[];

    forceHideBottomTabs?: boolean;
  }>
> = ({ children, isNotReady, tabs, forceHideBottomTabs }) => {
  const location = useLocation();

  const theme = useTheme();

  const shouldBottomTabsShown =
    !forceHideBottomTabs &&
    tabs.find((tab) => tab.pathname === location.pathname);

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          flex: 1,
          overflow: "hidden",
        }}
      >
        <GlobalSimpleBarProvider style={{ height: "100%" }}>
          {children}
        </GlobalSimpleBarProvider>
      </div>
      {shouldBottomTabsShown ? (
        <div
          style={{
            height: BottomTabsHeightRem,
            backgroundColor:
              theme.mode === "light"
                ? ColorPalette["white"]
                : ColorPalette["gray-700"],
            borderTopStyle: "solid",
            borderTopWidth: "1px",
            borderTopColor:
              theme.mode === "light"
                ? ColorPalette["gray-100"]
                : ColorPalette["gray-600"],

            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-evenly",

            zIndex: 999999,
          }}
        >
          {tabs.map((tab, i) => {
            const isActive = tab.pathname === location.pathname;

            return (
              <Box
                key={i}
                style={{
                  width: "1px",
                }}
              >
                <Link
                  to={tab.pathname}
                  style={{
                    textDecoration: "none",
                  }}
                >
                  <div
                    style={{
                      position: "relative",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      opacity: isNotReady ? 0 : 1,
                      color: (() => {
                        if (theme.mode === "light") {
                          return isActive
                            ? ColorPalette["purple-400"]
                            : ColorPalette["gray-100"];
                        }

                        return isActive
                          ? ColorPalette["white"]
                          : ColorPalette["gray-400"];
                      })(),
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        minWidth: "2.875rem",
                        height: "100%",
                      }}
                    />
                    <YAxis alignX="center">
                      <BottomTabActiveStateContext.Provider
                        value={{
                          isActive,
                        }}
                      >
                        <Box>{tab.icon}</Box>
                        <Caption2
                          style={{
                            textDecoration: "none",
                            whiteSpace: "nowrap",
                            wordBreak: "keep-all",
                          }}
                          color={(() => {
                            if (theme.mode === "light") {
                              return isActive
                                ? ColorPalette["purple-400"]
                                : ColorPalette["gray-200"];
                            }

                            return isActive
                              ? ColorPalette["white"]
                              : ColorPalette["gray-300"];
                          })()}
                        >
                          {tab.text}
                        </Caption2>
                      </BottomTabActiveStateContext.Provider>
                    </YAxis>
                  </div>
                </Link>
              </Box>
            );
          })}
        </div>
      ) : null}
    </div>
  );
};

const useIsTabActive = () => {
  const context = React.useContext(BottomTabActiveStateContext);
  if (context == null) {
    throw new Error(
      "useIsTabActive must be used within BottomTabActiveStateContext"
    );
  }
  return context.isActive;
};

export const BottomTabHomeIcon: FunctionComponent<{
  width: string;
  height: string;
}> = ({ width, height }) => {
  const isActive = useIsTabActive();

  return isActive ? (
    <img
      src={require("assets/images/assets-light-active.png")}
      alt="assets logo"
      style={{
        width: width ?? 19,
      }}
    />
  ) : (
    <img
      src={require("assets/images/assets-light-inactive.png")}
      alt="assets logo"
      style={{
        width: width ?? 19,
      }}
    />
  );
};

export const BottomTabExploreIcon: FunctionComponent<{
  width: string;
  height: string;
}> = ({ width, height }) => {
  const isActive = useIsTabActive();

  return isActive ? (
    <img
      src={require("assets/images/explore-light-active.png")}
      alt="explore logo"
      style={{
        width: width ?? 19,
      }}
    />
  ) : (
    <img
      src={require("assets/images/explore-light-inactive.png")}
      alt="explore logo"
      style={{
        width: width ?? 19,
      }}
    />
  );
};

export const BottomTabActivityIcon: FunctionComponent<{
  width: string;
  height: string;
}> = ({ width, height }) => {
  const isActive = useIsTabActive();

  return isActive ? (
    <img
      src={require("assets/images/history-light-active.png")}
      alt="History logo"
      style={{
        width: width ?? 19,
      }}
    />
  ) : (
    <img
      src={require("assets/images/history-light-inactive.png")}
      alt="History logo"
      style={{
        width: width ?? 19,
      }}
    />
  );
};

export const BottomTabSettingIcon: FunctionComponent<{
  width: string;
  height: string;
}> = ({ width, height }) => {
  const isActive = useIsTabActive();

  return isActive ? (
    <svg
      width="21"
      height="20"
      viewBox="0 0 21 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clip-path="url(#clip0_3375_14907)">
        <mask
          id="mask0_3375_14907"
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          width="21"
          height="20"
        >
          <path d="M20.5 0H0.5V20H20.5V0Z" fill="white" />
        </mask>
        <g mask="url(#mask0_3375_14907)">
          <path
            d="M17.55 9.27008L19.61 7.45008L17.26 3.38008L14.66 4.26008C14.26 3.98008 13.84 3.73008 13.39 3.53008L12.85 0.830078H8.15001L7.61001 3.53008C7.16002 3.73008 6.74002 3.98008 6.34001 4.26008L3.74001 3.38008L1.39001 7.45008L3.45001 9.27008C3.40001 9.75008 3.40001 10.2501 3.45001 10.7301L1.39001 12.5501L3.74001 16.6201L6.34001 15.7401C6.74002 16.0201 7.16002 16.2701 7.61001 16.4701L8.15001 19.1701H12.85L13.39 16.4701C13.84 16.2701 14.26 16.0201 14.66 15.7401L17.26 16.6201L19.61 12.5501L17.55 10.7301C17.6 10.2501 17.6 9.75008 17.55 9.27008ZM13.43 12.9901C13.1 13.3101 12.71 13.5901 12.27 13.7801C12.16 13.8401 12.05 13.8901 11.94 13.9201C11.86 13.9601 11.78 13.9801 11.7 14.0001C11.31 14.1201 10.91 14.1801 10.5 14.1801C10.09 14.1801 9.69001 14.1201 9.31002 14.0101C9.23002 13.9901 9.14002 13.9601 9.06002 13.9201C8.94002 13.8901 8.84001 13.8401 8.73001 13.7801C8.30001 13.5901 7.91002 13.3101 7.57001 12.9901L7.55001 12.9701C7.00001 12.4201 6.59001 11.7201 6.42001 10.9401C6.40001 10.8701 6.39002 10.7901 6.38001 10.7101C6.33001 10.4801 6.31001 10.2401 6.31001 10.0001C6.31001 9.76008 6.33001 9.52008 6.38001 9.29008C6.38001 9.21008 6.40001 9.13008 6.42001 9.06008C6.60001 8.27008 7.00001 7.57008 7.55001 7.03008L7.57001 7.01008C7.82001 6.76008 8.10001 6.55008 8.41001 6.39008C8.70001 6.21008 9.00001 6.08008 9.33001 5.99008C9.70002 5.88008 10.09 5.82008 10.5 5.82008C10.91 5.82008 11.31 5.88008 11.69 5.99008C12.01 6.08008 12.31 6.21008 12.59 6.39008C12.9 6.55008 13.18 6.77008 13.43 7.01008L13.45 7.03008C14 7.58008 14.41 8.28008 14.58 9.06008C14.6 9.13008 14.61 9.21008 14.62 9.29008C14.67 9.52008 14.69 9.76008 14.69 10.0001C14.69 10.2401 14.67 10.4801 14.62 10.7101C14.62 10.7901 14.6 10.8701 14.58 10.9401C14.4 11.7301 14 12.4301 13.45 12.9701L13.43 12.9901Z"
            fill="#5C00A3"
          />
          <path
            d="M10.5 12.5C11.8807 12.5 13 11.3807 13 10C13 8.61929 11.8807 7.5 10.5 7.5C9.11929 7.5 8 8.61929 8 10C8 11.3807 9.11929 12.5 10.5 12.5Z"
            fill="#90B51B"
          />
        </g>
      </g>
      <defs>
        <clipPath id="clip0_3375_14907">
          <rect
            width="20"
            height="20"
            fill="white"
            transform="translate(0.5)"
          />
        </clipPath>
      </defs>
    </svg>
  ) : (
    <svg
      width="21"
      height="20"
      viewBox="0 0 21 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8.15001 0.833252H12.85L13.3892 3.53075C13.8356 3.73076 14.2601 3.97652 14.6558 4.26409L17.2633 3.38159L19.6133 7.45159L17.5458 9.26825C17.5959 9.75475 17.5959 10.2451 17.5458 10.7316L19.6125 12.5483L17.2633 16.6183L14.6558 15.7366C14.26 16.0238 13.8356 16.2693 13.3892 16.4691L12.8492 19.1666H8.15001L7.61084 16.4691C7.16442 16.2691 6.73993 16.0233 6.34417 15.7358L3.73667 16.6183L1.38667 12.5483L3.45417 10.7316C3.40417 10.2451 3.40417 9.75475 3.45417 9.26825L1.38751 7.45159L3.73751 3.38159L6.34417 4.26325C6.73995 3.97597 7.16444 3.73049 7.61084 3.53075L8.15001 0.833252ZM9.51667 2.49992L9.06501 4.75409L8.62751 4.91492C8.04765 5.12887 7.50874 5.4406 7.03417 5.83659L6.67584 6.13575L4.49667 5.39825L3.51334 7.10159L5.24001 8.61909L5.16084 9.07825C5.05634 9.68825 5.05634 10.3116 5.16084 10.9216L5.24001 11.3799L3.51251 12.8983L4.49584 14.6016L6.67584 13.8641L7.03417 14.1633C7.509 14.5589 8.04784 14.8706 8.62751 15.0849L9.06501 15.2458L9.51667 17.4999H11.4833L11.935 15.2458L12.3725 15.0849C12.9524 14.8709 13.4913 14.5592 13.9658 14.1633L14.3242 13.8641L16.5042 14.6016L17.4875 12.8983L15.7608 11.3808L15.8392 10.9216C15.9436 10.3116 15.9436 9.68826 15.8392 9.07825L15.7608 8.61992L17.4875 7.10159L16.5042 5.39825L14.3242 6.13575L13.9658 5.83659C13.4913 5.44058 12.9524 5.12884 12.3725 4.91492L11.935 4.75409L11.4833 2.49992H9.51667ZM10.5 7.49992C9.83696 7.49992 9.20108 7.76331 8.73224 8.23215C8.2634 8.70099 8.00001 9.33688 8.00001 9.99992C8.00001 10.663 8.2634 11.2988 8.73224 11.7677C9.20108 12.2365 9.83696 12.4999 10.5 12.4999C11.163 12.4999 11.7989 12.2365 12.2678 11.7677C12.7366 11.2988 13 10.663 13 9.99992C13 9.33688 12.7366 8.70099 12.2678 8.23215C11.7989 7.76331 11.163 7.49992 10.5 7.49992ZM6.33334 9.99992C6.33334 8.89485 6.77233 7.83504 7.55373 7.05364C8.33513 6.27224 9.39494 5.83325 10.5 5.83325C11.6051 5.83325 12.6649 6.27224 13.4463 7.05364C14.2277 7.83504 14.6667 8.89485 14.6667 9.99992C14.6667 11.105 14.2277 12.1648 13.4463 12.9462C12.6649 13.7276 11.6051 14.1666 10.5 14.1666C9.39494 14.1666 8.33513 13.7276 7.55373 12.9462C6.77233 12.1648 6.33334 11.105 6.33334 9.99992Z"
        fill="#242325"
      />
    </svg>
  );
};
