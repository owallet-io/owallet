import styled from "styled-components";
import { ColorPalette } from "../../../../styles";
import { Body2, Subtitle2 } from "../../../../components/typography";

export const Styles = {
  Container: styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-height: 4.625rem;
    padding: 1rem;
    cursor: ${({ onClick }) => (onClick ? "pointer" : "auto")};
    border-bottom: 1px solid;
    border-bottom-color: ${(props) =>
      props.theme.mode === "light"
        ? ColorPalette["gray-50"]
        : ColorPalette["gray-10"]};
  `,
  Title: styled(Subtitle2)`
    color: ${(props) =>
      props.theme.mode === "light"
        ? ColorPalette["gray-700"]
        : ColorPalette["gray-10"]};
  `,
  Paragraph: styled(Body2)`
    color: ${ColorPalette["gray-300"]};
    max-width: 16.75rem;
  `,
  StartIcon: styled.div`
    background-color: ${(props) =>
      props.theme.mode === "light"
        ? ColorPalette["gray-50"]
        : ColorPalette["gray-100"]};
    border-radius: 100%;
    padding: 0.5rem 0.625rem;
    justify-content: center;
    align-items: center;
  `,
  EndIcon: styled.div`
    color: ${(props) =>
      props.theme.mode === "light"
        ? ColorPalette["gray-200"]
        : ColorPalette["gray-300"]};
  `,
};
