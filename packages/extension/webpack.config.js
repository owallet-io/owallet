/* eslint-disable @typescript-eslint/no-var-requires */
const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const WriteFilePlugin = require('write-file-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const TerserPlugin = require('terser-webpack-plugin');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
const isEnvDevelopment = process.env.NODE_ENV !== 'production';
const isEnvAnalyzer = process.env.ANALYZER === 'true';

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
  https: require.resolve('https-browserify'),
  assert: require.resolve('assert')
};

const commonResolve = (dir) => ({
  extensions: ['.ts', '.tsx', '.js', '.jsx', '.css', '.scss'],
  alias: {
    assets: path.resolve(__dirname, dir)
  },
  fallback
});

const sassRule = {
  test: /(\.s?css)|(\.sass)$/,
  oneOf: [
    // if ext includes module as prefix, it perform by css loader.
    {
      test: /.module(\.s?css)|(\.sass)$/,
      use: [
        'style-loader',
        {
          loader: 'css-loader',
          options: {
            modules: {
              localIdentName: '[local]-[hash:base64]'
            },
            localsConvention: 'camelCase'
          }
        },
        {
          loader: 'sass-loader',
          options: {
            implementation: require('sass')
          }
        }
      ]
    },
    {
      use: [
        'style-loader',
        { loader: 'css-loader', options: { modules: false } },
        {
          loader: 'sass-loader',
          options: {
            implementation: require('sass')
          }
        }
      ]
    }
  ]
};
const tsRule = {
  test: /\.tsx?$/,
  loader: 'ts-loader',
  options: {
    transpileOnly: true,
    allowTsInNodeModules: true
  }
};
const fileRule = {
  test: /\.(svg|png|jpe?g|gif|woff|woff2|eot|ttf)$/i,
  use: [
    {
      loader: 'file-loader',
      options: {
        name: '[name].[ext]',
        publicPath: 'assets',
        outputPath: 'assets'
      }
    }
  ]
};

const extensionConfig = {
  parallelism: 10,
  name: 'extension',
  mode: isEnvDevelopment ? 'development' : 'production',
  // In development environment, turn on source map.
  devtool: isEnvDevelopment ? 'cheap-source-map' : false,
  // In development environment, webpack watch the file changes, and recompile
  watch: isEnvDevelopment,
  entry: {
    popup: ['./src/index.tsx'],
    background: ['./src/background/background.ts'],
    contentScripts: ['./src/content-scripts/content-scripts.ts'],
    injectedScript: ['./src/content-scripts/inject/injected-script.ts']
  },
  output: {
    path: path.resolve(__dirname, process.env.OUT_DIR || (isEnvDevelopment ? 'dist' : 'prod')),
    filename: '[name].bundle.js'
  },
  resolve: commonResolve('src/public/assets'),
  module: {
    rules: [sassRule, tsRule, fileRule, {
      test: /\.m?js/,
      resolve: {
        fullySpecified: false
      }
    }]
  },
  performance: {
    hints: false,
    maxEntrypointSize: 512000,
    maxAssetSize: 512000
  },
  optimization: {
    minimize: !isEnvDevelopment,
    minimizer: [
      new TerserPlugin({
        test: /\.js(\?.*)?$/i, // you should add this property
        extractComments: false,
        terserOptions: {
          compress: {
            drop_console: true,
            drop_debugger: true,
            pure_funcs: ['console.log', 'console.info'] // Delete console
          }
        }
      })
    ]
  },
  plugins: [
    // Remove all and write anyway
    // TODO: Optimizing build process
    new CleanWebpackPlugin(),
    new ForkTsCheckerWebpackPlugin(),
    new NodePolyfillPlugin(),
    new CopyWebpackPlugin(
      [
        {
          from: process.env.GECKO === 'true' ? './src/manifest-gecko.json' : './src/manifest.json',
          to: './manifest.json'
        },
        {
          from: './src/service_worker.js',
          to: './'
        },
        {
          from: '../../node_modules/webextension-polyfill/dist/browser-polyfill.js'
        }
      ],
      { copyUnmodified: true }
    ),
    new HtmlWebpackPlugin({
      template: './src/index.html',
      filename: 'popup.html',
      excludeChunks: ['background', 'contentScripts', 'injectedScript']
    }),
    new WriteFilePlugin(),
    new webpack.EnvironmentPlugin(['NODE_ENV']),
    new BundleAnalyzerPlugin({
      analyzerMode: isEnvAnalyzer ? 'server' : 'disabled'
    }),
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer']
    })
  ]
};

module.exports = extensionConfig;
