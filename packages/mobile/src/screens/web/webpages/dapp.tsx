import { RouteProp, useRoute } from "@react-navigation/native";
import React, { FunctionComponent } from "react";
import { WebpageScreen } from "../components/webpage-screen";

export const DAppWebpageScreen: FunctionComponent = () => {
  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          uri: string;
          // Hex encoded bytes.
          name: string;
        }
      >,
      string
    >
  >();
  const { uri, name } = route.params;

  return <WebpageScreen name={name} source={{ uri }} />;
};
