import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Not part of the app source: a local Claude Code worktree directory
    // (gitignored, but ESLint's own ignores don't read .gitignore).
    ".claude/**",
    // Vendored third-party library (gif.js), not our code.
    "public/gif.worker.js",
  ]),
]);

export default eslintConfig;
