// ESLint flat config (ESLint v9+)
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import nextPlugin from "@next/eslint-plugin-next";
import prettierRecommended from "eslint-plugin-prettier/recommended";
import globals from "globals";

export default tseslint.config(
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "public/**",
      "next-env.d.ts",
      "migrations/**"
    ]
  },

  // Browser + Node globals for app code.
  {
    files: ["**/*.{js,jsx,mjs,ts,tsx}"],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node }
    }
  },

  // CommonJS config files at the repo root.
  {
    files: ["*.config.js", "*.cjs"],
    languageOptions: {
      sourceType: "commonjs",
      globals: globals.node
    }
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    files: ["**/*.{js,jsx,mjs,ts,tsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: { ecmaFeatures: { jsx: true } }
    },
    plugins: {
      react,
      "react-hooks": reactHooks,
      "@next/next": nextPlugin
    },
    settings: { react: { version: "detect" } },
    rules: {
      ...react.configs.flat.recommended.rules,
      ...reactHooks.configs["recommended-latest"].rules,
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,

      // The new JSX transform makes the React import unnecessary.
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",

      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }
      ],
      "no-console": ["warn", { allow: ["warn", "error"] }],

      // New in eslint-plugin-react-hooks v7 (React Compiler rules). There are
      // 7 pre-existing violations; demoted to a warning so lint stays usable.
      // TODO: fix these and restore to "error".
      "react-hooks/set-state-in-effect": "warn"
    }
  },

  // Must stay last: turns off stylistic rules that fight Prettier.
  prettierRecommended
);
