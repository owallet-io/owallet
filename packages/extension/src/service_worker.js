// for checking
window = {};

try {
  importScripts('browser-polyfill.js', 'background.bundle.js' /*, and so on */);
} catch (e) {
  console.error(e);
}
