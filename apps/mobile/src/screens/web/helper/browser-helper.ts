import images from "@src/assets/images";
import { capitalizedText, limitString } from "@src/utils/helper";

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
  // {
  //   images: images.img_airight,
  //   logo: images.dapps_airight_logo,
  //   title: "aiRight",
  //   subTitle: "Marketplace of Generative AI",
  //   url: "https://airight.io/",
  // },
  // {
  //   images: images.img_defi_lens,
  //   logo: images.dapps_defi_logo,
  //   title: "DeFi Lens",
  //   subTitle: "Simplify your Token Research with AI",
  //   url: "https://layer.orai.io/",
  // },
  // {
  //   images: images.img_chatbot,
  //   logo: images.dapps_llm_logo,
  //   title: "LLM Chatbot",
  //   subTitle: "Natural language layer for Web3 Business",
  //   url: "https://layer.orai.io/",
  // },
];
export const defiData = [
  {
    images: images.img_oraidex,
    logo: images.dapps_dex_logo,
    title: "OraiDEX",
    subTitle: "Universal swap, Bridge and earn tokens",
    url: "https://app.oraidex.io/",
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

export const getFavicon = (url) => {
  const serviceGG =
    "https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&size=32&url=";
  if (!url) return serviceGG + "https://orai.io";
  return serviceGG + url;
};
export const dataBookMarks = [
  {
    url: getFavicon("https://app.oraidex.io"),
    name: "oraidex",
    link: "https://app.oraidex.io",
  },
  {
    url: getFavicon("https://orai.io"),
    name: "oraichain",
    link: "https://orai.io",
  },
];

function extractDomainName(url) {
  if (!url) return;
  let domain = null;
  const withoutProtocol = url.replace(/^https?:\/\//, "");
  const withoutPath = withoutProtocol.split("/")[0];
  let parts = withoutPath.split(".");
  if (parts[0] === "www") {
    parts.shift();
  }
  parts.pop();
  domain = parts.join(" ");
  return capitalizedText(limitString(domain, 16));
}

export const getNameBookmark = (name: string) => {
  if (!name) return;
  const bookmarkName = name.toLowerCase();
  if (name.startsWith("http")) {
    return extractDomainName(bookmarkName);
  }
  return capitalizedText(limitString(bookmarkName, 16));
};
