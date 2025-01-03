import styled from "styled-components";
import { ColorPalette } from "../../../../styles";

export const StakeWithKeplrDashboardButton = styled.button`
  position: relative;

  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;

  font-weight: 500;
  font-size: 0.875rem;

  height: 3rem;
  width: 100%;

  color: ${(props) =>
    props.theme.mode === "light"
      ? ColorPalette["gray-500"]
      : ColorPalette["gray-10"]};

  cursor: pointer;
  // Remove normalized css properties.
  border-width: 0;
  border-style: none;
  border-color: transparent;
  border-image: none;
  padding: 0;

  border-radius: 5rem;
  z-index: 0;

  background-color: ${(props) =>
    props.theme.mode === "light"
      ? ColorPalette["gray-90"]
      : ColorPalette["gray-550"]};

  :hover {
    :before {
      background: ${(props) =>
        props.theme.mode === "light"
          ? ColorPalette["gray-10"]
          : ColorPalette["gray-550"]};
    }
  }

  :before {
    content: "";
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: -1;
    margin: 1px;
    border-radius: inherit;
    background: ${(props) =>
      props.theme.mode === "light"
        ? ColorPalette.white
        : ColorPalette["gray-600"]};
  }
`;
