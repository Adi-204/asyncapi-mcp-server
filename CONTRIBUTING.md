# Contributing to AsyncAPI MCP Server

We want contributing to this repository to be straightforward and predictable. This document describes how we work together on the **asyncapi-mcp-server** project (MCP tools, `src/tools/`, `src/api/`).

## Table of Contents

- [Contribution Flow](#contribution-flow)
- [Issues](#issues)
- [Pull Requests](#pull-requests)
- [Conventional Commits](#conventional-commits)
- [Code Review](#code-review)
- [Development Environment](#development-environment)
- [Code of Conduct](#code-of-conduct)
- [License](#license)


## Contribution Flow

Pull requests may be declined when they do not fit project goals or quality bars. The usual path looks like this:

```
    ┌───────────────────────┐
    │   Open an issue       │
    │   (bug or feature;    │
    │    optional for tiny  │
    │    fixes)             │
    └───────────────────────┘
               ⇩
    ┌───────────────────────┐
    │   Open a Pull         │
    │   Request (aligned    │
    │   with discussion)    │
    └───────────────────────┘
               ⇩
    ┌───────────────────────┐
    │   Review, CI, merge   │
    │   (see Conventional   │
    │    Commits below)     │
    └───────────────────────┘
```

## Issues

Use [GitHub issues](https://github.com/Adi-204/asyncapi-mcp-server/issues) for **bugs** and **feature requests**. 

## Pull Requests

1. **Branch** from the default branch with a descriptive name (e.g. `fix/lint-spec-ruleset-path`).
2. **Match existing patterns** — TypeScript, ESM, Zod for tool inputs; mirror neighboring `src/tools/*/index.ts` modules.
3. **Tests** — Add or update tests when behavior changes; new tools should include Vitest coverage under `tests/tools/`.
4. **Local checks** — Before pushing:

   ```bash
   npm run build
   npm test
   npm run lint
   ```

5. **Describe the PR** in complete sentences: what changed, why, and caveats (e.g. AsyncAPI 3.x-only behavior).

## Conventional Commits

We follow **[Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/#summary)** for **PR titles** (and preferably commit messages). Titles should be **clear**, **descriptive**, and in the **[imperative mood](https://chris.beams.io/posts/git-commit/#imperative)**.

Prefix cheat sheet:

| Prefix | Meaning |
|--------|---------|
| `fix:` | Bug fix |
| `feat:` | New behavior or capability |
| `docs:` | Documentation only |
| `chore:` | Maintenance that does not change runtime behavior |
| `test:` | Tests only |
| `refactor:` | Internal refactor without intended behavior change |

Examples:

- `fix: resolve spectral ruleset path on Windows`
- `feat: add tool to list AsyncAPI templates`
- `docs: clarify MCP Inspector usage in CONTRIBUTING`

## Development Environment

Setup, scripts, and debugging: **[DEVELOPMENT.md](./DEVELOPMENT.md)**.

## License

By contributing, you agree your contributions are licensed under the same terms as this project — **[Apache License 2.0](./LICENSE)**.
