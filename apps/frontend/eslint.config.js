import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";

const reactRecommended = react.configs.flat.recommended;
const reactJsxRuntime = react.configs.flat["jsx-runtime"];
const hooksRecommended = reactHooks.configs.flat.recommended;

export default defineConfig([
  {
    ignores: ["dist/**", "node_modules/**"],
  },
  {
    files: ["*.config.js"],
    ...js.configs.recommended,
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: globals.node,
    },
  },
  {
    files: ["src/**/*.{js,jsx}"],
    languageOptions: {
      ...reactRecommended.languageOptions,
      ecmaVersion: "latest",
      sourceType: "module",
      globals: globals.browser,
      parserOptions: {
        ...reactRecommended.languageOptions?.parserOptions,
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      ...reactRecommended.plugins,
      ...hooksRecommended.plugins,
      "react-refresh": reactRefresh,
    },
    settings: {
      react: { version: "detect" },
    },
    rules: {
      ...js.configs.recommended.rules,
      ...reactRecommended.rules,
      ...reactJsxRuntime.rules,
      "no-unused-vars": [
        "warn",
        {
          varsIgnorePattern: "^React$",
          argsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^(err|error)$",
        },
      ],
      "react/prop-types": "off",
      "react/no-unescaped-entities": "off",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
    },
  },
]);
