/* eslint-disable @typescript-eslint/no-var-requires */
const webpack = require("webpack");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const BundleAnalyzerPlugin =
  require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const fs = require("fs");

const isBuildManifestV2 = false;

const isEnvDevelopment = process.env.NODE_ENV !== "production";
const isEnvAnalyzer = process.env.ANALYZER === "true";
const isDisableSplitChunks = false;

const dotenv = require("dotenv");
dotenv.config();

const fallback = {
  fs: false,
  tls: false,
  net: false,
  os: false,
  url: false,
  path: require.resolve("path-browserify"),
  querystring: false,
  http: require.resolve("stream-http"),
  crypto: require.resolve("crypto-browserify"),
  stream: require.resolve("stream-browserify"),
  https: require.resolve("https-browserify"),
  assert: require.resolve("assert"),
  zlib: require.resolve("browserify-zlib"),
};

const commonResolve = (dir) => ({
  extensions: [".ts", ".tsx", ".js", ".jsx"],
  alias: {
    assets: path.resolve(__dirname, dir),
  },
  fallback,
});
const altResolve = () => {
  const p = path.resolve(__dirname, "./src/keplr-wallet-private/index.ts");

  if (fs.existsSync(p)) {
    return {
      alias: {
        "keplr-wallet-private": path.resolve(
          __dirname,
          "./src/keplr-wallet-private/index.ts"
        ),
      },
    };
  }

  return {};
};
const tsRule = { test: /\.tsx?$/, loader: "ts-loader" };
const fileRule = {
  test: /\.(svg|png|webm|mp4|jpe?g|gif|woff|woff2|eot|ttf)$/i,
  type: "asset/resource",
  generator: {
    filename: "assets/[name][ext]",
  },
};

const keplrLogoBase64 = `data:image/png;base64,${fs.readFileSync(
  "src/public/assets/icon/icon-128.png",
  "base64"
)}`;

module.exports = {
  name: "extension",
  mode: isEnvDevelopment ? "development" : "production",
  // In development environment, turn on source map.
  devtool: isEnvDevelopment ? "cheap-source-map" : false,
  // In development environment, webpack watch the file changes, and recompile
  watch: isEnvDevelopment,
  entry: {
    popup: ["./src/index.tsx"],
    register: ["./src/register.tsx"],
    blocklist: ["./src/pages/blocklist/index.tsx"],
    ledgerGrant: ["./src/ledger-grant.tsx"],
    background: ["./src/background/background.ts"],
    contentScripts: ["./src/content-scripts/content-scripts.ts"],
    injectedScript: ["./src/content-scripts/inject/injected-script.ts"],
  },
  output: {
    path: path.resolve(
      __dirname,
      process.env.OUT_DIR || (isEnvDevelopment ? "dist" : "prod")
    ),
    filename: "[name].bundle.js",
  },
  optimization: {
    splitChunks: {
      chunks(chunk) {
        return false;
        if (isDisableSplitChunks) {
          return false;
        }

        const servicePackages = ["contentScripts", "injectedScript"];

        if (!isBuildManifestV2) {
          servicePackages.push("background");
        }

        return !servicePackages.includes(chunk.name);
      },
      cacheGroups: {
        ...(() => {
          const res = {
            popup: {
              maxSize: 3_000_000,
              maxInitialRequests: 100,
              maxAsyncRequests: 100,
            },
            register: {
              maxSize: 3_000_000,
              maxInitialRequests: 100,
              maxAsyncRequests: 100,
            },
            blocklist: {
              maxSize: 3_000_000,
              maxInitialRequests: 100,
              maxAsyncRequests: 100,
            },
            ledgerGrant: {
              maxSize: 3_000_000,
              maxInitialRequests: 100,
              maxAsyncRequests: 100,
            },
          };

          if (isBuildManifestV2) {
            res.background = {
              maxSize: 3_000_000,
              maxInitialRequests: 100,
              maxAsyncRequests: 100,
            };
          }

          return res;
        })(),
      },
    },
  },
  resolve: {
    ...commonResolve("src/public/assets"),
    ...altResolve(),
    fallback: {
      os: require.resolve("os-browserify/browser"),
      buffer: require.resolve("buffer/"),
      http: require.resolve("stream-http"),
      https: require.resolve("https-browserify"),
      crypto: require.resolve("crypto-browserify"),
      stream: require.resolve("stream-browserify"),
      process: require.resolve("process/browser"),
      zlib: require.resolve("browserify-zlib"),
      path: require.resolve("path-browserify"),
    },
  },
  module: {
    rules: [
      tsRule,
      fileRule,
      {
        test: /\.m?js/,
        resolve: {
          fullySpecified: false,
        },
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  plugins: [
    new webpack.ProvidePlugin({
      process: "process/browser",
      Buffer: ["buffer", "Buffer"],
    }),
    new webpack.EnvironmentPlugin(["NODE_ENV"]),
    new ForkTsCheckerWebpackPlugin(),
    new CopyWebpackPlugin({
      patterns: [
        ...(() => {
          if (isBuildManifestV2) {
            return [
              {
                from: "./src/manifest.v2.json",
                to: "./manifest.json",
              },
            ];
          }

          return [
            {
              from: "./src/manifest.v3.json",
              to: "./manifest.json",
            },
          ];
        })(),
        {
          from: "../../node_modules/webextension-polyfill/dist/browser-polyfill.js",
          to: "./",
        },
      ],
    }),

    new HtmlWebpackPlugin({
      template: "./src/index.html",
      filename: "popup.html",
      chunks: ["popup"],
    }),
    new HtmlWebpackPlugin({
      template: "./src/index.html",
      filename: "sidePanel.html",
      chunks: ["popup"],
    }),
    new HtmlWebpackPlugin({
      template: "./src/index.html",
      filename: "register.html",
      chunks: ["register"],
    }),
    new HtmlWebpackPlugin({
      template: "./src/index.html",
      filename: "ledger-grant.html",
      chunks: ["ledgerGrant"],
    }),
    ...(() => {
      if (isBuildManifestV2) {
        return [
          new HtmlWebpackPlugin({
            template: "./src/background.html",
            filename: "background.html",
            chunks: ["background"],
          }),
        ];
      }

      return [];
    })(),
    new BundleAnalyzerPlugin({
      analyzerMode: isEnvAnalyzer ? "server" : "disabled",
    }),
  ],
};
