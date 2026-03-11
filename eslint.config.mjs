import tsParser from "@typescript-eslint/parser"

export default [
  {
    ignores: ["node_modules/**", ".next/**", "*.config.{js,mjs,ts}"],
  },
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
    },
    rules: {
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-unused-vars": "off",
    },
  },
  {
    files: ["**/*.{js,jsx}"],
    rules: {
      "no-console": ["warn", { allow: ["warn", "error"] }],
    },
  },
]
