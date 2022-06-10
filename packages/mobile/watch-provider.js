const fs = require('fs');
const { spawn } = require('child_process');
const browserify = require('browserify');

const tinyify = () => {
  browserify('build/injected/index.js')
    .transform('unassertify', { global: true })
    .transform('@goto-bus-stop/envify', { global: true })
    // .transform('uglifyify', { global: true })
    // .plugin('common-shakeify')
    // .plugin('browser-pack-flat/plugin')
    .bundle()
    // .pipe(require('minify-stream')({ sourceMap: false }))
    .pipe(fs.createWriteStream('build/injected/injected-provider.bundle.js'));
};

const tsProc = spawn('tsc', ['--project', 'tsconfig.provider.json', '--watch']);
tsProc.stdout.on('data', (data) => {
  const msg = data.toString();
  if (msg.indexOf('Found 0 errors') !== -1) {
    console.log(msg);
    // no error then re-compile
    tinyify();
  }
});
