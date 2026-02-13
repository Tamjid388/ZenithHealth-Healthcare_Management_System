import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";

export default [
  // Define which files to lint
  { files: ["src/**/*.ts"] },
  
  // Ignore build folders
  { ignores: ["dist/", "node_modules/"] },

  // Base JS recommended rules
  pluginJs.configs.recommended,
  
  // TypeScript recommended rules
  ...tseslint.configs.recommended,

  {
    rules: {
      "no-console": "warn", // Warns on console.log (good for production APIs)
      "@typescript-eslint/no-explicit-any": "warn", // Discourages 'any'
      "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }], // Allows unused vars if prefixed with _ (like req/res)
      "prefer-const": "error",
    },
  },
];