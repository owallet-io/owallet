import { DarkModeTheme, LightModeTheme } from "./mode-colors";
console.log('DarkModeTheme: ', DarkModeTheme);
console.log('LightModeTheme: ', LightModeTheme);

const colorsCode = {
  // primary
  'primary-10': '#F1F3FC',
  'primary-50': '#E2E8FF',
  'primary-100': '#B3BEF7',
  'primary-200': '#8E9FF2',
  'primary-300': '#7388F0',
  'primary-400': '#4762E7',
  'primary-500': '#2644DB',
  'primary-600': '#102FCB',
  'primary-700': '#0320B4',
  'primary-800': '#001A9A',
  'primary-900': '#00157D',

  // secondary
  secondary: '#FF63B4',
  'secondary-50': '#FCD1F4',
  'secondary-100': '#F3B1E1',
  'secondary-200': '#FA9DD9',
  'secondary-300': '#FF86CE',
  'secondary-400': '#FF63B4',
  'secondary-500': '#E753A8',
  'secondary-600': '#C84699',
  'secondary-700': '#A23A83',
  'secondary-800': '#762C64',
  'secondary-900': '#471D40',
  danger: '#F5365C',
  'danger-10': '#FFF1F4',
  'danger-50': '#FFD8E0',
  'danger-100': '#FFBCC9',
  'danger-200': '#FC91A6',
  'danger-300': '#FD5778',
  'danger-400': '#F5365C',
  'danger-500': '#DD1E44',
  'danger-600': '#BC1638',
  'danger-700': '#9A0F2A',
  'danger-800': '#810A22',
  'danger-900': '#65081B',
  'profile-sky-blue': '#80CAFF',
  'profile-mint': '#47DDE7',
  'profile-green': '#78F0C5',
  'profile-yellow-green': '#ADE353',
  'profile-purple': '#D378FE',
  'profile-red': '#FF6D88',
  'profile-orange': '#FEC078',
  'profile-yellow': '#F2ED64',

  card: '#000',
  success: '#2DCE89',
  error: '#F5365C',
  'text-black-very-high': '#030C1D',
  'text-black-high': '#132340',
  'text-black-medium': '#2C4163',
  'text-black-low': '#83838F',
  'text-black-very-low': '#899BB6',
  'text-black-very-very-low': '#C6C6CD',
  'text-black-very-very-very-low': '#DCDCE3',
  'text-primary': '#4334F1',
  'border-white': '#F5F5F5',
  'border-pink': '#D7C4F5',
  white: '#fff',
  black: '#000',
  disabled: '#EEEEF3',
  divider: '#F5F5F5',
  transparent: '#fff', //rgba(255,255,255,0)
  'modal-backdrop': '#fff', //rgba(9,18,50,0.6)
  'card-modal-handle': '#DCDCE3',
  'setting-screen-background': '#FAFBFD',
  'camera-loading-background': '#fff', // rgba(255,255,255,0.95)
  'big-image-placeholder': '#E7E4EF',
  // red
  'red-10': '#F8EFFF',
  'red-50': '#F3F1F5',
  'red-500': '#E63A3A',
  'red-700': '#FF0000',
  'red-900': '#E53A3A',

  // gray
  'gray-10': '#F3F1F5',
  'gray-50': '#F2F2F7',
  'gray-100': '#F2F6FA',
  'gray-150': '#5F5E77',
  'gray-300': '#8C93A7',
  'gray-301': '#C7C7CC',
  'gray-400': '#AEAEB2',
  'gray-500': '#8E8E93',
  'gray-600': '#636366',
  'gray-700': '#5F5E77',
  'gray-800': '#3A3A3C',
  'gray-900': '#1C1C1E',

  //green
  'green-500': '#4BB10C',

  // purple
  'purple-10': '#F3F1F5',
  'purple-50': '#EAE9FF',
  'purple-100': '#E2DEEB',
  'purple-400': '#AE94DE',
  'purple-700': '#945EF8',
  'purple-900': '#8B1BFB',
  'purple-h1': '#7E58EA',
  // yellow
  'yellow-10': '#FFF6E9',
  //orange
  'orange-800': '#EF6363',
  //blue
  'blue-300': '#8C93A7',
  'blue-600': '#5F5E77',
};
export const colors = {
  ...colorsCode,
  ...DarkModeTheme,
  primary: '#1A1D25',
  'primary-text': '#E2DEEB',
  'icon-text': '#E2DEEB',
  border: '#83838F',
  'border-gray': '#111',
  //splash-background
  'splash-background': '#1E1E1E',
  'sub-primary': '#434762',
  'sub-primary-text': '#E2DEEB',
  //background
  background: '#01040D',
  'plain-background': '#01040D',
  'card-background': '#0E121D',
  'sub-background': '#2B2D3B',
  'input-background': '#2B2D3B',
  'primary-background': '#945EF8',
  'btn-primary-background':colorsCode['purple-700'],
  'btn-disable-background':colorsCode['blue-600'],
  //border
  'border-purple-100-gray-800':colorsCode['gray-800'],
  // item
  item: '#2B2D3B',
  icon: '#E2DEEB',
  'icon-purple-700-gray':'#717177',
  // text
  label: '#fff',
  'colored-label': '#fff',
  'sub-text': '#8C93A7',
  'text-title':colorsCode['white'],
  'text-btn-disable-color':colorsCode['gray-500'],
  'text-gray-900-purple-700':colorsCode['purple-700']
};

export const lightColors = {
  ...colorsCode,
  ...LightModeTheme,
  primary: '#fff',
  'primary-text': '#1C1C1E',
  'icon-text': '#8C93A7',
  border: '#E2DEEB',
  'border-gray': '#C6C6CD',
  //splash-background
  'splash-background': '#FBF8FF',
  'sub-primary': '#F3F1F5',
  'sub-primary-text': '#3A3A3C',
  //background
  background: '#F5F5F5',
  'sub-background': '#F8EFFF',
  'card-background': '#fff',
  'input-background': '#fff',
  'primary-background': '#F3F1F5',
  'plain-background': '#fff',
  'btn-primary-background':colorsCode['purple-900'],
  'btn-disable-background':colorsCode['purple-900'],
  // border
  'border-purple-100-gray-800':colorsCode['purple-100'],
  // item
  item: '#fff',
  icon: '#5F5E77',
  'icon-purple-700-gray':colorsCode['purple-700'],
  // text
  label: '#3A3A3C',
  'colored-label': '#945EF8',
  'sub-text': '#5F5E77',
  'text-title':colorsCode['gray-900'],
  'text-btn-disable-color':colorsCode['purple-400'],
  'text-gray-900-purple-700':colorsCode['gray-900']
};
