// module.exports = {
//   root: true,
//   env: { browser: true, es2020: true },
//   extends: [
//     'eslint:recommended',
//     'plugin:@typescript-eslint/recommended',
//     'plugin:react-hooks/recommended',
//   ],
//   ignorePatterns: ['dist', '.eslintrc.cjs'],
//   parser: '@typescript-eslint/parser',
//   plugins: ['react-refresh'],
//   rules: {
//     'react-refresh/only-export-components': [
//       'warn',
//       { allowConstantExport: true },
//     ],
//   },
// }
// module.exports = {
//   root: true,
//   ignorePatterns: ["**/*"],
//   plugins: ["@nx", "simple-import-sort"],

//   overrides: [
//     {
//       // Remove the `root` field.
//       // Remove the `ignorePatterns` field.

//       overrides: [
//         {
//           files: ["*.ts", "*.tsx", "*.js", "*.jsx"],
//           extends: ["@vitejs/eslint-config"],
//           rules: {
//             "@nx/enforce-module-boundaries": [
//               "off",
//               {
//                 enforceBuildableLibDependency: true,
//                 allow: [],
//                 depConstraints: [
//                   {
//                     sourceTag: "*",
//                     onlyDependOnLibsWithTags: ["*"],
//                   },
//                 ],
//               },
//             ],

//             "no-console": [
//               "error",
//               {
//                 allow: ["warn", "error"],
//               },
//             ],
//             "padding-line-between-statements": [
//               "error",
//               { blankLine: "always", prev: ["const", "let", "var"], next: "*" },
//               {
//                 blankLine: "any",
//                 prev: ["const", "let", "var"],
//                 next: ["const", "let", "var"],
//               },
//               { blankLine: "any", prev: ["case", "default"], next: "break" },
//               { blankLine: "any", prev: "case", next: "case" },
//               { blankLine: "always", prev: "*", next: "return" },
//               { blankLine: "always", prev: "block", next: "*" },
//               { blankLine: "always", prev: "*", next: "block" },
//               { blankLine: "always", prev: "block-like", next: "*" },
//               { blankLine: "always", prev: "*", next: "block-like" },
//             ],
//           },
//         },
//         {
//           files: ["*.ts", "*.tsx"],
//           extends: ["@vitejs/eslint-config/typescript"],
//           rules: {
//             "@nrwl/nx/enforce-module-boundaries": [
//               "off",
//               {
//                 enforceBuildableLibDependency: true,
//                 allow: [],
//                 depConstraints: [
//                   {
//                     sourceTag: "*",
//                     onlyDependOnLibsWithTags: ["*"],
//                   },
//                 ],
//               },
//             ],
//             "react-hooks/rules-of-hooks": "error", // Checks rules of Hooks
//             "react-hooks/exhaustive-deps": "warn", // Checks effect dependencies
//             "react/jsx-uses-react": "off",
//             "react/react-in-jsx-scope": "off",
//             "react/no-unescaped-entities": "off",
//             "no-restricted-globals": "off",
//             "no-unused-vars": "error",
//           },
//         },
//         {
//           files: ["*.js", "*.jsx"],
//           extends: ["@vitejs/eslint-config/javascript"],
//           rules: {},
//         },
//       ],
//     },
//   ],
// };

module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react-hooks/recommended",
  ],
  ignorePatterns: ["dist", ".eslintrc.cjs"],
  parser: "@typescript-eslint/parser",
  plugins: ["react-refresh", "import"],
  rules: {
    "react-refresh/only-export-components": [
      "warn",
      { allowConstantExport: true },
    ],
    "sort-imports": [
      "error",
      { ignoreCase: true, ignoreDeclarationSort: true },
    ],
    // this is for sorting imports
    "import/order": [
      "error",
      {
        groups: [
          ["external", "builtin"],
          "internal",
          ["sibling", "parent"],
          "index",
        ],
        pathGroups: [
          {
            pattern: "@(react|react-native)",
            group: "external",
            position: "before",
          },
          {
            pattern: "@src/**",
            group: "internal",
          },
        ],
        pathGroupsExcludedImportTypes: ["internal", "react"],
        "newlines-between": "always",
        alphabetize: {
          order: "asc",
          caseInsensitive: true,
        },
      },
    ],
  },
};
