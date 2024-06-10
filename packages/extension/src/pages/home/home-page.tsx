import React from "react";
import { FooterLayout } from "../../layouts/footer-layout/footer-layout";
import { observer } from "mobx-react-lite";
import { InfoAccountCard } from "./components/info-account-card";
import { TokensCard } from "./components/tokens-card";
import { ClaimReward } from "./components/claim-reward";

export const HomePage = observer(() => {
  return (
    <FooterLayout>
      <InfoAccountCard />
      {/*TODO:// need check again Claim reward */}
      {/*<ClaimReward />*/}
      <TokensCard />
    </FooterLayout>
  );
});
