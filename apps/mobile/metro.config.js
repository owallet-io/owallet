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
const { withSentryConfig } = require("@sentry/react-native/metro");
// const workspaces = getWorkspaces(__dirname);
const currentPath = __dirname;
const rootPath = (() => {
  const i = currentPath.lastIndexOf("/apps/mobile");
  if (i < 0) {
    throw new Error("Could not find apps/mobile in path");
  }

  return currentPath.slice(0, i);
})();

const packages = (() => {
  const res = [];

  const dirs = fs.readdirSync(`${rootPath}/packages/`);
  for (const dir of dirs) {
    const stat = fs.statSync(`${rootPath}/packages/${dir}`);
    if (stat.isDirectory() && fs.existsSync(`${rootPath}/packages/${dir}/package.json`)) {
      res.push(`/packages/${dir}`);
    }
  }
  const dirs2 = fs.readdirSync(`${rootPath}/apps/`);
  for (const dir of dirs2) {
    if (dir === "mobile") {
      // 당근 자기 자신은 무시한다.
      continue;
    }

    const stat = fs.statSync(`${rootPath}/apps/${dir}`);
    if (stat.isDirectory() && fs.existsSync(`${rootPath}/apps/${dir}/package.json`)) {
      res.push(`/apps/${dir}`);
    }
  }

  return res;
})();
const shouldNohoistLibs = [
  "react-native",
  "react",
  "mobx",
  "mobx-utils",
  "mobx-react-lite",
  "buffer",
  "@gorhom",
  "@tanstack",
  "@shopify",
  "@freakycoder"
];

// Add additional Yarn workspace package roots to the module map
// https://bit.ly/2LHHTP0
// const watchFolders = [
//   path.resolve(__dirname, "../..", "node_modules"),
//   ...workspaces.filter((workspaceDir) => {
//     return !(workspaceDir === __dirname);
//   })
// ];

module.exports = withSentryConfig(mergeConfig(getDefaultConfig(__dirname), {
  projectRoot: path.resolve(__dirname, "."),
  watchFolders: [
    rootPath + "/node_modules",
    ...(() => {
      const res = [];
      for (const pack of packages) {
        res.push(rootPath + pack);
      }
      return res;
    })()
  ],
  resolver: {
    assetExts: assetExts.filter((ext) => ext !== "svg"),
    sourceExts: [...sourceExts, "svg"],
    blockList: exclusionList(
        (() => {
          const res = [];
          for (const lib of shouldNohoistLibs) {
            res.push(new RegExp(`^${rootPath}\\/node_modules\\/${lib}\\/.*$`));
          }

          return res;
        })()
    ),
    extraNodeModules: {
      crypto: path.resolve(__dirname, "./polyfill/crypto"),
      buffer: path.resolve(__dirname, "./node_modules/buffer"),
      stream: path.resolve(__dirname, "./node_modules/stream-browserify"),
      string_decoder: path.resolve(__dirname, "./node_modules/string_decoder"),
      path: path.resolve(__dirname, "./node_modules/path-browserify"),
      http: path.resolve(__dirname, "./node_modules/http-browserify"),
      https: path.resolve(__dirname, "./node_modules/https-browserify"),
      os: path.resolve(__dirname, "./node_modules/os-browserify"),
      zlib: require.resolve("../../node_modules/browserify-zlib"),
      ...(() => {
        const res = {};
        for (const lib of shouldNohoistLibs) {
          res[lib] = `${rootPath}/apps/mobile/node_modules/${lib}`;
        }
        return res;
      })()
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
}));
