import { RouteProp, useRoute } from "@react-navigation/native";
import React, { FunctionComponent, useEffect, useState } from "react";
import { WebpageScreen } from "../components/webpage-screen";
import { InjectedProviderUrl } from "../config";

export const DAppWebpageScreen: FunctionComponent = () => {
  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          uri: string;
          // Hex encoded bytes.
          name: string;
          sourceCode: string;
        }
      >,
      string
    >
  >();
  const { uri, name, sourceCode } = route.params;

  return <WebpageScreen name={name} source={{ uri }} sourceCode={sourceCode} />;
};
