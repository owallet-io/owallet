import { useTheme } from '@src/themes/theme-provider';
import { TextStyle, ViewStyle } from 'react-native';
interface IMapStyle {
  btn: ViewStyle;
  text: TextStyle;
}

const useSize = ({ size }): IMapStyle => {
  let sizeStyle: IMapStyle;
  switch (size) {
    case 'small':
      sizeStyle = {
        btn: {
          borderRadius: 8,
          height: 32
        },
        text: {
          fontSize: 14,
          fontWeight: '700'
        }
      };
      break;
    case 'medium':
      sizeStyle = {
        btn: {
          borderRadius: 12,
          height: 40
        },
        text: {
          fontSize: 14,
          fontWeight: '400'
        }
      };
      break;
    case 'large':
      sizeStyle = {
        btn: {
          borderRadius: 8,
          height: 55
        },
        text: {
          fontSize: 16,
          fontWeight: '700'
        }
      };
      break;
    default:
      sizeStyle = {
        btn: {
          borderRadius: 8,
          height: 55
        },
        text: {
          fontSize: 16,
          fontWeight: '700'
        }
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
    case 'danger':
      typeStyleBtn = {
        btn: {
          borderRadius: formatSize.btn.borderRadius,
          height: formatSize.btn.height,
          backgroundColor: disabled
            ? colors['btn-disable-background']
            : colors['orange-800']
        },
        text: {
          color: disabled ? colors['text-btn-disable-color'] : colors['white'],
          fontSize: formatSize.text.fontSize,
          fontWeight: formatSize.text.fontWeight
        }
      };
      break;
    case 'primary':
      typeStyleBtn = {
        btn: {
          borderRadius: formatSize.btn.borderRadius,
          height: formatSize.btn.height,
          backgroundColor: disabled
            ? colors['btn-disable-background']
            : colors['btn-primary-background']
        },
        text: {
          color: disabled ? colors['text-btn-disable-color'] : colors['white'],
          fontSize: formatSize.text.fontSize,
          fontWeight: formatSize.text.fontWeight
        }
      };
      break;
    case 'secondary':
      typeStyleBtn = {
        btn: {
          borderRadius: formatSize.btn.borderRadius,
          height: formatSize.btn.height,
          backgroundColor: disabled
            ? colors['btn-disable-background']
            : colors['gray-10']
        },
        text: {
          color: disabled
            ? colors['text-btn-disable-color']
            : colors['purple-900'],
          fontSize: formatSize.text.fontSize,
          fontWeight: formatSize.text.fontWeight
        }
      };
      break;
    case 'link':
      typeStyleBtn = {
        btn: {
          borderRadius: formatSize.btn.borderRadius,
          height: formatSize.btn.height,
          backgroundColor: 'transparent'
        },
        text: {
          color: colors['btn-primary-background'],
          fontSize: formatSize.text.fontSize,
          fontWeight: formatSize.text.fontWeight
        }
      };
      break;

    default:
      typeStyleBtn = {
        btn: {
          borderRadius: formatSize.btn.borderRadius,
          height: formatSize.btn.height,
          backgroundColor: disabled
            ? colors['btn-disable-background']
            : colors['btn-primary-background']
        },
        text: {
          color: disabled ? colors['text-btn-disable-color'] : colors['white'],
          fontSize: formatSize.text.fontSize,
          fontWeight: formatSize.text.fontWeight
        }
      };
      break;
  }
  return typeStyleBtn;
};
