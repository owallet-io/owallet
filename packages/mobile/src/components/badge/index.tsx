import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';

const styles = StyleSheet.create({
  IconBadge: {
    position: 'absolute',
    top: 1,
    right: 1,
    minWidth: 20,
    height: 20,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF0000'
  }
});

export const Badge: PureComponent<{
  color?: 'primary' | 'secondary' | 'danger';
  style: object;
}> = ({ color = 'primary', style, children }) => {
  return <View style={[style, styles.IconBadge]}>{children}</View>;
};
