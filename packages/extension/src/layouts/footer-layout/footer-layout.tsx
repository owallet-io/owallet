import style from "./footer-layout.module.scss";
import React, { FC } from "react";
import { Footer } from "./components/footer";
import { HeaderNew } from "./components/header";

export const FooterLayout = ({ children, totalPriceByChainId, totalPrice }) => {
  return (
    <div className={style.container}>
      <HeaderNew
        totalPrice={totalPrice}
        totalPriceByChainId={totalPriceByChainId}
      />
      <div className={style.innerContainer}>{children}</div>
      <Footer />
    </div>
  );
};
