import React, { FunctionComponent, useEffect } from "react";
import { Column, Columns } from "../../../../components/column";
import { Box } from "../../../../components/box";
import { ColorPalette } from "../../../../styles";
import { Gutter } from "../../../../components/gutter";
import { Body3, H5 } from "../../../../components/typography";
import { useTheme } from "styled-components";
import { SenderConfig } from "@owallet/hooks";
import axios from "axios";

export const MessageItem: FunctionComponent<{
  icon: React.ReactElement;
  title: string | React.ReactElement;
  content: string | React.ReactElement;
  msg?: any;
  senderConfig?: SenderConfig;
}> = ({ title, content, msg, senderConfig }) => {
  const rpc = "localhost:9000/";
  const theme = useTheme();

  const parseMsg = async (msg: any) => {
    const client = axios.create({ baseURL: rpc });
    const { data } = await client.put(
      `multichain-parser/v1/swap-contract/swap`,
      {
        typeUrl: msg.typeUrl,
        value: Buffer.from(msg.value).toString("base64"),
        sender: senderConfig.sender,
      },
      {}
    );
    if (data) {
      console.log("dataaa", data);
    }
    return data;
  };

  useEffect(() => {
    if (msg) {
      console.log("fulfill msg ", {
        typeUrl: msg.typeUrl,
        value: Buffer.from(msg.value).toString("base64"),
        sender: senderConfig.sender,
      });

      parseMsg(msg);
    }
  }, []);

  return (
    <Box padding="1rem">
      <Columns sum={1}>
        {/* <Box
          width="2.5rem"
          minWidth="2.5rem"
          height="2.5rem"
          alignX="center"
          alignY="center"
        >
          {icon}
        </Box> */}

        <Gutter size="0.5rem" />

        <Column weight={1}>
          <Box minHeight="3rem" alignY="center">
            <H5
              color={
                theme.mode === "light"
                  ? ColorPalette["gray-500"]
                  : ColorPalette["gray-10"]
              }
            >
              {title}
            </H5>
            <Gutter size="2px" />
            <Body3
              color={
                theme.mode === "light"
                  ? ColorPalette["gray-300"]
                  : ColorPalette["gray-200"]
              }
            >
              {content}
            </Body3>
          </Box>
        </Column>
      </Columns>
    </Box>
  );
};
