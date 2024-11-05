import { createGlobalStyle } from "styled-components";

export const ScrollBarStyle = createGlobalStyle`
  * {
    ::-webkit-scrollbar {
      display: none;
    }

    // For firefox
    scrollbar-width: none;
  }

  .simplebar-scrollbar::before {
    border-radius: 0;
  }

  .simplebar-scrollbar.simplebar-visible:before {
    opacity: 1;
  }

  .simplebar-track.simplebar-vertical {
    width: 0.625rem;
  }

  .simplebar-track.simplebar-horizontal {
    height: 0.625rem;
  }
`;
