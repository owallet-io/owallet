import { StyleSheet, Text, View, ViewProps } from 'react-native';
import React from 'react';
import { metrics, spacing } from '@src/themes';
import { useTheme } from '@src/themes/theme-provider';
import { useGetHeightHeader } from '@src/hooks/use-height-header';

const OWBox = ({ children, style, ...props }: ViewProps) => {
  const styles = styling();
  return (
    <View style={[styles.container, style]} {...props}>
      {children}
    </View>
  );
};

export default OWBox;

const styling = () => {
  const { colors } = useTheme();
  return StyleSheet.create({
    container: {
      padding: spacing['24'],
      borderRadius: spacing['24'],
      backgroundColor: colors['background-box'],
      width: metrics.screenWidth,
      marginTop: 24
    }
  });
};
