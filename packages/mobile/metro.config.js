/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */

/* eslint-disable */

const { getDefaultConfig, mergeConfig } = require("@react-native/metro-config");

const exclusionList = require("metro-config/src/defaults/exclusionList");
const sourceExts = require("metro-config/src/defaults/defaults").sourceExts;
const assetExts = require("metro-config/src/defaults/defaults").assetExts;
const getWorkspaces = require("get-yarn-workspaces");
const path = require("path");
const fs = require("fs");
const { createSentryMetroSerializer } = require("@sentry/react-native/dist/js/tools/sentryMetroSerializer");

const workspaces = getWorkspaces(__dirname);

// Add additional Yarn workspace package roots to the module map
// https://bit.ly/2LHHTP0
const watchFolders = [
  path.resolve(__dirname, "../..", "node_modules"),
  ...workspaces.filter((workspaceDir) => {
    return !(workspaceDir === __dirname);
  })
];

module.exports = mergeConfig(getDefaultConfig(__dirname), {
  projectRoot: path.resolve(__dirname, "."),
  watchFolders,
  resolver: {
    assetExts: assetExts.filter((ext) => ext !== "svg"),
    sourceExts: [...sourceExts, "svg"],
    blockList: exclusionList([/packages\/mobile\/node_modules\/react\/.*/]),
    extraNodeModules: {
      crypto: path.resolve(__dirname, "./polyfill/crypto"),
      buffer: path.resolve(__dirname, "../../node_modules/buffer"),
      stream: path.resolve(__dirname, "../../node_modules/stream-browserify"),
      string_decoder: path.resolve(__dirname, "../../node_modules/string_decoder"),
      path: path.resolve(__dirname, "../../node_modules/path-browserify"),
      http: path.resolve(__dirname, "../../node_modules/http-browserify"),
      https: path.resolve(__dirname, "../../node_modules/https-browserify"),
      os: path.resolve(__dirname, "../../node_modules/os-browserify"),
      zlib: require.resolve("../../node_modules/browserify-zlib")
    }
  },
  transformer: {
    minifierPath: require.resolve("metro-minify-esbuild"),
    minifierConfig: {},
    babelTransformerPath: require.resolve("react-native-svg-transformer"),
    getTransformOptions: () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: false
      }
    })
  },
  serializer: {
    customSerializer: createSentryMetroSerializer()
  },
  server: {
    enhanceMiddleware: (middleare) => {
      return (req, res, next) => {
        if (req.originalUrl === "/injected-provider.bundle.js") {
          const injectedProviderFile = path.resolve(__dirname, "./build/injected/injected-provider.bundle.js");
          return res.end(fs.readFileSync(injectedProviderFile));
        }
        return middleare(req, res, next);
      };
    }
  }
});
