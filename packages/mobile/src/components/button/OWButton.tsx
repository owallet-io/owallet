import {
  View,
  Text,
  TouchableOpacityProps,
  TouchableOpacity,
  StyleSheet,
  StyleProp,
  TextStyle,
  ViewStyle
} from 'react-native';
import React, { FunctionComponent } from 'react';
import { useMapStyles } from './hooks';

interface IOWButtonProps extends TouchableOpacityProps {
  type?: 'primary' | 'secondary' | 'link' | 'modal';
  size?: 'medium' | 'small' | 'large';
  label?: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

const OWButton: FunctionComponent<IOWButtonProps> = ({
  label,
  type = 'primary',
  size,
  style,
  textStyle,
  ...props
}) => {
  const styleMapped = useMapStyles({ type });
  return (
    <TouchableOpacity
      {...props}
      style={[styles.containerBtn, styleMapped.btn, style]}
    >
      <Text style={[styles.textBtn, styleMapped.text, textStyle]}>{label}</Text>
    </TouchableOpacity>
  );
};

export default OWButton;
const styles = StyleSheet.create({
  containerBtn: {
    marginBottom: 16
  },
  textBtn: {
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 16,
    padding: 16
  }
});
