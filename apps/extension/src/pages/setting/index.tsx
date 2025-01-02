import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { Stack } from "../../components/stack";
import { PageButton } from "./components";
import {
  SettingIcon,
  RightArrowIcon,
  RocketLaunchIcon,
  KeyIcon,
} from "../../components/icon";
import { useNavigate } from "react-router";
import { Box } from "../../components/box";
import { FormattedMessage, useIntl } from "react-intl";
import { MainHeaderLayout } from "../main/layouts/header";
import { H3 } from "../../components/typography";
import styled, { useTheme } from "styled-components";
import { ColorPalette } from "../../styles";

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

export const SettingPage: FunctionComponent = observer(() => {
  const navigate = useNavigate();
  const intl = useIntl();

  const theme = useTheme();

  return (
    <MainHeaderLayout>
      <Box padding="0.75rem" paddingTop="0">
        <Box alignX="center" alignY="center">
          <H3
            color={
              theme.mode === "light"
                ? ColorPalette["gray-700"]
                : ColorPalette.white
            }
          >
            <FormattedMessage id="page.setting.title" />
          </H3>
        </Box>
        <Styles.Content>
          <Stack gutter="0.375rem">
            <PageButton
              title={intl.formatMessage({ id: "page.setting.general-title" })}
              paragraph={intl.formatMessage({
                id: "page.setting.general-paragraph",
              })}
              startIcon={<SettingIcon width="1rem" height="1rem" />}
              endIcon={<RightArrowIcon />}
              onClick={() => navigate("/setting/general")}
            />

            <PageButton
              title={intl.formatMessage({ id: "page.setting.advanced-title" })}
              paragraph={intl.formatMessage({
                id: "page.setting.advanced-paragraph",
              })}
              startIcon={<RocketLaunchIcon width="1rem" height="1rem" />}
              endIcon={<RightArrowIcon />}
              onClick={() => navigate("/setting/advanced")}
            />

            <PageButton
              title={intl.formatMessage({
                id: "page.setting.security-privacy-title",
              })}
              paragraph={intl.formatMessage({
                id: "page.setting.security-privacy-paragraph",
              })}
              startIcon={<KeyIcon width="1rem" height="1rem" />}
              endIcon={<RightArrowIcon />}
              onClick={() => navigate("/setting/security")}
            />

            <PageButton
              title={intl.formatMessage({
                id: "page.setting.manage-token-list-title",
              })}
              paragraph={intl.formatMessage({
                id: "page.setting.manage-token-list-paragraph",
              })}
              endIcon={<RightArrowIcon />}
              onClick={() => navigate("/setting/token/list")}
            />
          </Stack>
        </Styles.Content>
      </Box>
    </MainHeaderLayout>
  );
});
