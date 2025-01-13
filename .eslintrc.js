module.exports = {
  parser: "@typescript-eslint/parser",
  extends: ["plugin:@typescript-eslint/recommended", "plugin:react/recommended", "plugin:import/typescript"],
  plugins: ["react-hooks", "unicorn", "import"],
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: "module",
    ecmaFeatures: {
      jsx: true
    }
  },
  rules: {
    "react/prop-types": "off",
    "react/self-closing-comp": "error",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-inferrable-types": "off",
    "@typescript-eslint/no-use-before-define": "off",
    "@typescript-eslint/no-empty-function": "warn",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/camelcase": "off",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    "unicorn/filename-case": [
      "error",
      {
        case: "kebabCase"
      }
    ],
    "import/no-extraneous-dependencies": [
      "error",
      {
        devDependencies: ["**/*.spec.ts", "**/*.spec.js", "**/webpack.config.js"]
      }
    ],
      "import/no-default-export": "error",
    "no-unused-vars": "off", // or "@typescript-eslint/no-unused-vars": "off",
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_"
        }
      ],
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }]
    },
  settings: {
    react: {
      version: "detect"
    }
  }
};
