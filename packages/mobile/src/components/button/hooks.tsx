import { useTheme } from '@react-navigation/native';
import { ViewStyle } from 'react-native';
interface IMapStyle {
  btn: any;
  text: any;
}

const useSize = ({ size }): ViewStyle => {
  let sizeStyle;
  switch (size) {
    case 'small':
      sizeStyle = {
        borderRadius: 12,
        height: 40
      };
      break;
    case 'medium':
      sizeStyle = {
        borderRadius: 8,
        height: 55
      };
      break;
    case 'large':
      break;
    default:
      sizeStyle = {
        borderRadius: 8,
        height: 55
      };
      break;
  }
  return sizeStyle;
};
export const useMapStyles = ({ type, disabled, size }): IMapStyle => {
  const { colors } = useTheme();
  const formatSize = useSize({ size });
  let typeStyleBtn;
  switch (type) {
    case 'primary':
      typeStyleBtn = {
        btn: {
          borderRadius: formatSize.borderRadius,
          height: formatSize.height,
          backgroundColor:disabled?colors['btn-disable-background']: colors['btn-primary-background']
        },
        text: { color: disabled?colors['text-btn-disable-color']:colors['white'] }
      };
      break;
    case 'secondary':
      typeStyleBtn = {
        btn: {
          borderRadius: formatSize.borderRadius,
          height: formatSize.height,
          backgroundColor:disabled?colors['btn-disable-background']: colors['gray-10']
        },
        text: { color:disabled?colors['text-btn-disable-color']: colors['purple-900'] }
      };
      break;
    case 'link':
      typeStyleBtn = {
        btn: {
          borderRadius: formatSize.borderRadius,
          height: formatSize.height,
          backgroundColor: 'transparent'
        },
        text: { color: colors['btn-primary-background'] }
      };
      break;

    default:
      typeStyleBtn = {
        btn: {
          borderRadius: formatSize.borderRadius,
          height: formatSize.height,
          backgroundColor: colors['purple-900']
        },
        text: { color: colors['white'] }
      };
      break;
  }
  return typeStyleBtn;
};
