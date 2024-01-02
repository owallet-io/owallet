import { Text, TextProps, TextStyle } from 'react-native';
import React from 'react';
import { useTheme } from '@src/themes/theme-provider';

export interface OWTextProps extends TextProps {
  variant?:
    | 'h1'
    | 'h2'
    | 'h3'
    | 'h4'
    | 'h5'
    | 'subtitle'
    | 'body1'
    | 'body2'
    | 'button'
    | 'caption'
    | 'overline'
    | 'heading'
    | 'bigText'
    | 'largeTitleScreen'
    | 'normalTitleScreen'
    | 'titleSection'
    | 'bodyLarge'
    | 'bodyLargeMedium'
    | 'bodyLargeSemiBold'
    | 'bodyRegular'
    | 'bodyDefaultMedium'
    | 'bodySemiBold'
    | 'linkDefault'
    | 'caption'
    | 'navRegular'
    | 'navSemibold';
  typo?: 'bold' | 'regular' | 'medium';
  color?: string;
  size?: number;
  weight?: '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
}
const OWText = ({ ...props }: OWTextProps) => {
  const { colors } = useTheme();
  const { color = colors['primary-text'], variant, typo = 'regular', size, style, weight } = props;
  return (
    <Text {...props} style={[useStyle({ variant, color, typo, size, weight }), style]}>
      {props.children}
    </Text>
  );
};

const useStyle = ({ variant, typo, color, size, weight }: OWTextProps) => {
  let textStyle: TextStyle = {};
  switch (variant) {
    case 'h1':
      textStyle.fontSize = 34;
      textStyle.lineHeight = 50;
      break;
    case 'h2':
      textStyle.fontSize = 28;
      textStyle.lineHeight = 40;
      break;
    case 'h3':
      textStyle.fontSize = 24;
      textStyle.lineHeight = 34;
      break;
    case 'h4':
      textStyle.fontSize = 20;
      textStyle.lineHeight = 28;
      break;
    case 'subtitle':
      textStyle.fontSize = 18;
      textStyle.lineHeight = 26;
      break;
    case 'body1':
      textStyle.fontSize = 16;
      textStyle.lineHeight = 22;
      break;
    case 'body2':
      textStyle.fontSize = 14;
      textStyle.lineHeight = 20;
      break;
    case 'button':
      textStyle.fontSize = 13;
      textStyle.lineHeight = 13;
      break;
    case 'caption':
      textStyle.fontSize = 12;
      textStyle.lineHeight = 12;
      break;
    case 'bigText':
      textStyle.fontSize = 28;
      textStyle.lineHeight = 34;
      textStyle.fontWeight = '700';
      break;
    case 'heading':
      textStyle.fontSize = 28;
      textStyle.lineHeight = 34;
      textStyle.fontWeight = '700';
      break;
    case 'largeTitleScreen':
      textStyle.fontSize = 22;
      textStyle.lineHeight = 28;
      textStyle.fontWeight = '700';
      break;
    case 'normalTitleScreen':
      textStyle.fontSize = 16;
      textStyle.lineHeight = 24;
      textStyle.fontWeight = '700';
      break;
    case 'titleSection':
      textStyle.fontSize = 18;
      textStyle.lineHeight = 26;
      textStyle.fontWeight = '600';
      break;
    case 'bodyLarge':
      textStyle.fontSize = 16;
      textStyle.lineHeight = 24;
      textStyle.fontWeight = '400';
      break;
    case 'bodyLargeMedium':
      textStyle.fontSize = 16;
      textStyle.lineHeight = 24;
      textStyle.fontWeight = '500';
      break;
    case 'bodyLargeSemiBold':
      textStyle.fontSize = 16;
      textStyle.lineHeight = 24;
      textStyle.fontWeight = '600';
      break;
    case 'bodyRegular':
      textStyle.fontSize = 14;
      textStyle.lineHeight = 20;
      textStyle.fontWeight = '400';
      break;
    case 'bodyDefaultMedium':
      textStyle.fontSize = 14;
      textStyle.lineHeight = 20;
      textStyle.fontWeight = '500';
      break;
    case 'bodySemiBold':
      textStyle.fontSize = 14;
      textStyle.lineHeight = 20;
      textStyle.fontWeight = '600';
      break;
    case 'linkDefault':
      textStyle.fontSize = 14;
      textStyle.lineHeight = 20;
      textStyle.fontWeight = '600';
      textStyle.textDecorationLine = 'underline';
      break;
    case 'caption':
      textStyle.fontSize = 13;
      textStyle.lineHeight = 18;
      textStyle.fontWeight = '400';
      break;
    case 'navRegular':
      textStyle.fontSize = 12;
      textStyle.lineHeight = 16;
      textStyle.fontWeight = '400';
      break;
    case 'navSemibold':
      textStyle.fontSize = 12;
      textStyle.lineHeight = 16;
      textStyle.fontWeight = '600';
      break;
    case 'overline':
      textStyle.fontSize = 11;
      textStyle.lineHeight = 11;
      break;
  }

  switch (typo) {
    case 'bold':
      textStyle.fontWeight = '700';
      textStyle.fontFamily = 'SpaceGrotesk-Bold';
      break;
    case 'regular':
      textStyle.fontWeight = '400';
      textStyle.fontFamily = 'SpaceGrotesk-Regular';
      break;
    case 'medium':
      textStyle.fontWeight = '500';
      textStyle.fontFamily = 'SpaceGrotesk-Medium';
      break;
  }
  if (color) textStyle.color = color;
  if (size) textStyle.fontSize = size;
  if (weight) textStyle.fontWeight = weight;
  return textStyle;
};
export default OWText;
