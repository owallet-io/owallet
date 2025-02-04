import { InteractionWaitingData } from "@owallet/background";
import { isRunningInSidePanel } from "./side-panel";

export const setInteractionDataHref = (
  interactionData: InteractionWaitingData
) => {
  if (interactionData.uri === "/unlock") {
    return;
  }

  const wasInteraction = window.location.href.includes("interaction=true");

  const queryString = `interaction=true&interactionInternal=${interactionData.isInternal}`;

  console.log("queryString", queryString);

  let uri = interactionData.uri;

  if (uri.startsWith("/")) {
    uri = uri.slice(1);
  }

  let url = browser.runtime.getURL(
    `/${isRunningInSidePanel() ? "sidePanel" : "popup"}.html#/` + uri
  );

  if (url.includes("?")) {
    url += "&" + queryString;
  } else {
    url += "?" + queryString;
  }

  console.log("was here", url, wasInteraction);
  // alert(url);

  if (wasInteraction) {
    window.location.replace(url);
  } else {
    window.location.href = url;
  }
};
