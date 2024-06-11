require('dotenv').config();
const fs = require('fs');

const fix = (dirPath) => {
  if (!fs.existsSync(dirPath)) return;
  for (const dir of fs.readdirSync(dirPath)) {
    const jsonFile = dirPath + dir + '/package.json';
    const packageJson = JSON.parse(fs.readFileSync(jsonFile).toString());
    packageJson.module = 'dist/cjs/index.js';
    fs.writeFileSync(jsonFile, JSON.stringify(packageJson, null, 2));
    fix(dirPath + dir + '/' + dirPath);
  }
};

fix('node_modules/@injectivelabs/');
(() => {
  const string = 
`defaults.url=https://sentry.io/
defaults.org=oraichain
defaults.project=owallet-mobile
auth.token=${process.env.SENTRY_TOKEN}`;
  fs.writeFileSync('android/sentry.properties', string, 'utf8');
  fs.writeFileSync('ios/sentry.properties', string, 'utf8');
})();
