import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { BackButton } from "../../../layouts/header/components";
import { HeaderLayout } from "../../../layouts/header";
import { Box } from "../../../components/box";
import { PageButton } from "../components";
import { RightArrowIcon } from "../../../components/icon";
import { Stack } from "../../../components/stack";
import { Toggle } from "../../../components/toggle";
import { useStore } from "../../../stores";
import { useNavigate } from "react-router";
import { useIntl } from "react-intl";
import { ColorPalette } from "src/styles";
import styled, { useTheme } from "styled-components";

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

export const SettingAdvancedPage: FunctionComponent = observer(() => {
  const { uiConfigStore } = useStore();
  const intl = useIntl();

  const navigate = useNavigate();

  return (
    <HeaderLayout
      title={intl.formatMessage({ id: "page.setting.advanced-title" })}
      left={<BackButton />}
    >
      <Box padding="0.75rem" paddingTop="0">
        <Styles.Content>
          <Stack gutter="0.5rem">
            <PageButton
              title={intl.formatMessage({
                id: "page.setting.advanced.developer-mode-title",
              })}
              paragraph={intl.formatMessage({
                id: "page.setting.advanced.developer-mode-paragraph",
              })}
              endIcon={
                <Toggle
                  isOpen={uiConfigStore.isDeveloper}
                  setIsOpen={() =>
                    uiConfigStore.setDeveloperMode(!uiConfigStore.isDeveloper)
                  }
                />
              }
            />

            <PageButton
              title={intl.formatMessage({
                id: "page.setting.advanced.change-endpoints-title",
              })}
              endIcon={<RightArrowIcon />}
              onClick={() => navigate("/setting/advanced/endpoint")}
            />
          </Stack>
        </Styles.Content>
      </Box>
    </HeaderLayout>
  );
});
