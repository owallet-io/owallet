import React, { FunctionComponent } from "react";

import { Text } from "react-native";
import { Box } from "@components/box";
import { useStyle } from "@src/styles";
import { Columns } from "@components/column";
import { Gutter } from "@components/gutter";
import OWText from "@components/text/ow-text";

export const MessageItem: FunctionComponent<{
  icon: React.ReactElement;
  title: string | React.ReactElement;
  content: string | React.ReactElement;
}> = ({ icon, title, content }) => {
  const style = useStyle();
  return (
    <Box padding={16}>
      <Columns sum={1}>
        {/*<Box alignX="center" alignY="top">*/}
        {/*  {icon}*/}
        {/*</Box>*/}

        {/*<Gutter size={8} />*/}

        <Box style={{ flexShrink: 1 }} alignY="center">
          <OWText style={style.flatten(["h5"])}>{title}</OWText>
          <Gutter size={2} />
          <Box>{content}</Box>
        </Box>
      </Columns>
    </Box>
  );
};
