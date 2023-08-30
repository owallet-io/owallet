import { StyleSheet,  View } from 'react-native';
import React, { FunctionComponent } from 'react';
import { OWTextProps } from '@src/components/text/ow-text';
import { Text } from '@src/components/text';
import { colorsCode } from '@src/themes/mode-colors';

export const BalanceText: FunctionComponent<OWTextProps> = (props) => {
  return (
    <Text size={14} weight='500' color={'#7C8397'} {...props}>
      {props.children}
    </Text>
  );
};

const styles = StyleSheet.create({});
