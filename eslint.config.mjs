import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import oxlint from "eslint-plugin-oxlint";

module.exports = [
  {
    files: ["**/*.{js,mjs,cjs,ts}"],
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  oxlint.configs["flat/recommended"],
];
