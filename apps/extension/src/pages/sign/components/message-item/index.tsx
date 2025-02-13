import React, { FunctionComponent, useEffect } from "react";
import { Column, Columns } from "../../../../components/column";
import { Box } from "../../../../components/box";
import { ColorPalette } from "../../../../styles";
import { Gutter } from "../../../../components/gutter";
import {
  Body3,
  H5,
  Subtitle1,
  Subtitle2,
} from "../../../../components/typography";
import { useTheme } from "styled-components";
import { SenderConfig } from "@owallet/hooks";
import axios from "axios";
import { XAxis } from "components/axis";
import { camelCaseToTitleCase, mapToDynamicAction } from "./helper";

export const MessageItem: FunctionComponent<{
  icon: React.ReactElement;
  title: string | React.ReactElement;
  content: string | React.ReactElement;
  msg?: any;
  senderConfig?: SenderConfig;
}> = ({ title, content, msg, senderConfig }) => {
  const rpc = "http://192.168.10.119:9000/";
  const theme = useTheme();
  const [parsedMsg, setParsedMsg] = React.useState<any>();

  const parseMsg = async (msg: any) => {
    const client = axios.create({ baseURL: rpc });
    const { data } = await client.put(
      `multichain-parser/v1/parser/parse`,
      {
        typeUrl: msg.typeUrl,
        value: Buffer.from(msg.value).toString("base64"),
        sender: senderConfig.sender,
      },
      {}
    );
    if (data) {
      console.log("data", data, data.data);

      setParsedMsg(data.data);
    }
    return data;
  };

  useEffect(() => {
    if (msg) {
      console.log("msg", Buffer.from(msg.value).toString("base64"));

      parseMsg(msg);
    }
  }, []);

  console.log("parsedMsg", parsedMsg);

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
            {parsedMsg && (
              <>
                <Gutter size="2px" />
                <Body3
                  color={
                    theme.mode === "light"
                      ? ColorPalette["gray-300"]
                      : ColorPalette["gray-200"]
                  }
                >
                  {Object.keys(parsedMsg).map((key) => {
                    return (
                      <XAxis
                        //@ts-ignore
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Subtitle1>{camelCaseToTitleCase(key)}</Subtitle1>
                        <Subtitle2>
                          {typeof parsedMsg[key] === "object"
                            ? JSON.stringify(mapToDynamicAction(parsedMsg[key]))
                            : parsedMsg[key]}
                        </Subtitle2>
                      </XAxis>
                    );
                  })}
                </Body3>
              </>
            )}
          </Box>
        </Column>
      </Columns>
    </Box>
  );
};
