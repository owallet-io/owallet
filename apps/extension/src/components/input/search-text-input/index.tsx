import React, { forwardRef } from "react";
import { Box } from "../../box";
import { SearchIcon } from "../../icon";
import { TextInput } from "../text-input";
import { ColorPalette } from "../../../styles";
import { useTheme } from "styled-components";

// eslint-disable-next-line react/display-name
export const SearchTextInput = forwardRef<
  HTMLInputElement,
  Omit<React.ComponentProps<typeof TextInput>, "left">
>((props, ref) => {
  const theme = useTheme();

  return (
    <TextInput
      {...props}
      ref={ref}
      style={{
        borderRadius: "25rem",
        height: "2rem",
      }}
      left={
        <Box
          style={{
            color: (() => {
              if (props.value && typeof props.value === "string") {
                return props.value.trim().length > 0
                  ? theme.mode === "light"
                    ? ColorPalette["purple-400"]
                    : ColorPalette["gray-200"]
                  : undefined;
              }
            })(),
          }}
        >
          <SearchIcon width="1.25rem" height="1.25rem" />
        </Box>
      }
    />
  );
});
