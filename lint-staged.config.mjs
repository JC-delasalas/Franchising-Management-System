/**
 * lint-staged runs on `git commit` via the .husky/pre-commit hook.
 *
 * Keep this fast — only lint/format files that are actually staged.
 * Full typecheck runs in CI, not here, because tsc --noEmit on a large
 * codebase is too slow for an interactive commit.
 */
export default {
  "*.{ts,tsx,js,mjs,cjs}": ["eslint --fix", "prettier --write"],
  "*.{json,md,css,yml,yaml}": ["prettier --write"],
};
