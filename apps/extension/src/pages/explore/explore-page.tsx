import React, { useState } from "react";
import images from "assets/images";
import { limitString } from "@owallet/common";
import { MainHeaderLayout } from "../main/layouts/header";
import { Box } from "../../components/box";
import { Stack } from "../../components/stack";
import styled, { css, useTheme } from "styled-components";
import { ColorPalette } from "../../styles";
import Color from "color";

const types = [
  {
    title: "All",
    id: 1,
  },
  {
    title: "DeFi",
    id: 2,
  },
  {
    title: "AI",
    id: 3,
  },
  {
    title: "Explore",
    id: 4,
  },
];
const ref = "?ref=owallet-extension";
export const explorerData = [
  {
    images: images.img_scan,
    logo: images.dapps_scan_logo,
    title: "Oraichain Scan",
    subTitle: "The Oraichain blockchain explorer",
    url: "https://scan.orai.io/" + ref,
  },
];
export const aiData = [
  {
    images: images.img_airight,
    logo: images.dapps_airight_logo,
    title: "aiRight",
    subTitle: "Marketplace of Generative AI",
    url: "https://airight.io/" + ref,
  },
  {
    images: images.img_defi_lens,
    logo: images.dapps_defi_logo,
    title: "DeFi Lens",
    subTitle: "Simplify your Token Research with AI",
    url: "https://layer.orai.io/" + ref,
  },
  {
    images: images.img_chatbot,
    logo: images.dapps_llm_logo,
    title: "LLM Chatbot",
    subTitle: "Natural language layer for Web3 Business",
    url: "https://layer.orai.io/" + ref,
  },
];
export const defiData = [
  {
    images: images.img_oraidex,
    logo: images.dapps_dex_logo,
    title: "OraiDEX",
    subTitle: "Universal swap, Bridge and earn tokens",
    url: "https://app.oraidex.io/" + ref,
  },
  {
    images: images.img_homebase,
    logo: images.dapps_gpu_logo,
    title: "GPU Staking",
    subTitle: "Compound staking to earn GPU demand and block rewards",
    url: "https://hub.orai.io/gpu-staking" + ref,
  },
  {
    images: images.img_orderbook,
    logo: images.dapps_orderbook_logo,
    title: "Orderbook",
    subTitle: "Decentralized spot trading",
    url: "https://orderbook.oraidex.io/" + ref,
  },
  {
    images: images.img_fu,
    logo: images.dapps_future_logo,
    title: "Futures",
    subTitle: "Derivatives Trading",
    url: "https://futures.oraidex.io/" + ref,
  },
  {
    images: images.img_orchai,
    logo: images.dapps_orchai_logo,
    title: "Orchai",
    subTitle: "Low-code DeFi Management",
    url: "https://app.orchai.io/" + ref,
  },
];
export const dataAll = [
  {
    images: images.img_homebase,
    logo: images.dapps_oraichain_logo,
    title: "Homebase",
    subTitle: "Start your Oraichain journey now",
    url: "https://hub.orai.io/" + ref,
  },
  ...defiData,
  ...explorerData,
  ...aiData,
];

const Styles = {
  Container: styled.div<{ isNotReady?: boolean }>`
    background-color: ${(props) =>
      props.theme.mode === "light"
        ? props.isNotReady
          ? ColorPalette["skeleton-layer-0"]
          : ColorPalette.white
        : ColorPalette["gray-650"]};

    border-top-left-radius: 24px;
    border-top-right-radius: 24px;
    height: 100%;
    margin: 0 -16px;
    padding: 16px 0;
  `,
  Title: styled.span`
    color: ${ColorPalette["gray-650"]};
    font-size: 16px;
    font-weight: 400;
  `,
  TitleEco: styled.div`
    color: ${ColorPalette["purple-600"]};
    font-size: 22px;
    font-weight: 700;
  `,
  ContainerTypeNetwork: styled.div`
    padding-top: 8px;
    display: flex;
    flex-direction: row;
  `,
  ItemTypeNetwork: styled.div<{ active?: boolean }>`
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 10px;
    cursor: pointer;
    border-bottom: ${(props) => (props.active ? `2px` : `0`)} solid
      ${(props) =>
        props.active ? ColorPalette["purple-400"] : ColorPalette["gray-400"]};
  `,
  TitleTxtItem: styled.div<{ active?: boolean }>`
    font-weight: 600;
    line-height: 24px;
    font-size: 16px;
    color: ${(props) => {
      return props.active
        ? ColorPalette["purple-400"]
        : ColorPalette["gray-400"];
    }};
  `,
  ListExplore: styled.div`
    padding: 16px;
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  `,
  ItemExplore: styled.div`
    height: 142px;
    display: flex;
    cursor: pointer;
    flex-direction: column;
    justify-content: center;
    flex: calc(50% - 16px);
    border-radius: 8px;
    padding: 16px;
    background-repeat: no-repeat;
    background-size: cover;
    background-position: center center;
  `,
  TitleItem: styled.div`
    color: ${ColorPalette["gray-10"]};
    font-size: 16px;
    font-weight: 600;
    line-height: 24px;
  `,
  SubTitleItem: styled.div`
    color: ${ColorPalette["gray-50"]};
    font-size: 13px;
    font-weight: 400;
    line-height: 18px;
  `,
};

export const ExplorePage = () => {
  const theme = useTheme();

  const [tab, setTab] = useState(types[0]);
  const activeTab = (item) => {
    setTab(item);
  };
  const checkTab = (tab) => {
    switch (tab.id) {
      case types[1].id:
        return defiData;
      case types[2].id:
        return aiData;
      case types[3].id:
        return explorerData;
      default:
        return dataAll;
    }
  };
  return (
    <MainHeaderLayout>
      <Box paddingX="0.75rem" paddingBottom="1.5rem">
        <Stack gutter="0.75rem">
          <div>
            <Styles.TitleEco>
              Oraichain <Styles.Title>Ecosystem</Styles.Title>
            </Styles.TitleEco>

            <Styles.ContainerTypeNetwork>
              {types.map((item, index) => (
                <Styles.ItemTypeNetwork
                  active={tab.id === item.id}
                  onClick={() => activeTab(item)}
                  key={item.id}
                >
                  <Styles.TitleTxtItem active={tab.id === item.id}>
                    {item.title}
                  </Styles.TitleTxtItem>
                </Styles.ItemTypeNetwork>
              ))}
            </Styles.ContainerTypeNetwork>
            <Styles.ListExplore>
              {checkTab(tab).map((item, index) => {
                return (
                  <Styles.ItemExplore
                    onClick={() => window.open(item.url)}
                    key={index}
                    style={{
                      backgroundImage: `url(${item.images})`,
                    }}
                  >
                    <img width={32} height={32} src={item.logo} />
                    <Styles.Title>{item.title}</Styles.Title>
                    <Styles.SubTitleItem>
                      {limitString(item.subTitle, 30)}
                    </Styles.SubTitleItem>
                  </Styles.ItemExplore>
                );
              })}
            </Styles.ListExplore>
          </div>
        </Stack>
      </Box>
    </MainHeaderLayout>
  );
};
