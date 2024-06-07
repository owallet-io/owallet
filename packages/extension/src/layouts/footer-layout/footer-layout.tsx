import style from "./footer-layout.module.scss";
import React, { FC } from "react";
import { Footer } from "./components/footer";

export const FooterLayout = ({ children }) => {
  return (
    <div className={style.container}>
      <div className={style.innerContainer}>{children}</div>
      <Footer />
    </div>
  );
};
