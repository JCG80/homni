
import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "@typescript-eslint/no-unused-vars": "off",
      // Route Objects Standard enforcement
      "no-restricted-syntax": [
        "error",
        {
          selector: "JSXOpeningElement[name.name='Route']",
          message: "Use route objects. Define routes as data (AppRoute[]) and map in AppRouter. JSX <Route> is only allowed in renderRoutes().",
        },
      ],
    },
  },
  // Allow JSX <Route> in AppRouter only
  {
    files: ["src/routes/AppRouter.tsx"],
    rules: {
      "no-restricted-syntax": "off",
    },
  }
);
