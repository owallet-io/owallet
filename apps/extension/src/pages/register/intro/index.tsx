import React, { FunctionComponent, useEffect, useState } from "react";
import { RegisterSceneBox } from "../components/register-scene-box";
import { Stack } from "../../../components/stack";
import { Button } from "../../../components/button";
import {
  useSceneEvents,
  useSceneTransition,
} from "../../../components/transition";
import { useRegisterHeader } from "../components/header";
import { YAxis } from "../../../components/axis";
import { Gutter } from "../../../components/gutter";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores";
import { useIntl } from "react-intl";
import { ColorPalette } from "src/styles";

const slides = [
  {
    imageSrc: require("assets/images/img_owallet.png"),
    title: "LEVERAGE EXPERIENCES WITH POWER OF AI",
    paragraph: "Simplify DeFi activities with AI via DeFi Lens",
  },
  {
    imageSrc: require("assets/images/img_planet.png"),
    title: "SEAMLESSLY MANAGING ASSETS",
    paragraph: "Portfolio management with\nmulti-chain assets & multi-accounts",
  },
  {
    imageSrc: require("assets/images/img_leverage.png"),
    title: "UNIVERSAL GATEWAY WITH OME WALLET",
    paragraph: "Bitcoin x EVM x Oraichain x Cosmos-SDK\nblockchains",
  },
];

export const RegisterIntroScene: FunctionComponent = observer(() => {
  const { uiConfigStore } = useStore();
  const sceneTransition = useSceneTransition();
  const intl = useIntl();

  const header = useRegisterHeader();
  useSceneEvents({
    onWillVisible: () => {
      header.setHeader({
        mode: "intro",
      });
    },
  });

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

  return (
    <RegisterSceneBox>
      <YAxis alignX="center">
        <div
          style={{
            maxWidth: "100%",
            height: 120,
            marginBottom: "0.725rem",
          }}
        >
          <img height={120} src={slides[slide].imageSrc} alt="logo" />
        </div>
        <YAxis alignX="center">
          <span
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: ColorPalette["black"],
              textAlign: "center",
            }}
          >
            {slides[slide].title}
          </span>
          <span
            style={{
              fontSize: 20,
              color: ColorPalette["gray-200"],
              textAlign: "center",
              marginTop: "0.5rem",
            }}
          >
            {slides[slide].paragraph}
          </span>
        </YAxis>
      </YAxis>
      <Gutter size="3.125rem" />
      <Stack gutter="1.25rem">
        <Button
          text={intl.formatMessage({
            id: "pages.register.intro.create-wallet-button",
          })}
          size="large"
          onClick={() => {
            sceneTransition.push("new-user");
          }}
        />
        <Button
          text={intl.formatMessage({
            id: "pages.register.intro.import-wallet-button",
          })}
          size="large"
          color="secondary"
          onClick={() => {
            sceneTransition.push("existing-user");
          }}
        />
        {uiConfigStore.platform !== "firefox" ? (
          <Button
            text={intl.formatMessage({
              id: "pages.register.intro.connect-hardware-wallet-button",
            })}
            size="large"
            color="secondary"
            onClick={() => {
              sceneTransition.push("connect-hardware-wallet");
            }}
          />
        ) : null}
      </Stack>
    </RegisterSceneBox>
  );
});
