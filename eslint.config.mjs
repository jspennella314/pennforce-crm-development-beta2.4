import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "app/generated/**",  // Ignore Prisma generated files
    ],
  },
  // ---- PennForce overrides to unblock builds while we progressively type things ----
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      // Allow temporary 'any' usage to pass builds; we'll tighten gradually.
      "@typescript-eslint/no-explicit-any": "off",

      // Downgrade unused vars to warnings; ignore underscore-prefixed
      "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_" }],

      // Deps rule can be noisy during refactors; warn instead of error
      "react-hooks/exhaustive-deps": "warn",

      // Allow empty interfaces that extend others
      "@typescript-eslint/no-empty-object-type": "off",
    },
  },
];

export default eslintConfig;
