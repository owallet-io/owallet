import React, { FunctionComponent, useEffect, useState } from "react";
import { EmptyLayout } from "../../layouts/empty-layout";
import { Button } from "../../components/common/button";
import { observer } from "mobx-react-lite";
import style from "./style.module.scss";
import { FormattedMessage } from "react-intl";
import { RegisterOption, useRegisterConfig } from "@owallet/hooks";
import { useStore } from "../../stores";
import { NewMnemonicIntro, NewMnemonicPage, TypeNewMnemonic } from "./mnemonic";
import {
  RecoverMnemonicIntro,
  RecoverMnemonicPage,
  TypeRecoverMnemonic,
} from "./mnemonic";
import {
  ImportLedgerIntro,
  ImportLedgerPage,
  TypeImportLedger,
} from "./ledger";
import { WelcomePage } from "./welcome";
import { Card } from "../../components/common/card";

export const AdditionalSignInPrepend: RegisterOption[] | undefined = undefined;

export enum NunWords {
  WORDS12,
  WORDS24,
}

export const BackButton: FunctionComponent<{ onClick: () => void }> = ({
  onClick,
}) => {
  return (
    <Button
      leftIcon={
        <i className="fas fa-angle-left" style={{ marginRight: "8px" }} />
      }
      text={<FormattedMessage id="register.button.back" />}
      color="primary"
      onClick={onClick}
      mode="outline"
    />
  );
};

const slides = [
  {
    imageSrc: require("../../public/assets/images/img_owallet.png"),
    title: "LEVERAGE EXPERIENCES\nWITH POWER OF AI",
    paragraph: "Simplify DeFi activities with AI via DeFi Lens",
  },
  {
    imageSrc: require("../../public/assets/images/img_planet.png"),
    title: "SEAMLESSLY\nMANAGING ASSETS",
    paragraph: "Portfolio management with\nmulti-chain assets & multi-accounts",
  },
  {
    imageSrc: require("../../public/assets/images/img_leverage.png"),
    title: "UNIVERSAL\nWEB3 GATEWAY",
    paragraph: "Bitcoin x EVM x Oraichain x Cosmos-SDK\nblockchains",
  },
];

export const RegisterPage: FunctionComponent = observer(() => {
  useEffect(() => {
    document.body.setAttribute("data-centered", "true");

    return () => {
      document.body.removeAttribute("data-centered");
    };
  }, []);

  const [slide, setSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      if (slide < 2) {
        setSlide((prevSlide) => prevSlide + 1);
      } else {
        setSlide(0);
      }
    }, 6000);

    return () => {
      clearInterval(interval);
    };
  }, [slide]);

  const { keyRingStore } = useStore();

  const registerConfig = useRegisterConfig(keyRingStore, [
    ...(AdditionalSignInPrepend ?? []),
    {
      type: TypeNewMnemonic,
      intro: NewMnemonicIntro,
      page: NewMnemonicPage,
    },
    {
      type: TypeRecoverMnemonic,
      intro: RecoverMnemonicIntro,
      page: RecoverMnemonicPage,
    },
    {
      type: TypeImportLedger,
      intro: ImportLedgerIntro,
      page: ImportLedgerPage,
    },
  ]);
  return (
    <EmptyLayout
      className={style.container}
      style={{
        justifyContent:
          registerConfig.isIntro || registerConfig.isFinalized
            ? "center"
            : "start",
      }}
    >
      <Card type="ink">
        {!registerConfig.isFinalized ? (
          <div className={style.logoContainer}>
            <div>
              <img
                className={style.icon}
                src={slides[slide].imageSrc}
                alt="logo"
              />
            </div>
            <div className={style.logoInnerContainer}>
              <div className={style.title}>{slides[slide].title}</div>
              <div className={style.paragraph}>{slides[slide].paragraph}</div>
            </div>
          </div>
        ) : (
          <div className={style.logoContainer}>
            <div>
              <img
                style={{ width: "100%" }}
                src={require("../../public/assets/images/img-all-done.png")}
                alt="logo"
              />
            </div>
          </div>
        )}

        {registerConfig.render()}
        {registerConfig.isFinalized ? <WelcomePage /> : null}
        {registerConfig.isIntro ? (
          <div className={style.subContent}>
            {/* <FormattedMessage
            id="register.intro.sub-content"
            values={{
              br: <br />
            }}
          /> */}
          </div>
        ) : null}
      </Card>
    </EmptyLayout>
  );
});
