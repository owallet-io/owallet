import React, { FunctionComponent } from "react";
import { HeaderLayout } from "../../../layouts/header";
import { BackButton } from "../../../layouts/header/components";
import { Stack } from "../../../components/stack";
import { PageButton } from "../components";
import { RightArrowIcon } from "../../../components/icon";
import { useNavigate } from "react-router";
import { Box } from "../../../components/box";
import { useIntl } from "react-intl";
import { Toggle } from "../../../components/toggle";
import { InExtensionMessageRequester } from "@owallet/router-extension";
import { BACKGROUND_PORT } from "@owallet/router";
import { SetDisableAnalyticsMsg } from "@owallet/background";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores";
import styled, { useTheme } from "styled-components";
import { ColorPalette } from "src/styles";

const Styles = {
  Content: styled(Stack)`
    margin-top: 1.125rem;
    background-color: ${(props) =>
      props.theme.mode === "light"
        ? props.isNotReady
          ? ColorPalette["skeleton-layer-0"]
          : ColorPalette.white
        : ColorPalette["gray-650"]};

    box-shadow: ${(props) =>
      props.theme.mode === "light" && !props.isNotReady
        ? "0px 1px 4px 0px rgba(43, 39, 55, 0.10)"
        : "none"};
    padding: 0.75rem;
    border-radius: 0.375rem;
  `,
};

export const SettingSecurityPage: FunctionComponent = observer(() => {
  const { uiConfigStore } = useStore();

  const navigate = useNavigate();
  const intl = useIntl();

  const [disableAnalytics, setDisableAnalytics] = React.useState<boolean>(
    localStorage.getItem("disable-analytics") === "true"
  );

  return (
    <HeaderLayout
      title={intl.formatMessage({ id: "page.setting.security-privacy-title" })}
      left={<BackButton />}
    >
      <Box padding="0.75rem" paddingTop="0">
        <Styles.Content>
          <Stack gutter="0.5rem">
            <PageButton
              title={intl.formatMessage({
                id: "page.setting.security.connected-websites-title",
              })}
              paragraph={intl.formatMessage({
                id: "page.setting.security.connected-websites-paragraph",
              })}
              endIcon={<RightArrowIcon />}
              onClick={() => navigate("/setting/security/permission")}
            />

            <PageButton
              title={intl.formatMessage({
                id: "page.setting.security.auto-lock-title",
              })}
              endIcon={<RightArrowIcon />}
              onClick={() => navigate("/setting/security/auto-lock")}
            />

            <PageButton
              title={intl.formatMessage({
                id: "page.setting.security.change-password-title",
              })}
              endIcon={<RightArrowIcon />}
              onClick={() => navigate("/setting/security/change-password")}
            />

            {/* {uiConfigStore.platform === "firefox" ? null : (
              <PageButton
                title={intl.formatMessage({
                  id: "page.setting.security.analytics-title",
                })}
                paragraph={intl.formatMessage({
                  id: "page.setting.security.analytics-paragraph",
                })}
                endIcon={
                  <Box marginLeft="0.5rem">
                    <Toggle
                      isOpen={!disableAnalytics}
                      setIsOpen={() => {
                        const disableAnalytics =
                          localStorage.getItem("disable-analytics") === "true";

                        new InExtensionMessageRequester()
                          .sendMessage(
                            BACKGROUND_PORT,
                            new SetDisableAnalyticsMsg(!disableAnalytics)
                          )
                          .then((analyticsDisabled) => {
                            localStorage.setItem(
                              "disable-analytics",
                              analyticsDisabled ? "true" : "false"
                            );

                            setDisableAnalytics(analyticsDisabled);
                          });
                      }}
                    />
                  </Box>
                }
              />
            )} */}
          </Stack>
        </Styles.Content>
      </Box>
    </HeaderLayout>
  );
});
