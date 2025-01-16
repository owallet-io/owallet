import React, { FunctionComponent, useRef, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { Box } from "../../../../components/box";
import { ColorPalette } from "../../../../styles";
import { useTheme } from "styled-components";
import { Gutter } from "../../../../components/gutter";
import { H4, Subtitle3 } from "../../../../components/typography";
import { XAxis } from "../../../../components/axis";
import { useStore } from "../../../../stores";
import { ChainImageFallback } from "../../../../components/image";
import { AddressChip } from "../../components/address-chip";
import { Button } from "../../../../components/button";
import QRCode from "qrcode";
import {BtcAccountBase} from "@owallet/stores-btc";

export const ReceiveModal: FunctionComponent<{
  chainId: string;
  coinMinimalDenom:string;
  close: () => void;
}> = observer(({ chainId, close,coinMinimalDenom }) => {
  const { chainStore, allAccountStore } = useStore();

  const theme = useTheme();
  const qrCodeRef = useRef<HTMLCanvasElement>(null);

  const modularChainInfo = chainStore.getModularChain(chainId);
  const account = allAccountStore.getAccount(chainId);

  useEffect(() => {
    // const isEVMOnlyChain =
    //   "cosmos" in modularChainInfo &&
    //   modularChainInfo.cosmos != null &&
    //   chainStore.isEvmOnlyChain(chainId);

    const address = coinMinimalDenom.startsWith("legacy") && chainId === "bitcoin"?(account as BtcAccountBase).btcLegacyAddress :account.addressDisplay;

    if (qrCodeRef.current && address) {
      QRCode.toCanvas(qrCodeRef.current, address, {
        width: 280,
      });
    }
  }, [modularChainInfo, chainId]);

  return (
    <Box
      backgroundColor={
        theme.mode === "light" ? ColorPalette.white : ColorPalette["gray-600"]
      }
    >
      <Box alignX="center">
        <Gutter size="1.75rem" />
        <H4
          color={
            theme.mode === "light"
              ? ColorPalette["black"]
              : ColorPalette["white"]
          }
        >
          Copy Address
        </H4>
        <Gutter size="1.25rem" />
        <XAxis alignY="center">
          <ChainImageFallback chainInfo={modularChainInfo} size="2rem" />
          <Gutter size="0.5rem" />
          <Subtitle3
            color={
              theme.mode === "light"
                ? ColorPalette["black"]
                : ColorPalette["gray-10"]
            }
          >
            {modularChainInfo.chainName}
          </Subtitle3>
        </XAxis>
        <Gutter size="0.875rem" />
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
        <AddressChip address={coinMinimalDenom.startsWith("legacy") && chainId === "bitcoin"?(account as BtcAccountBase).btcLegacyAddress :account.addressDisplay} chainId={chainId} inModal={true} />
        <Gutter size="1.25rem" />
      </Box>

      <Box padding="0.75rem" paddingTop="0">
        <Button color="secondary" text="Close" size="large" onClick={close} />
      </Box>
    </Box>
  );
});
