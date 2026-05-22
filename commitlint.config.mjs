/**
 * Conventional Commits. Enforced via .husky/commit-msg.
 *
 * Per CLAUDE.md commit message rules: `feat:`, `fix:`, `chore:`, `docs:`,
 * `refactor:`, `test:`, `perf:`, `style:`, `ci:`, `build:`, `revert:`.
 *
 * Subject is the part after the type, e.g. "add branch management module".
 * Body uses sentence case; subject does not require it.
 */
const commitlintConfig = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "subject-case": [0], // allow any case in subject
    "body-max-line-length": [0], // long URLs in body OK
    "footer-max-line-length": [0],
  },
};

export default commitlintConfig;
