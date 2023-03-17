//item 1:Dark, item 2: Light
const modeColors = {
  //onBoarding page
  'background-container': ['#01040D', '#FFFFFF'], //
  'text-title-sub-onBoarding': ['#7E58EA', '#1C1C1E'], //2 gray-900
  'text-content-onBoarding': ['#C7C7CC', '#5F5E77'], //1:gray-300, 2: Blue-600
  'background-btn-primary': ['#945EF8', '#8B1BFB'], //1: Purple/900, 2: Purple/900
  // 'text-btn-primary':["#FFFFFF","#FFFFFF"], //1: Purple/900, 2: Purple/900

  //Login page
  'text-title-login': ['#FFFFFF', '#1C1C1E'], // 2 gray-900
  // 'text-btn-secondary':["#8B1BFB","#8B1BFB"], //1:Purple/900  2 gray-900
  'background-btn-secondary': ['#F3F1F5', '#F3F1F5'], //1: 2 Purple/10
  'text-placeholder-input-login': ['#717177', '#AEAEB2'],
  'background-btn-disable-primary': ['#5F5E77', '#8B1BFB'],
  'text-btn-disabled-primary': ['#8E8E93', '#AE94DE'],
  'border-input-login': ['#3A3A3C', '#E2DEEB'],
  'text-value-input-login': ['#E2DEEB', '#1C1C1E'], //icon input eyes
  'text-label-input': ['#C7C7CC', '#48484A'], //note under input
  //login-success
  'text-content-success': ['#E2DEEB', '#5F5E77'],
  'text-btn-link': ['#945EF8', '#8B1BFB'],
  //modal-login-fail
  'title-modal-login-failed': ['#FFFFFF', '#000000'], //content-modal-login-fail
  'btn-icon': ['#945EF8', '#8B1BFB'],
  'btn-mnemonic': ['#945EF8', '#8B1BFB'], //border and text same color
  'background-btn-mnemonic-active': ['rgba(148, 94, 248, 0.25)', '#F3F1F5'],
  'text-btn-advance-options': ['#945EF8', '#8B1BFB'],
  //transaction progress
  'background-btn-input-modal': ['#0E121D', '#F3F1F5'],
  'text-value-input-modal': ['#8C93A7', '#636366']
};
const typeColorsTheme = () => modeColors;
type TypeTheme = { [P in keyof ReturnType<typeof typeColorsTheme>]: string };

const handleMode = (isDark): TypeTheme => {
  let data: any = {};
  if (isDark) {
    for (const property in modeColors) {
      data[property] = modeColors[property][0];
    }
  } else {
    for (const property in modeColors) {
      data[property] = modeColors[property][1];
    }
  }
  return data;
};

export const DarkModeTheme: TypeTheme = { ...handleMode(true) };
export const LightModeTheme: TypeTheme = { ...handleMode(false) };
