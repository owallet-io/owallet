import { useNavigation } from '@react-navigation/core';
import React, { FunctionComponent } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { CText as Text } from '../../../../components/text';
import { HeaderBackButtonIcon } from '../../../../components/header/icon';
import { useStyle } from '../../../../styles';

export const BrowserSectionTitle: FunctionComponent<{
  title: string;
}> = ({ title }) => {
  const style = useStyle();
  const navigation = useNavigation();

  return (
    <View
      style={style.flatten([
        'padding-x-20',
        'padding-top-16',
        'padding-bottom-16',
        'background-color-white',
        'flex-row'
      ])}
    >
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <HeaderBackButtonIcon />
      </TouchableOpacity>
      <Text style={style.flatten(['h4', 'margin-x-10'])}>{title}</Text>
    </View>
  );
};

export const BrowserSectionModal: FunctionComponent<{
  onClose?: () => void;
  onPress?: () => void;
}> = ({ onClose, onPress }) => {
  const style = useStyle();
  return (
    <View
      style={style.flatten([
        'padding-x-20',
        'padding-top-16',
        'padding-bottom-16',
        'flex-row',
        'justify-between'
      ])}
    >
      <TouchableOpacity onPress={onPress}>
        <Text style={style.flatten(['text-button1'])}>Bookmark</Text>
      </TouchableOpacity>
    </View>
  );
};
