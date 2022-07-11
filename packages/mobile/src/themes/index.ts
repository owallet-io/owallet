import { colors } from './colors';
import { fonts } from './fonts';
import { typography } from './typography';
import { spacing } from './spacing';
import { metrics } from './metrics';

import { createTheme } from '@rneui/themed';

const theme = createTheme({
  lightColors: {},
  darkColors: {}
});

export { theme, colors, fonts, typography, spacing, metrics };
