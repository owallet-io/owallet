import React, { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { KeyRingStatus } from "@owallet/background";
import { useStore } from "../../stores";
import { HomePage } from "../../pages/home/home-page";
import { LockPage } from "../../pages/lock";
import { Banner } from "../../components/banner";

let hasLoadedOnce = false;

export const StateRenderer: React.FC = observer(() => {
  const { keyRingStore, permissionStore, signInteractionStore } = useStore();
  const [isLoading, setIsLoading] = useState(!hasLoadedOnce);

  console.log("permissionStore.waitingData", permissionStore.waitingDatas);
  console.log(
    "signInteractionStore.waitingData",
    signInteractionStore.waitingData
  );

  useEffect(() => {
    if (!hasLoadedOnce) {
      const timer = setTimeout(() => {
        setIsLoading(false);
        hasLoadedOnce = true;
      }, 50);
      return () => clearTimeout(timer);
    }
  }, []);

  if (isLoading) {
    return null;
  }

  if (
    keyRingStore.persistent ||
    keyRingStore.status === KeyRingStatus.UNLOCKED
  ) {
    return <HomePage />;
  } else if (keyRingStore.status === KeyRingStatus.LOCKED) {
    return <LockPage />;
  } else if (keyRingStore.status === KeyRingStatus.EMPTY) {
    browser.tabs.create({
      url: "/popup.html#/register",
    });
    window.close();
    return <BannerComponent />;
  } else if (keyRingStore.status === KeyRingStatus.NOTLOADED) {
    return <BannerComponent />;
  } else {
    return <div>Unknown status</div>;
  }
});

const BannerComponent: React.FC = () => (
  <div style={{ height: "100%" }}>
    <Banner
      icon={require("../../public/assets/images/img_owallet.png")}
      logo={require("../../public/assets/orai_wallet_logo.png")}
      subtitle="UNIVERSAL"
      subtitle2="WEB3 GATEWAY"
    />
  </div>
);
