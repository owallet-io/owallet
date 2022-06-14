const fs = require('fs');
const { spawn } = require('child_process');
const browserify = require('browserify');

const bundle = () => {
  let start = Date.now();
  const stream = browserify('build/injected/index.js', {
    fullPaths: true,
    insertGlobals: true,
    fast: true,
    // debug: true
  })
    // .transform(unassertify, { global: true })
    // .transform(envify, { global: true })
    .bundle()
    .pipe(fs.createWriteStream('build/injected/injected-provider.bundle.js'));
  stream.on('finish', () => {
    console.log('Bundle took', Date.now() - start, 'ms');
  });
};

const tsProc = spawn('tsc', ['--project', 'tsconfig.provider.json', '--watch']);
tsProc.stdout.on('data', (data) => {
  const msg = data.toString().trim();
  console.log(msg);
  // no error then re-compile
  if (msg.indexOf('Found 0 errors') !== -1) {
    bundle();
  }
});
