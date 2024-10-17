import React, { FunctionComponent } from "react";

import { Text } from "react-native";
import { Box } from "@components/box";
import { useStyle } from "@src/styles";
import { Columns } from "@components/column";
import { Gutter } from "@components/gutter";

export const MessageItem: FunctionComponent<{
  icon: React.ReactElement;
  title: string | React.ReactElement;
  content: string | React.ReactElement;
}> = ({ icon, title, content }) => {
  const style = useStyle();
  return (
    <Box padding={16}>
      <Columns sum={1}>
        <Box alignX="center" alignY="top">
          {icon}
        </Box>

        <Gutter size={8} />

        <Box style={{ flexShrink: 1 }} alignY="center">
          <Text style={style.flatten(["color-text-high", "h5"])}>{title}</Text>
          <Gutter size={2} />
          <Box>{content}</Box>
        </Box>
      </Columns>
    </Box>
  );
};
