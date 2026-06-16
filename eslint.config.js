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
        document: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        parseInt: "readonly",
        RegExp: "readonly",
        Event: "readonly",
        DOMException: "readonly",
        console: "readonly",
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
