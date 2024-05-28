import React, { FunctionComponent } from "react";

import styleWelcome from "./welcome.module.scss";

import { useIntl } from "react-intl";
import { Button } from "../../components/common/button";
import { Text } from "../../components/common/text";

export const WelcomePage: FunctionComponent = () => {
  const intl = useIntl();

  return (
    <div
      style={{
        paddingTop: "20px",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
      }}
    >
      <div style={{ paddingBottom: 32 }}>
        <div className={styleWelcome.title}>
          <Text size={28} weight="700">
            ALL DONE!
          </Text>
        </div>
        <div className={styleWelcome.content}>
          <Text weight="500" color="neutral-text-body">
            Congratulations! Your wallet was successfully created
          </Text>
        </div>
      </div>
      <Button
        color="primary"
        onClick={() => {
          if (typeof browser !== "undefined") {
            browser.tabs.getCurrent().then((tab) => {
              if (tab.id) {
                browser.tabs.remove(tab.id);
              } else {
                window.close();
              }
            });
          } else {
            window.close();
          }
        }}
      >
        Get Started
      </Button>
    </div>
  );
};
