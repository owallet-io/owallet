export const colorsCode = {
  // primary
  "primary-10": "#F1F3FC",
  "primary-50": "#E2E8FF",
  "primary-100": "#B3BEF7",
  "primary-200": "#8E9FF2",
  "primary-300": "#7388F0",
  "primary-400": "#4762E7",
  "primary-500": "#2644DB",
  "primary-600": "#102FCB",
  "primary-700": "#0320B4",
  "primary-800": "#001A9A",
  "primary-900": "#00157D",

  // secondary
  secondary: "#FF63B4",
  "secondary-50": "#FCD1F4",
  "secondary-100": "#F3B1E1",
  "secondary-200": "#FA9DD9",
  "secondary-300": "#FF86CE",
  "secondary-400": "#FF63B4",
  "secondary-500": "#E753A8",
  "secondary-600": "#C84699",
  "secondary-700": "#A23A83",
  "secondary-800": "#762C64",
  "secondary-900": "#471D40",
  danger: "#F5365C",
  "danger-10": "#FFF1F4",
  "danger-50": "#FFD8E0",
  "danger-100": "#FFBCC9",
  "danger-200": "#FC91A6",
  "danger-300": "#FD5778",
  "danger-400": "#F5365C",
  "danger-500": "#DD1E44",
  "danger-600": "#BC1638",
  "danger-700": "#9A0F2A",
  "danger-800": "#810A22",
  "danger-900": "#65081B",
  "profile-sky-blue": "#80CAFF",
  "profile-mint": "#47DDE7",
  "profile-green": "#78F0C5",
  "profile-yellow-green": "#ADE353",
  "profile-purple": "#D378FE",
  "profile-red": "#FF6D88",
  "profile-orange": "#FEC078",
  "profile-yellow": "#F2ED64",

  card: "#000",
  success: "#2DCE89",
  error: "#F5365C",
  "text-black-very-high": "#030C1D",
  "text-black-high": "#132340",
  "text-black-medium": "#2C4163",
  "text-black-low": "#83838F",
  "text-black-very-low": "#899BB6",
  "text-black-very-very-low": "#C6C6CD",
  "text-black-very-very-very-low": "#DCDCE3",
  "text-primary": "#4334F1",
  "border-white": "#F5F5F5",
  "border-pink": "#D7C4F5",
  white: "#fff",
  black: "#000",
  disabled: "#EEEEF3",
  divider: "#F5F5F5",
  transparent: "#fff", //rgba(255,255,255,0)
  "modal-backdrop": "#fff", //rgba(9,18,50,0.6)
  "card-modal-handle": "#DCDCE3",
  "setting-screen-background": "#FAFBFD",
  "camera-loading-background": "#fff", // rgba(255,255,255,0.95)
  "big-image-placeholder": "#E7E4EF",
  // red
  "red-10": "#F8EFFF",
  "red-50": "#F3F1F5",
  "red-500": "#E63A3A",
  "red-700": "#FF0000",
  "red-900": "#E53A3A",

  // gray
  "gray-10": "#F3F1F5",
  "gray-50": "#F2F2F7",
  "gray-80": "#F5F5F7",
  "gray-100": "#F2F6FA",
  "gray-150": "#5F5E77",
  "gray-200": "#D1D1D6",
  "gray-250": "#EBEDF2",
  "gray-300": "#C7C7CC",
  "gray-301": "#C7C7CC",
  "gray-400": "#AEAEB2",
  "gray-500": "#8E8E93",
  "gray-600": "#636366",
  "gray-700": "#5F5E77",
  "gray-800": "#3A3A3C",
  "gray-900": "#1C1C1E",
  "text-body": "#6A6B71",

  //green
  "green-500": "#4BB10C",
  "green-active": "#90B51B",

  // purple
  "purple-10": "#F3F1F5",
  "purple-50": "#EAE9FF",
  "purple-100": "#E2DEEB",
  "purple-400": "#AE94DE",
  "purple-700": "#945EF8",
  "purple-900": "#8B1BFB",
  "purple-h1": "#7E58EA",
  "primary-default": "#5C00A3",
  "primary-subtitle": "#F4E5FF",
  // yellow
  "yellow-10": "#FFF6E9",
  //orange
  "orange-800": "#EF6363",
  //blue
  "blue-300": "#8C93A7",
  "blue-400": "#7C8397",
  "blue-600": "#5F5E77",
  "blue/Border-50": "#EDEDF8",
  "bg-icon-coin": "#D3D3DA",
};
//item 1:Dark, item 2: Light
const modeColors = {
  //old colors
  primary: ["#1A1D25", "#fff"],
  "primary-text": ["#E2DEEB", "#1C1C1E"],
  "icon-text": ["#E2DEEB", "#8C93A7"],
  border: ["#83838F", "#E2DEEB"],
  "border-network-modal": ["#111111", colorsCode["blue/Border-50"]],
  "border-gray": ["#111", "#C6C6CD"],
  "border-input-slippage": ["#83838F", colorsCode["gray-300"]],
  //splash-background
  "splash-background": ["#1E1E1E", "#FBF8FF"],
  "sub-primary": ["#434762", "#F3F1F5"],
  "sub-primary-text": ["#E2DEEB", "#3A3A3C"],
  //background
  background: ["#01040D", "#F5F5F5"],
  "box-nft": ["#2B2D3B", "#F6F6F9"],
  "sub-background": ["#2B2D3B", "#F8EFFF"],
  "background-light-gray": ["#EBEDF2", "#EBEDF2"],
  "background-light": ["#F5F5F7", "#F5F5F7"],
  "card-background": ["#0E121D", "#fff"],
  "input-background": ["#2B2D3B", "#fff"],
  "primary-background": ["#5C00A3", "#F3F1F5"],
  "plain-background": ["#01040D", "#fff"],
  "btn-primary-background": ["#5C00A3", "#5C00A3"],
  "btn-disable-background": [colorsCode["blue-600"], colorsCode["gray-300"]],
  // border
  "border-purple-100-gray-800": [
    colorsCode["gray-800"],
    colorsCode["purple-100"],
  ],
  // item
  item: ["#2B2D3B", "#fff"],
  icon: ["#E2DEEB", "#5F5E77"],
  "icon-primary-default-gray": ["#717177", colorsCode["primary-default"]],
  // text
  label: ["#fff", "#3A3A3C"],
  "colored-label": ["#fff", "#945EF8"],
  "sub-text": ["#8C93A7", "#5F5E77"],
  "text-title": [colorsCode["white"], colorsCode["gray-900"]],
  "text-btn-disable-color": [colorsCode["gray-500"], colorsCode["white"]],
  "text-gray-900-primary-default": [
    colorsCode["primary-default"],
    colorsCode["gray-900"],
  ],

  //onBoarding page
  "background-container": ["#01040D", "#FFFFFF"], //
  "text-title-sub-onBoarding": ["#7E58EA", "#1C1C1E"], //2 gray-900
  "text-content-onBoarding": ["#C7C7CC", "#5F5E77"], //1:gray-300, 2: Blue-600
  "background-btn-primary": ["#945EF8", "#8B1BFB"], //1: Purple/900, 2: Purple/900
  // 'text-btn-primary':["#FFFFFF","#FFFFFF"], //1: Purple/900, 2: Purple/900

  //Login page
  "text-title-login": ["#FFFFFF", "#1C1C1E"], // 2 gray-900
  // 'text-btn-secondary':["#8B1BFB","#8B1BFB"], //1:Purple/900  2 gray-900
  "background-btn-secondary": ["#F3F1F5", "#F3F1F5"], //1: 2 Purple/10
  "text-placeholder-input-login": ["#717177", "#AEAEB2"],
  "text-label-transaction-detail": ["#AEAEB2", "#636366"],
  "background-btn-disable-primary": ["#5F5E77", colorsCode["gray-300"]],
  "background-btn-disable-danger": ["#5F5E77", "#D1D1D6"],
  "text-btn-disable-danger": ["#8E8E93", "#FFFFFF"],
  "text-btn-disabled-primary": ["#8E8E93", colorsCode["white"]],
  "border-input-login": ["#3A3A3C", "#E2DEEB"],
  "on-bg": ["#232125", "#232125"],
  "background-input-modal": ["#0E121D", "#FFFFFF"],
  "text-value-input-login": ["#E2DEEB", "#1C1C1E"], //icon input eyes
  "text-label-input": ["#C7C7CC", "#48484A"], //note under input
  "text-dashboard": [colorsCode["blue-300"], "#48484A"], //note under input
  //login-success
  "text-content-success": ["#E2DEEB", "#5F5E77"],
  "text-btn-link": ["#945EF8", "#8B1BFB"],
  //modal-login-fail
  "title-modal-login-failed": ["#FFFFFF", "#000000"], //content-modal-login-fail
  "btn-icon": ["#945EF8", "#8B1BFB"],
  "btn-mnemonic": ["#945EF8", "#8B1BFB"], //border and text same color
  "background-btn-mnemonic-active": ["rgba(148, 94, 248, 0.25)", "#F3F1F5"],
  "text-btn-advance-options": ["#945EF8", "#8B1BFB"],
  //transaction progress
  "background-btn-input-modal": ["#0E121D", "#F3F1F5"],
  "text-value-input-modal": ["#8C93A7", "#636366"],
  "background-box": ["#0E121D", "#fff"],
  "background-item-list": ["#2B2D3B", "#F3F1F5"],
  "text-place-holder": ["#717177", "#8C93A7"],
  "background-box-shadow": ["#2B2D3B", "#FFFFFF"],
  "text-label-list": [colorsCode["gray-300"], colorsCode["blue-300"]],
  "label-bottom-bar": ["#E2DEEB", "#5F5E77"],
  "border-bottom-tab": ["#3B2368", "#F0F0F0"],
  "on-background-toggle": ["#90B51B", "#90B51B"],
  "off-background-toggle": ["#6F6F76", "#E9E9EA"],
  "bg-icon-token": ["#E5E5EA", "#F3F1F5"],
  "bg-circle-select-modal": [colorsCode["gray-400"], colorsCode["purple-100"]],
  "divided-border-transaction-detail": ["#2B2D3B", "#EDEDF8"],
  skeleton: ["#36384a", "#f3f2f2"],
  "bg-tonner": ["#191B21", "#F6EDFF"],
  "bg-swap-box": ["#1E1E21", "#F6F9FF"],
  "bg-btn-select-token": ["#333339", "#EAF1FF"],
  "icon-primary-surface-default-gray": ["#A22DFF", "#5C00A3"],
  // New UI Colors(28.12.2023)
  // We gonna use this colors from now on
  // I.Neutral
  "neutral-surface-bg": ["#121511", "#F5F5F7"],
  "neutral-surface-bg2": ["#323133", "#F5F5F7"],
  "neutral-surface-card": ["#242325", "#FFFFFF"],
  "neutral-surface-action": ["#323133", "#EBEDF2"],
  "neutral-surface-action2": ["#323133", "#EBEDF2"],
  "neutral-surface-action3": ["#323133", "#F5F5F7"],
  "neutral-surface-toggle-active": ["#494949", "#fff"],
  "neutral-surface-pressed": ["#6A6B71", "#D4D7E1"],
  "neutral-surface-disable": ["#323133", "#EBEDF2"],
  "neutral-border-default": ["#323133", "#EBEDF2"],
  "neutral-border-strong": ["#6A6B71", "#242325"],
  "neutral-border-bold": ["#909298", "#242325"],
  "neutral-border-disable": ["#242325", "#F5F5F7"],
  "neutral-text-heading": ["#EBEDF2", "#242325"],
  "neutral-text-title": ["#F5F5F7", "#242325"],
  "neutral-text-body": ["#909298", "#6A6B71"],
  "neutral-text-body2": ["#909298", "#494949"],
  "neutral-text-action-on-dark-bg": ["#242325", "#FBFBFB"],
  "neutral-text-action-on-light-bg": ["#FBFBFB", "#242325"],
  "neutral-text-disable": ["#494949", "#C6C8CE"],
  "neutral-icon-on-dark": ["#FBFBFB", "#FBFBFB"],
  "neutral-icon-on-light": ["#FBFBFB", "#242325"],
  "neutral-icon-disable": ["#494949", "#C6C8CE"],
  // II.Primary
  "primary-surface-disable": ["#5C00A3", "#EBD1FF"],
  "primary-surface-subtle": ["#3D006B", "#F4E5FF"],
  "primary-surface-active": ["#5C00A3", "#C170FF"],
  "primary-surface-default": ["#9D81EB", "#5C00A3"],
  "primary-surface-pressed": ["#A22DFF", "#7C00DB"],
  "primary-text-action": ["#C170FF", "#7C00DB"],
  "primary-text-pressed": ["#AD42FF", "#A22DFF"],
  // III.Hightlight
  "hightlight-surface-subtle": ["#46580B", "#E4F5B0"],
  "hightlight-surface-active": ["#A3CE1A", "#90B51B"],
  "hightlight-text-title": ["#CAEB60", "#46580B"],
  // IV.Error
  "error-surface-subtle": ["#700B00", "#FFEDEB"],
  "error-surface-active": ["#A81100", "#FFACA3"],
  "error-surface-default": ["#E01600", "#A81100"],
  "error-surface-pressed": ["#FF5947", "#E01600"],
  "error-border-disable": ["#700B00", "#FFD6D1"],
  "error-border-default": ["#E01600", "#A81100"],
  "error-border-pressed": ["#FF5947", "#E01600"],
  "error-text-action": ["#FF5947", "#E01600"],
  "error-text-body": ["#FF5947", "#E01600"],
  // V.Warning
  "warning-surface-subtle": ["#7A4D00", "#FFF8EB"],
  "warning-surface-active": ["#B87500", "#FFE1AD"],
  "warning-surface-default": ["#F29900", "#B87500"],
  "warning-surface-pressed": ["#FFC35C", "#F29900"],
  "warning-border-disable": ["#7A4D00", "#FFF0D6"],
  "warning-border-default": ["#F29900", "#B87500"],
  "warning-border-pressed": ["#FFC35C", "#F29900"],
  "warning-text-action": ["#F29900", "#F29900"],
  "warning-text-body": ["#F29900", "#F29900"],
  // VI.Success
  "success-surface-subtle": ["#007018", "#ECFEEE"],
  "success-surface-active": ["#007018", "#D3FDD7"],
  "success-surface-default": ["#00AD26", "#007018"],
  "success-surface-pressed": ["#39DD47", "#00AD26"],
  "success-border-disable": ["#007018", "#D3FDD7"],
  "success-border-default": ["#00AD26", "#007018"],
  "success-border-pressed": ["#39DD47", "#00AD26"],
  "success-text-action": ["#00AD26", "#00AD26"],
  "success-text-body": ["#00AD26", "#00AD26"],
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

export const DarkModeColorsTheme: TypeTheme = { ...handleMode(true) };
export const LightModeColorsTheme: TypeTheme = { ...handleMode(false) };
