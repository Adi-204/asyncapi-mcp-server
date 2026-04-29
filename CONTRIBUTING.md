# Contributing

Thank you for helping improve the AsyncAPI MCP server. This document describes how we work together on this repository.

## Before you start

- **Bugs and small fixes:** Open an issue or a PR with a short description of the problem and how you reproduced it.
- **Larger changes:** Prefer opening an issue first so maintainers can agree on scope (new tools, transport modes, breaking schema changes, etc.). Describe the motivation and intended behavior in the issue so reviewers have context.

## Pull requests

1. **Branch** from the default branch with a descriptive name (e.g. `fix/lint-spec-ruleset-path`).
2. **Keep changes focused** — one logical concern per PR is easier to review.
3. **Match existing style** — TypeScript, ESM imports, Zod schemas for tool inputs, and the same patterns as neighboring `src/tools/*/index.ts` modules.
4. **Add or update tests** when behavior changes. New tools should include a Vitest file under `tests/tools/`.
5. **Run checks locally:**

   ```bash
   npm run build
   npm test
   npm run lint
   ```

6. **Describe the PR** in complete sentences: what changed, why, and any caveats (e.g. only works on AsyncAPI 3.x).

## Code review expectations

- PRs are reviewed for correctness, security (especially around file paths and user-supplied content), and maintainability.
- Prefer extending shared helpers in `src/api/helpers.ts` and existing API wrappers under `src/api/` rather than duplicating logic in each tool.

## Development environment

Setup, scripts, and debugging tips: **[DEVELOPMENT.md](./DEVELOPMENT.md)**.

## Conduct

Be respectful and constructive. Assume good faith; focus feedback on the code and the user problem being solved.
