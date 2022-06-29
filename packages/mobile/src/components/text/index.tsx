import React from 'react';
import { Text } from 'react-native';

export const CText = (props) => {
  return (
    <Text {...props} style={[{ fontFamily: 'DMSans-Regular' }, props.style]}>
      {props.children}
    </Text>
  );
};
