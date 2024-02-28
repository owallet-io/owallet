import React, { FunctionComponent } from "react";
import { HeaderLayout } from "../../../layouts";
import { useHistory } from "react-router";
import { useIntl } from "react-intl";
import { PageButton } from "../page-button";

import style from "./style.module.scss";

const styleTitle = {
  fontWeight: "400",
  fontSize: 14,
};

const styleParagraph = {
  color: "#A6A6B0",
};

export const CreditPage: FunctionComponent = () => {
  return (
    <>
      <div className={style.container}>
        <PageButton
          title="Entity Funding Support"
          paragraph="Provided by ICF"
          onClick={(e) => {
            e.preventDefault();
            browser.tabs.create({
              url: "https://interchain.io",
            });
          }}
          styleTitle={styleTitle}
          styleParagraph={styleParagraph}
        />
        <div style={{ height: 10 }} />
        <PageButton
          title="Price data"
          paragraph="Provided by Coingecko API"
          onClick={(e) => {
            e.preventDefault();
            browser.tabs.create({
              url: "https://www.coingecko.com/",
            });
          }}
          styleTitle={styleTitle}
          styleParagraph={styleParagraph}
        />
        <div style={{ height: 10 }} />
        <PageButton
          title="Development grant support"
          paragraph="Provided by grant.fish"
          onClick={(e) => {
            e.preventDefault();
            browser.tabs.create({
              url: "https://stake.fish",
            });
          }}
          styleTitle={styleTitle}
          styleParagraph={styleParagraph}
        />
      </div>
    </>
  );
};
