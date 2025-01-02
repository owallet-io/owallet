import React, { FunctionComponent } from "react";
import { useNavigate } from "react-router";
import { useIntl } from "react-intl";
import { BackButton } from "../../../../layouts/header/components";
import { HeaderLayout } from "../../../../layouts/header";
import { Stack } from "../../../../components/stack";
import { PageButton } from "../../components";
import { CheckIcon } from "../../../../components/icon";
import { Box } from "../../../../components/box";
import { useAppTheme } from "../../../../theme";
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

export const SettingGeneralThemePage: FunctionComponent = () => {
  const theme = useAppTheme();
  const navigate = useNavigate();
  const intl = useIntl();

  return (
    <HeaderLayout
      title={intl.formatMessage({ id: "page.setting.general.theme-title" })}
      left={<BackButton />}
    >
      <Box paddingX="0.75rem" paddingBottom="0.75rem">
        <Styles.Content>
          <Stack gutter="0.5rem">
            <PageButton
              title={intl.formatMessage({
                id: "page.setting.general.theme.dark-mode",
              })}
              endIcon={
                theme.option === "dark" ? (
                  <CheckIcon width="1.25rem" height="1.25rem" />
                ) : null
              }
              onClick={() => {
                theme.setTheme("dark");
                navigate(-1);
              }}
            />
            <PageButton
              title={intl.formatMessage({
                id: "page.setting.general.theme.light-mode",
              })}
              endIcon={
                theme.option === "light" ? (
                  <CheckIcon width="1.25rem" height="1.25rem" />
                ) : null
              }
              onClick={() => {
                theme.setTheme("light");
                navigate(-1);
              }}
            />
            <PageButton
              title={intl.formatMessage({
                id: "page.setting.general.theme.auto",
              })}
              endIcon={
                theme.option === "auto" ? (
                  <CheckIcon width="1.25rem" height="1.25rem" />
                ) : null
              }
              onClick={() => {
                theme.setTheme("auto");
                navigate(-1);
              }}
            />
          </Stack>
        </Styles.Content>
      </Box>
    </HeaderLayout>
  );
};
