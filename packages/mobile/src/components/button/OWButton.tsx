import { View, Text, TouchableOpacityProps, TouchableOpacity, StyleSheet, StyleProp, TextStyle, ViewStyle } from 'react-native';
import React, { FunctionComponent } from 'react';
import { useMapStyles } from './hooks';
import { LoadingSpinner } from '../spinner';
import { useTheme } from '@src/themes/theme-provider';
import OWText, { OWTextProps } from '../text/ow-text';
import { TouchableOpacity } from '@gorhom/bottom-sheet';

export interface IOWButtonProps extends TouchableOpacityProps {
  type?: 'primary' | 'secondary' | 'link' | 'modal' | 'danger' | 'tonner';
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
  colorLoading?: TextStyle['color'];
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
  colorLoading = 'white',
  ...props
}) => {
  const handleOnPress = useCallback(
    (event) => {
      if (Keyboard.dismiss) {
        Keyboard.dismiss();
      }
      if (props.onPress) {
        props.onPress(event);
      }
    },
    [props.onPress]
  );
  const styleMapped = useMapStyles({ type, disabled, size, contentAlign });
  const { colors } = useTheme();
  const styles = styling();
  const ELementButton = isBottomSheet ? TouchableOpacity : NativeButton;
  return (
    <ELementButton
      {...props}
      onPress={handleOnPress}
      disabled={disabled}
      style={[
        styles.containerBtn,
        styleMapped.btn,
        (!fullWidth || (!!icon && !!label == false)) &&
          styles.paddingHaveIconAndNotFullwidth,
        fullWidth ? styles.fullWidth : styles.widthAuto,
        borderStyle == 'dashed' && styles.dashed,
        !!icon && !label && styles.hasIcon,
        circle && styles.maxBR,
        style
      ]}
    >
      {loading ? (
        <LoadingSpinner color={colorLoading} size={20} />
      ) : (
        <>
          {!!icon && icon}
          {!!label && (
            <OWText variant={textVariant} typo={textTypo} style={[styles.textBtn, !!icon && styles.iconInBtn, styleMapped.text, textStyle]}>
              {label}
            </OWText>
          )}
        </>
      )}
    </ELementButton>
  );
};

export default OWButton;
const styling = () => {
  const { colors } = useTheme();
  return StyleSheet.create({
    maxBR: { borderRadius: 99999 },
    paddingHaveIconAndNotFullwidth: { paddingHorizontal: 12 },
    iconInBtn: { paddingLeft: 6 },
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
      justifyContent: 'center'
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
