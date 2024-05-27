// var cssCode = `
// "neutral-surface-bg": ["#121511", "#F5F5F7"],
// "neutral-surface-bg2": ["#323133", "#F5F5F7"],
// "neutral-surface-card": ["#242325", "#FFFFFF"],
// "neutral-surface-action": ["#323133", "#EBEDF2"],
// "neutral-surface-action2": ["#323133", "#EBEDF2"],
// "neutral-surface-action3": ["#323133", "#F5F5F7"],
// "neutral-surface-toggle-active": ["#494949", "#fff"],
// "neutral-surface-pressed": ["#6A6B71", "#D4D7E1"],
// "neutral-surface-disable": ["#323133", "#EBEDF2"],
// "neutral-border-default": ["#323133", "#EBEDF2"],
// "neutral-border-strong": ["#6A6B71", "#242325"],
// "neutral-border-bold": ["#909298", "#242325"],
// "neutral-border-disable": ["#242325", "#F5F5F7"],
// "neutral-text-heading": ["#EBEDF2", "#242325"],
// "neutral-text-title": ["#F5F5F7", "#242325"],
// "neutral-text-body": ["#909298", "#6A6B71"],
// "neutral-text-body2": ["#909298", "#494949"],
// "neutral-text-action-on-dark-bg": ["#242325", "#FBFBFB"],
// "neutral-text-action-on-light-bg": ["#FBFBFB", "#242325"],
// "neutral-text-disable": ["#494949", "#C6C8CE"],
// "neutral-icon-on-dark": ["#FBFBFB", "#FBFBFB"],
// "neutral-icon-on-light": ["#FBFBFB", "#242325"],
// "neutral-icon-disable": ["#494949", "#C6C8CE"],
// // II.Primary
// "primary-surface-disable": ["#5C00A3", "#EBD1FF"],
// "primary-surface-subtle": ["#3D006B", "#F4E5FF"],
// "primary-surface-active": ["#5C00A3", "#C170FF"],
// "primary-surface-default": ["#9D81EB", "#5C00A3"],
// "primary-surface-pressed": ["#A22DFF", "#7C00DB"],
// "primary-text-action": ["#C170FF", "#7C00DB"],
// "primary-text-pressed": ["#AD42FF", "#A22DFF"],
// // III.Highlight
// "highlight-surface-subtle": ["#46580B", "#E4F5B0"],
// "highlight-surface-active": ["#A3CE1A", "#90B51B"],
// "highlight-text-title": ["#CAEB60", "#46580B"],
// // IV.Error
// "error-surface-subtle": ["#700B00", "#FFEDEB"],
// "error-surface-active": ["#A81100", "#FFACA3"],
// "error-surface-default": ["#E01600", "#A81100"],
// "error-surface-pressed": ["#FF5947", "#E01600"],
// "error-border-disable": ["#700B00", "#FFD6D1"],
// "error-border-default": ["#E01600", "#A81100"],
// "error-border-pressed": ["#FF5947", "#E01600"],
// "error-text-action": ["#FF5947", "#E01600"],
// "error-text-body": ["#FF5947", "#E01600"],
// // V.Warning
// "warning-surface-subtle": ["#7A4D00", "#FFF8EB"],
// "warning-surface-active": ["#B87500", "#FFE1AD"],
// "warning-surface-default": ["#F29900", "#B87500"],
// "warning-surface-pressed": ["#FFC35C", "#F29900"],
// "warning-border-disable": ["#7A4D00", "#FFF0D6"],
// "warning-border-default": ["#F29900", "#B87500"],
// "warning-border-pressed": ["#FFC35C", "#F29900"],
// "warning-text-action": ["#F29900", "#F29900"],
// "warning-text-body": ["#F29900", "#F29900"],
// // VI.Success
// "success-surface-subtle": ["#007018", "#ECFEEE"],
// "success-surface-active": ["#007018", "#D3FDD7"],
// "success-surface-default": ["#00AD26", "#007018"],
// "success-surface-pressed": ["#39DD47", "#00AD26"],
// "success-border-disable": ["#007018", "#D3FDD7"],
// "success-border-default": ["#00AD26", "#007018"],
// "success-border-pressed": ["#39DD47", "#00AD26"],
// "success-text-action": ["#00AD26", "#00AD26"],
// "success-text-body": ["#00AD26", "#00AD26"],
// `;

