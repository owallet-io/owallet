import {
  View,
  Text,
  TouchableOpacityProps,
  TouchableOpacity,
  StyleSheet,
  StyleProp,
  TextStyle
} from 'react-native';
import React, { FunctionComponent } from 'react';
import { metrics } from '../../themes';
import { useTheme } from '@react-navigation/native';

interface IOWButtonProps extends TouchableOpacityProps {
  type?: 'primary' | 'secondary' | 'link' | 'modal';
  size?: 'medium' | 'small' | 'large';
  label?: string;
  style?: StyleProp<TouchableOpacityProps>;
  textStyle?: StyleProp<TextStyle>;
}
interface IMapStyle {
  btn: any;
  text: any;
}
const OWButton: FunctionComponent<IOWButtonProps> = ({
  label,
  type = 'primary',
  size,
  style,
  textStyle,
  ...props
}) => {
  const { colors } = useTheme();
  const styleMaped = mapStyles(type, colors);
  return (
    <TouchableOpacity
      {...props}
      style={[styles.containerBtn, styleMaped.btn, style]}
    >
      <Text style={[styles.textBtn, styleMaped.text, textStyle]}>{label}</Text>
    </TouchableOpacity>
  );
};

const mapStyles = (type, colors): IMapStyle => {
  let typeStyleBtn;
  switch (type) {
    case 'primary':
      typeStyleBtn = {
        btn: { backgroundColor: colors['btn-primary-background'] },
        text: { color: colors['white'] }
      };
      break;
    case 'secondary':
      typeStyleBtn = {
        btn: { backgroundColor: colors['gray-10'] },
        text: { color: colors['purple-900'] }
      };
      break;

    default:
      typeStyleBtn = {
        btn: { backgroundColor: colors['purple-900'] },
        text: { color: colors['white'] }
      };
      break;
  }
  return typeStyleBtn;
};
export default OWButton;
const styles = StyleSheet.create({
  containerBtn: {
    marginBottom: 16,
    width: metrics.screenWidth - 86,
    borderRadius: 8
  },
  textBtn: {
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 16,
    padding: 16
  }
});
