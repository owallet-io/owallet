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

module.exports = (env, args) => {
  return {
    name: 'extension',
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
      extensions: ['.ts', '.js']
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
      new webpack.EnvironmentPlugin(['NODE_ENV']),
      new BundleAnalyzerPlugin({
        analyzerMode: isEnvAnalyzer ? 'server' : 'disabled'
      })
    ]
  };
};
