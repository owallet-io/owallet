import React, { FunctionComponent, PropsWithChildren } from "react";
import styled, { useTheme } from "styled-components";
import { ColorPalette } from "../../styles";
import { Subtitle3 } from "../typography";
import { FormattedMessage } from "react-intl";
import images from "assets/images";

const Styles = {
  Container: styled.div`
    display: flex;
    flex-direction: column;

    align-items: center;
    justify-content: center;
    gap: 0.75rem;
  `,
  Icon: styled.div``,
};

export const EmptyView: FunctionComponent<
  PropsWithChildren<{
    subject?: string;
    altSvg?: React.ReactElement;

    style?: React.CSSProperties;
  }>
> = ({ subject, altSvg, style, children }) => {
  const theme = useTheme();

  return (
    <Styles.Container style={style}>
      <Styles.Icon>
        {altSvg ? (
          altSvg
        ) : (
          <img src={images.img_planet} height={72} alt="empty" />
        )}
      </Styles.Icon>
      <Subtitle3
        color={
          theme.mode === "light"
            ? ColorPalette["gray-200"]
            : ColorPalette["gray-400"]
        }
      >
        {subject ? (
          <FormattedMessage
            id="components.empty-view.text"
            values={{ subject }}
          />
        ) : (
          children
        )}
      </Subtitle3>
    </Styles.Container>
  );
};
