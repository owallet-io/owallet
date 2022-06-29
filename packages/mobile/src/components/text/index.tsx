import { Text, TextProps } from 'react-native';
import React from 'react';
export const CText = (props: TextProps) => {
  return (
    <Text {...props} style={[{ fontFamily: 'DMSans-Regular' }, props.style]}>
      {props.children}
    </Text>
  );
};
