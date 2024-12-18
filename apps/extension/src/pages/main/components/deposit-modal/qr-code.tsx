import React, { FunctionComponent, useRef, useEffect } from "react";
import { Box } from "../../../../components/box";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../../stores";
import { useSceneTransition } from "../../../../components/transition";
import { Column, Columns } from "../../../../components/column";
import { IconButton } from "../../../../components/icon-button";
import { ChainImageFallback } from "../../../../components/image";
import { Gutter } from "../../../../components/gutter";
import { Subtitle2 } from "../../../../components/typography";
import { ColorPalette } from "../../../../styles";
import { useTheme } from "styled-components";
import { IconProps } from "../../../../components/icon/types";
import { YAxis } from "../../../../components/axis";
import QRCode from "qrcode";
import { AddressChip } from "../../components/address-chip";

export const QRCodeScene: FunctionComponent<{
  chainId: string;
  address?: string;
}> = observer(({ chainId, address }) => {
  const { chainStore } = useStore();

  const theme = useTheme();
  const qrCodeRef = useRef<HTMLCanvasElement>(null);
  const modularChainInfo = chainStore.getModularChain(chainId);

  useEffect(() => {
    if (qrCodeRef.current && address) {
      QRCode.toCanvas(qrCodeRef.current, address, {
        width: 280,
      });
    }
  }, [modularChainInfo, chainId, address]);
  const sceneTransition = useSceneTransition();

  if (!address) {
    return null;
  }

  return (
    <Box
      paddingTop="1.25rem"
      paddingX="0.75rem"
      backgroundColor={
        theme.mode === "light" ? ColorPalette.white : ColorPalette["gray-600"]
      }
    >
      <Box paddingX="0.5rem" alignY="center">
        <Columns sum={2} alignY="center">
          <IconButton
            padding="0.25rem"
            onClick={() => {
              sceneTransition.pop();
            }}
            hoverColor={
              theme.mode === "light"
                ? ColorPalette["gray-50"]
                : ColorPalette["gray-500"]
            }
          >
            <ArrowLeftIcon
              width="1.5rem"
              height="1.5rem"
              color={
                theme.mode === "light"
                  ? ColorPalette["gray-200"]
                  : ColorPalette["gray-300"]
              }
            />
          </IconButton>

          <Column weight={1} />

          <ChainImageFallback chainInfo={modularChainInfo} size="2rem" />
          <Gutter size="0.5rem" />
          <Subtitle2>{modularChainInfo.chainName}</Subtitle2>

          <Column weight={1} />
          <Box width="2rem" height="2rem" />
        </Columns>

        <Gutter size="1.5rem" />
        <YAxis alignX="center">
          <Box
            alignX="center"
            alignY="center"
            backgroundColor="white"
            borderRadius="1.25rem"
            padding="0.75rem"
          >
            <canvas
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: 24,
              }}
              id="qrcode"
              ref={qrCodeRef}
            />
          </Box>
          <Gutter size="1.25rem" />
          <AddressChip chainId={chainId} address={address} inModal={true} />
          <Gutter size="1.25rem" />
        </YAxis>
      </Box>
    </Box>
  );
});

const ArrowLeftIcon: FunctionComponent<IconProps> = ({
  width = "1.5rem",
  height = "1.5rem",
  color,
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        fill="none"
        stroke={color || "currentColor"}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.5"
        d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
      />
    </svg>
  );
};
