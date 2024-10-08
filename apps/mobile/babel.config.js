module.exports = {
  presets: ["module:metro-react-native-babel-preset"],
  plugins: [
    [
      "module:react-native-dotenv",
      {
        moduleName: "react-native-dotenv",
      },
    ],
    [
      "module-resolver",
      {
        alias: {
          // This needs to be mirrored in tsconfig.json
          "@src": "./src",
          "@ledgerhq/devices/hid-framing": "@ledgerhq/devices/lib/hid-framing",
          "@assets": "./src/assets",
          "@components": "./src/components",
          "@screens": "./src/screens",
          "@common": "./src/common",
          "@stores": "./src/stores",
          "@utils": "./src/utils",
          "@hooks": "./src/hooks",
        },
      },
    ],
    ["react-native-reanimated/plugin"],
    ["@babel/plugin-transform-flow-strip-types"],
    ["@babel/plugin-proposal-decorators", { legacy: true }],
    ["@babel/plugin-proposal-class-properties", { loose: true }],
    ["@babel/plugin-proposal-export-default-from"],
    ["@babel/plugin-transform-export-namespace-from"],
  ],
};
