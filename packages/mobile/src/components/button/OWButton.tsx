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
import { LoadingSpinner } from '../spinner';
import { useTheme } from '@src/themes/theme-provider';
import OWText, { OWTextProps } from '../text/ow-text';

export interface IOWButtonProps extends TouchableOpacityProps {
  type?: 'primary' | 'secondary' | 'link' | 'modal' | 'danger';
  size?: 'medium' | 'small' | 'large';
  textVariant?: OWTextProps['variant'];
  textTypo?: OWTextProps['typo'];
  label?: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  fullWidth?: boolean;
  circle?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  contentAlign?: 'left' | 'center' | 'right';
  borderStyle?: 'dashed' | 'none';
}

const OWButton: FunctionComponent<IOWButtonProps> = ({
  label,
  type = 'primary',
  size = 'large',
  style,
  textVariant = 'body1',
  textTypo,
  textStyle,
  disabled,
  icon,
  fullWidth = true,
  loading,
  children,
  borderStyle,
  contentAlign,
  ...props
}) => {
  const styleMapped = useMapStyles({ type, disabled, size, contentAlign });
  const { colors } = useTheme();
  const styles = styling();
  return (
    <TouchableOpacity
      {...props}
      disabled={disabled}
      style={[
        styles.containerBtn,
        styleMapped.btn,
        fullWidth ? styles.fullWidth : styles.widthAuto,
        borderStyle == 'dashed' && styles.dashed,
        !!icon && !label && styles.hasIcon,
        style
      ]}
    >
      {loading ? (
        <LoadingSpinner color={colors['white']} size={20} />
      ) : (
        <>
          {!!icon && icon}
          {!!label && (
            <OWText
              variant={textVariant}
              typo={textTypo}
              style={[styles.textBtn, styleMapped.text, textStyle]}
            >
              {label}
            </OWText>
          )}
        </>
      )}
    </TouchableOpacity>
  );
};

export default OWButton;
const styling = () => {
  const { colors } = useTheme();
  return StyleSheet.create({
    dashed: {
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: colors['background-btn-primary']
    },
    hasIcon: { height: 'auto' },
    fullWidth: { width: '100%' },
    containerBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 12
    },
    textBtn: {
      textAlign: 'center',
      fontWeight: '700',
      fontSize: 16
    },
    widthAuto: {
      width: 'auto'
    }
  });
};
