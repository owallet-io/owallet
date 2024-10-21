import React from "react";

// import {SVGLoadingIcon} from '../spinner';
import { registerModal } from "@src/modals/base";
import { SVGLoadingIcon } from "@components/spinner";
import { Box } from "@components/box";

export const LoadingModal = registerModal(() => {
  return (
    <Box paddingY={32} alignX="center">
      <SVGLoadingIcon size={30} color="white" />
    </Box>
  );
});
