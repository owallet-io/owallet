import React, { FunctionComponent } from 'react';
import { WebpageScreen } from '../components/webpage-screen';

export const DAppWebpageScreen: FunctionComponent<{
  name: string;
  uri: string;
}> = ({ uri, name }) => {
  return <WebpageScreen name={name} source={{ uri }} />;
};