// const output = cssCode.replace(/\["(.*?)", "(.*?)"\]/g, "$2");
// let modifiedOutput = output.replace(/^/gm, "$");
// modifiedOutput = modifiedOutput.replace(/"/g, "");

// console.log(modifiedOutput);

const scssVariables = `
$neutral-surface-bg: #f5f5f7;
$neutral-surface-bg2: #f5f5f7;
$neutral-surface-card: #ffffff;
$neutral-surface-action: #ebedf2;
$neutral-surface-action2: #ebedf2;
$neutral-surface-action3: #f5f5f7;
$neutral-surface-toggle-active: #fff;
$neutral-surface-pressed: #d4d7e1;
$neutral-surface-disable: #ebedf2;
$neutral-border-default: #ebedf2;
$neutral-border-strong: #242325;
$neutral-border-bold: #242325;
$neutral-border-disable: #f5f5f7;
$neutral-text-heading: #242325;
$neutral-text-title: #242325;
$neutral-text-body: #6a6b71;
$neutral-text-body2: #494949;
$neutral-text-action-on-dark-bg: #fbfbfb;
$neutral-text-action-on-light-bg: #242325;
$neutral-text-disable: #c6c8ce;
$neutral-icon-on-dark: #fbfbfb;
$neutral-icon-on-light: #242325;
$neutral-icon-disable: #c6c8ce;
// II.Primary
$primary-surface-disable: #ebd1ff;
$primary-surface-subtle: #f4e5ff;
$primary-surface-active: #c170ff;
$primary-surface-default: #5c00a3;
$primary-surface-pressed: #7c00db;
$primary-text-action: #7c00db;
$primary-text-pressed: #a22dff;
// III.Highlight
$highlight-surface-subtle: #e4f5b0;
$highlight-surface-active: #90b51b;
$highlight-text-title: #46580b;
// IV.Error
$error-surface-subtle: #ffedeb;
$error-surface-active: #ffaca3;
$error-surface-default: #a81100;
$error-surface-pressed: #e01600;
$error-border-disable: #ffd6d1;
$error-border-default: #a81100;
$error-border-pressed: #e01600;
$error-text-action: #e01600;
$error-text-body: #e01600;
// V.Warning
$warning-surface-subtle: #fff8eb;
$warning-surface-active: #ffe1ad;
$warning-surface-default: #b87500;
$warning-surface-pressed: #f29900;
$warning-border-disable: #fff0d6;
$warning-border-default: #b87500;
$warning-border-pressed: #f29900;
$warning-text-action: #f29900;
$warning-text-body: #f29900;
// VI.Success
$success-surface-subtle: #ecfeee;
$success-surface-active: #d3fdd7;
$success-surface-default: #007018;
$success-surface-pressed: #00ad26;
$success-border-disable: #d3fdd7;
$success-border-default: #007018;
$success-border-pressed: #00ad26;
$success-text-action: #00ad26;
$success-text-body: #00ad26;
`;

// Define the regex pattern to match SCSS variable declarations
const regex = /\$(.*?):\s(.*?);/g;

// Create an object to store the converted variables
const convertedVariables = {};

// Iterate over each match and extract the variable name and value
let match;
while ((match = regex.exec(scssVariables)) !== null) {
  const variableName = match[1].trim();
  const variableValue = match[2].trim();
  convertedVariables[variableName] = variableValue;
}

// Convert the object to a JSON-like string
const jsonLikeString = JSON.stringify(convertedVariables, null, 2);

console.log(jsonLikeString);
