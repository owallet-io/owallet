import React, { FunctionComponent } from 'react';
import { Text, View } from 'react-native';
import { colors } from '../../themes';
import { CText as Text } from '../text';

export const WordChip: FunctionComponent<{
  index: number;
  word: string;

  hideWord?: boolean;

  empty?: boolean;
  dashedBorder?: boolean;
}> = ({ index, word, hideWord, empty, dashedBorder }) => {
  return (
    <View
      style={{
        // paddingLeft: 2,
        // paddingRight: 2,
        borderRadius: 8,
        backgroundColor: 'white',
        borderWidth: 1,
        margin: 5,
        borderColor: empty ? colors['primary-100'] : colors['purple-700'],
        borderStyle: dashedBorder ? 'dashed' : 'dotted'
      }}
    >
      <Text
        style={{
          // color: empty ? colors['primary-100'] : colors['gray-900'],
          fontSize: 18,
          lineHeight: 22,
          fontWeight: '400',
          padding: 4,
          opacity: 1,
        }}
      >
        {empty ? `         ` : ` ${word}`}
      </Text>
    </View>
  );
};
