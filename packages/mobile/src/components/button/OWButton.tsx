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
  fullWidth?: boolean;
  circle?: boolean;
  icon?: React.ReactNode;
}

const OWButton: FunctionComponent<IOWButtonProps> = ({
  label,
  type = 'primary',
  size = 'medium',
  style,
  textStyle,
  disabled,
  icon,
  fullWidth,
  ...props
}) => {
  const styleMapped = useMapStyles({ type, disabled, size });
  return (
    <TouchableOpacity
      {...props}
      disabled={disabled}
      style={[
        styles.containerBtn,
        styleMapped.btn,
        fullWidth && styles.fullWidth,
        !!icon && !label && styles.hasIcon,
        style
      ]}
    >
      {!!icon && icon}
      {!!label && (
        <Text style={[styles.textBtn, styleMapped.text, textStyle]}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
};

export default OWButton;
const styles = StyleSheet.create({
  hasIcon: { height: 'auto' },
  fullWidth: { width: '100%' },
  containerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  textBtn: {
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 16
  }
});
