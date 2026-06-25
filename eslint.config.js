import js from "@eslint/js";
import prettierConfig from "eslint-config-prettier";
import vitest from "@vitest/eslint-plugin";

export default [
  { ignores: ["docs/**"] },
  js.configs.recommended,
  prettierConfig,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        navigator: "readonly",
        window: "readonly",
        document: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        parseInt: "readonly",
        RegExp: "readonly",
        Event: "readonly",
        KeyboardEvent: "readonly",
        MouseEvent: "readonly",
        DOMException: "readonly",
        console: "readonly",
        URL: "readonly",
        File: "readonly",
      },
    },
    rules: {
      "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    },
  },
  {
    ...vitest.configs.recommended,
    files: ["**/*.test.js"],
  },
];
