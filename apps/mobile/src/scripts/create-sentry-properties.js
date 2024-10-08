require('dotenv').config();
const fs = require('fs');
(() => {
  const string = 
`defaults.url=https://sentry.io/
defaults.org=oraichain
defaults.project=owallet-mobile
auth.token=${process.env.SENTRY_TOKEN}`;
  fs.writeFileSync('android/sentry.properties', string, 'utf8');
  fs.writeFileSync('ios/sentry.properties', string, 'utf8');
})();
