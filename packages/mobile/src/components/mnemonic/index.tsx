import React, { FunctionComponent } from 'react';
import { View } from 'react-native';
import { colors } from '../../themes';
import { Text } from '@src/components/text';

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
        borderRadius: 8,
        borderWidth: 1,
        margin: 5,
        borderColor: empty ? colors['primary-100'] : colors['primary-default'],
        borderStyle: dashedBorder ? 'dashed' : 'dotted'
      }}
    >
      <Text
        style={{
          color: empty ? colors['primary-100'] : colors['text-gray-900-primary-default'],
          fontSize: 18,
          lineHeight: 22,
          fontWeight: '400',
          padding: 4,
          opacity: 1
        }}
      >
        {empty ? `         ` : ` ${word}`}
      </Text>
    </View>
  );
};

export const BackupWordChip: FunctionComponent<{
  index: number;
  word: string;

  hideWord?: boolean;

  empty?: boolean;
  dashedBorder?: boolean;
}> = ({ index, word, hideWord, empty, dashedBorder }) => {
  return (
    <View
      style={{
        borderRadius: 999,
        margin: 5,
        backgroundColor: colors['background-light-gray'],
        justifyContent: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 4
      }}
    >
      <View
        style={{
          borderRadius: 999,
          width: 20,
          height: 20,
          backgroundColor: colors['primary-subtitle'],
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <Text
          style={{
            fontSize: 12,
            fontWeight: '600',
            padding: 4,
            color: empty ? colors['primary-100'] : colors['primary-default']
          }}
        >
          {index}
        </Text>
      </View>
      <Text
        style={{
          fontSize: 14,
          lineHeight: 22,
          fontWeight: '500',
          padding: 4,
          paddingHorizontal: 6,
          opacity: 1
        }}
      >
        {empty ? `         ` : `${word}`}
      </Text>
    </View>
  );
};
