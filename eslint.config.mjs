import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import tsparser from "@typescript-eslint/parser";

const eslintConfig = [
  // Next.js configs
  ...nextCoreWebVitals,
  ...nextTypescript,

  // Global ignores
  {
    ignores: [
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "node_modules/**",
    ],
  },

  // TypeScript configuration
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        project: "./tsconfig.json",
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    rules: {
      // TypeScript recommended rules
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": ["warn", {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_"
      }],
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-non-null-assertion": "warn",
      "@typescript-eslint/consistent-type-imports": ["warn", {
        prefer: "type-imports",
        disallowTypeAnnotations: false,
      }],
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/await-thenable": "error",
      "@typescript-eslint/no-misused-promises": "error",

      // Import organization rules
      "import/order": ["warn", {
        groups: [
          "builtin",
          "external",
          "internal",
          ["parent", "sibling"],
          "index",
          "object",
          "type",
        ],
        "newlines-between": "always",
        alphabetize: {
          order: "asc",
          caseInsensitive: true,
        },
      }],
      "import/no-duplicates": "warn",
      "import/no-unused-modules": "warn",
      "import/newline-after-import": "warn",

      // Accessibility rules (extend Next.js defaults)
      "jsx-a11y/alt-text": "warn",
      "jsx-a11y/anchor-is-valid": "warn",
      "jsx-a11y/aria-props": "warn",
      "jsx-a11y/aria-unsupported-elements": "warn",
      "jsx-a11y/click-events-have-key-events": "warn",
      "jsx-a11y/heading-has-content": "warn",
      "jsx-a11y/html-has-lang": "warn",
      "jsx-a11y/img-redundant-alt": "warn",
      "jsx-a11y/interactive-supports-focus": "warn",
      "jsx-a11y/label-has-associated-control": "warn",
      "jsx-a11y/no-noninteractive-element-interactions": "warn",
      "jsx-a11y/role-has-required-aria-props": "warn",

      // Code complexity rules
      "complexity": ["warn", 15],
      "max-depth": ["warn", 4],
      "max-lines-per-function": ["warn", {
        max: 300,
        skipBlankLines: true,
        skipComments: true
      }],
      "max-nested-callbacks": ["warn", 3],
    },
  },

  // API routes and Server Actions: enforce logging through lib/logger.ts
  // and client-safe error messages through lib/errors.ts. Scoped narrowly
  // (not src/lib/**) because a few lib utilities still log error.message
  // directly for their own internal logging, not to a client response.
  {
    files: ["src/app/api/**/route.ts", "src/app/**/actions.ts"],
    rules: {
      "no-console": "error",
      "no-restricted-syntax": ["error", {
        selector: "CatchClause MemberExpression[property.name=/^(message|stack|name)$/]",
        message:
          "Don't read error.message/.stack/.name directly. Call toSafeErrorMessage(error, fallback) from '@/lib/errors' instead — it returns a client-safe message and logs the real error for you.",
      }],
    },
  },
];

export default eslintConfig;
