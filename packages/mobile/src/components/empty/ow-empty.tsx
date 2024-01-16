import { View, StyleSheet, ViewProps } from 'react-native';
import React from 'react';
import FastImage from 'react-native-fast-image';
import { Text } from '../text';
import { useTheme } from '@src/themes/theme-provider';
interface IOWEmpty extends ViewProps {
  style?: ViewProps['style'];
  type?: 'list' | 'crash' | 'cash';
  label?: string;
  sizeImage?: number;
}

const OWEmpty = ({ style, sizeImage = 142, type = 'list', ...props }: IOWEmpty) => {
  const { label = type == 'list' ? 'No result found' : 'Not found data' } = props;
  const { colors, images } = useTheme();
  const imgList = {
    list: images.list_empty,
    crash: images.crash_empty,
    cash: images.money_empty
  };
  return (
    <View style={[styles.container, style]} {...props}>
      <FastImage
        source={imgList[type]}
        style={{
          width: sizeImage,
          height: sizeImage
        }}
        resizeMode={'contain'}
      />
      <Text color={colors['neutral-text-title']} style={styles.textStyle} size={16} weight="700">
        {label.toUpperCase()}
      </Text>
    </View>
  );
};

export default OWEmpty;

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40
  },
  textStyle: {
    paddingTop: 8,
    textAlign: 'center'
  },
  stylesImage: {
    width: 142,
    height: 142
  }
});
