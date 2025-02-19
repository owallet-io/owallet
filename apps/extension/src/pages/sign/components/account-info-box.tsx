import React, { FunctionComponent } from "react";
import { AddressChip } from "pages/main/components/address-chip";
import { ColorPalette } from "src/styles";
import { Subtitle3 } from "components/typography";
import styled from "styled-components";
import { useStore } from "stores/index";

const Styles = {
  Marquee: styled.div<{}>`
    @keyframes marquee {
      0% {
        transform: translateX(10%);
      }
      100% {
        transform: translateX(-100%);
      }
    }
    overflow: hidden;
    white-space: nowrap;
    box-sizing: border-box;
    padding: 10px 0;
    position: relative;
    width: 90%;
  `,
  MarqueeText: styled.div<{}>`
    display: inline-block;
    animation: marquee 15s linear infinite;
    font-weight: 500;
    font-size: 0.875rem;
  `,
};

export const AccountInfoBox: FunctionComponent<{ chainId }> = ({ chainId }) => {
  const { keyRingStore } = useStore();
  return (
    <div
      style={{
        borderTop: "1px solid" + ColorPalette["gray-100"],
        marginTop: 8,
      }}
    >
      <div
        style={{
          flexDirection: "row",
          display: "flex",
          padding: 8,
          justifyContent: "space-between",
          backgroundColor: ColorPalette["gray-50"],
          borderRadius: 12,
          marginTop: 8,
        }}
      >
        <div
          style={{
            flexDirection: "row",
            display: "flex",
            alignItems: "center",
          }}
        >
          <img
            style={{
              width: 40,
              height: 40,
              borderRadius: 40,
              marginRight: 8,
            }}
            src={require("assets/images/default-avatar.png")}
          />
          <div
            style={{ flexDirection: "column", display: "flex", width: "20%" }}
          >
            {keyRingStore.selectedKeyInfo?.name.length > 15 ? (
              <Styles.Marquee>
                <Styles.MarqueeText>
                  {keyRingStore.selectedKeyInfo?.name}
                </Styles.MarqueeText>
              </Styles.Marquee>
            ) : (
              <Subtitle3>{keyRingStore.selectedKeyInfo?.name}</Subtitle3>
            )}
            <AddressChip chainId={chainId} />
          </div>
        </div>
      </div>
    </div>
  );
};
