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
      /**
       * Fix #13: Clarify console rules.
       *
       * Strategy: allow `console.warn` and `console.error` only.
       * - `console.log` / `console.info` / `console.debug` are disallowed in
       *   production code.  Use a structured logger (e.g. Sentry, Datadog) to track
       *   runtime events instead.
       * - `console.warn` is allowed for non-critical developer hints (e.g. feature
       *   deprecation notices that won't break functionality).
       * - `console.error` is allowed inside ErrorBoundary.componentDidCatch and
       *   similar last-resort error handlers where no other logger is available.
       *   All other error paths should route through the application error tracker.
       *
       * To suppress the rule for a specific line that genuinely needs console access
       * (e.g. a one-off debug session), use:
       *   // eslint-disable-next-line no-console
       */
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-unused-vars": "off",
    },
  },
  {
    files: ["**/*.{js,jsx}"],
    rules: {
      // Same strategy as TypeScript files (see above)
      "no-console": ["warn", { allow: ["warn", "error"] }],
    },
  },
]
