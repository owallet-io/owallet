import React, { useState } from "react";
import { FooterLayout } from "../../layouts/footer-layout/footer-layout";
import styles from "./explore.module.scss";
import classnames from "classnames";
import images from "mobile/src/assets/images";
import { limitString } from "@owallet/common";

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
export const explorerData = [
  {
    images: images.img_scan,
    logo: images.dapps_scan_logo,
    title: "Oraichain Scan",
    subTitle: "The Oraichain blockchain explorer",
    url: "https://scan.orai.io/",
  },
];
export const aiData = [
  {
    images: images.img_airight,
    logo: images.dapps_airight_logo,
    title: "aiRight",
    subTitle: "Marketplace of Generative AI",
    url: "https://airight.io/",
  },
  {
    images: images.img_defi_lens,
    logo: images.dapps_defi_logo,
    title: "DeFi Lens",
    subTitle: "Simplify your Token Research with AI",
    url: "https://layer.orai.io/",
  },
  {
    images: images.img_chatbot,
    logo: images.dapps_llm_logo,
    title: "LLM Chatbot",
    subTitle: "Natural language layer for Web3 Business",
    url: "https://layer.orai.io/",
  },
];
export const defiData = [
  {
    images: images.img_oraidex,
    logo: images.dapps_dex_logo,
    title: "OraiDEX",
    subTitle: "Universal swap, Bridge and earn tokens",
    url: "https://oraidex.io/",
  },
  {
    images: images.img_homebase,
    logo: images.dapps_gpu_logo,
    title: "GPU Staking",
    subTitle: "Compound staking to earn GPU demand and block rewards",
    url: "https://hub.orai.io/gpu-staking",
  },
  {
    images: images.img_orderbook,
    logo: images.dapps_orderbook_logo,
    title: "Orderbook",
    subTitle: "Decentralized spot trading",
    url: "https://orderbook.oraidex.io/",
  },
  {
    images: images.img_fu,
    logo: images.dapps_future_logo,
    title: "Futures",
    subTitle: "Derivatives Trading",
    url: "https://futures.oraidex.io/",
  },
  {
    images: images.img_orchai,
    logo: images.dapps_orchai_logo,
    title: "Orchai",
    subTitle: "Low-code DeFi Management",
    url: "https://app.orchai.io/",
  },
];
export const dataAll = [
  {
    images: images.img_homebase,
    logo: images.dapps_oraichain_logo,
    title: "Homebase",
    subTitle: "Start your Oraichain journey now",
    url: "https://hub.orai.io/",
  },
  ...defiData,
  ...explorerData,
  ...aiData,
];
export const ExplorePage = () => {
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
    <FooterLayout>
      <div className={styles.container}>
        <span className={styles.title}>Ecosystem</span>
        <br />
        <span className={styles.titleEco}>Oraichain</span>
        <div className={styles.containerTypeNetwork}>
          {types.map((item, index) => (
            <div
              onClick={() => activeTab(item)}
              key={item.id}
              className={classnames([
                styles.itemTypeNetwork,
                tab.id === item.id
                  ? styles.activeBorderBottom
                  : styles.inactiveBorderBottom,
              ])}
            >
              <span
                className={classnames([
                  styles.titleTxtItem,
                  tab.id === item.id
                    ? styles.activeTxtColor
                    : styles.inactiveTxtColor,
                ])}
              >
                {item.title}
              </span>
            </div>
          ))}
        </div>
        <div className={styles.listExplore}>
          {checkTab(tab).map((item, index) => {
            return (
              <div
                onClick={() => window.open(item.url)}
                key={index}
                style={{
                  backgroundImage: `url(${item.images})`,
                }}
                className={styles.itemExplore}
              >
                <img className={styles.imgIcon} src={item.logo} />
                <span className={styles.titleItem}>{item.title}</span>
                <span className={styles.subTitleItem}>
                  {limitString(item.subTitle, 30)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </FooterLayout>
  );
};
