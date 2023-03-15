import { useTheme } from '@react-navigation/native';
interface IMapStyle {
    btn: any;
    text: any;
  }
export const useMapStyles = ({ type }):IMapStyle => {
  const { colors } = useTheme();
  let typeStyleBtn;
  switch (type) {
    case 'primary':
      typeStyleBtn = {
        btn: {
          borderRadius: 8,
          backgroundColor: colors['btn-primary-background']
        },
        text: { color: colors['white'] }
      };
      break;
    case 'secondary':
      typeStyleBtn = {
        btn: { borderRadius: 8, backgroundColor: colors['gray-10'] },
        text: { color: colors['purple-900'] }
      };
      break;
    case 'link':
      typeStyleBtn = {
        btn: { borderRadius: 8, backgroundColor: 'transparent' },
        text: { color: colors['btn-primary-background'] }
      };
      break;

    default:
      typeStyleBtn = {
        btn: { borderRadius: 8, backgroundColor: colors['purple-900'] },
        text: { color: colors['white'] }
      };
      break;
  }
  return typeStyleBtn;
};
