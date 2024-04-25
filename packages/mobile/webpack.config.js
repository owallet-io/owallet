/* eslint-disable @typescript-eslint/no-var-requires */
const webpack = require('webpack');
const path = require('path');
const BundleAnalyzerPlugin =
  require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const isEnvDevelopment = process.env.NODE_ENV !== 'production';
const isEnvAnalyzer = process.env.ANALYZER === 'true';
const tsRule = {
  test: /\.ts$/,
  loader: 'ts-loader',
  options: { transpileOnly: true, configFile: 'tsconfig.provider.json' }
};
const fallback = {
  fs: false,
  tls: false,
  net: false,
  os: false,
  url: false,
  path: false,
  assert: false,
  querystring: false,
  http: require.resolve('stream-http'),
  crypto: require.resolve('crypto-browserify'),
  stream: require.resolve('stream-browserify'),
  https: require.resolve('https-browserify')
};
module.exports = (env, args) => {
  return {
    name: 'mobile',
    mode: isEnvDevelopment ? 'development' : 'production',
    // In development environment, turn on source map.
    devtool: isEnvDevelopment ? 'cheap-source-map' : false,
    // In development environment, webpack watch the file changes, and recompile
    watch: isEnvDevelopment,
    entry: {
      'injected-provider': ['./src/injected/index.ts']
    },
    output: {
      path: path.resolve(__dirname, 'build', 'injected'),
      filename: '[name].bundle.js'
    },
    resolve: {
      extensions: ['.ts', '.js'],
      fallback
    },
    module: {
      rules: [tsRule]
    },
    performance: {
      hints: false,
      maxEntrypointSize: 512000,
      maxAssetSize: 512000
    },
    plugins: [
      new webpack.ProvidePlugin({
        process: 'process/browser',
        Buffer: ['buffer', 'Buffer']
      }),
      new webpack.EnvironmentPlugin(['NODE_ENV']),
      new BundleAnalyzerPlugin({
        analyzerMode: isEnvAnalyzer ? 'server' : 'disabled'
      })
    ]
  };
};
