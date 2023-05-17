module.exports = {
  extends: ["prettier", "plugin:astro/recommended"],
  plugins: ["@typescript-eslint", "sort-keys-custom-order", "simple-import-sort", "unused-imports"],
  rules: {
    "simple-import-sort/imports": "error",
    "simple-import-sort/exports": "error",
    "unused-imports/no-unused-imports": "error",
  },
  overrides: [
    {
      // Define the configuration for `.astro` file.
      files: ["**/*.astro"],
      // Allows Astro components to be parsed.
      parser: "astro-eslint-parser",
      // Parse the script in `.astro` as TypeScript by adding the following configuration.
      // It's the setting you need when using TypeScript.
    },
    {
      files: ["**/*.mjs"], // mjsファイルに対する設定
      parser: "@babel/eslint-parser",
      parserOptions: {
        requireConfigFile: false,
        ecmaVersion: 2022,
        sourceType: "module",
      },
    },
    {
      files: ["**/*.ts"],
      parser: "@typescript-eslint/parser",
      parserOptions: {
        project: "./tsconfig.json",
        ecmaVersion: 2022,
        sourceType: "module",
      },
    },
  ],
};
