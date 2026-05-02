# Development

How to build, test, and extend this MCP server locally.

## Prerequisites

- **Node.js** 22+ (`engines.node` in `package.json`)
- **npm** (lockfile is `package-lock.json`)

## Setup

```bash
git clone <repository-url> asyncapi-mcp-server
cd asyncapi-mcp-server
npm install
npm run build
```

The entrypoint is `dist/index.js`. The published CLI binary name is `asyncapi-mcp-server` (see `package.json` `bin`).

## Project layout

| Path | Role |
|------|------|
| `src/index.ts` | Process entry — connects `McpServer` to **stdio** transport |
| `src/server.ts` | Instantiates the MCP server and registers all tools |
| `src/tools/` | One folder per tool — `params.ts` (Zod) + `index.ts` (`register`, `execute`) |
| `src/api/` | Wrappers around AsyncAPI and related libraries (parser, spectral, converter, generator, modelina) |
| `src/api/helpers.ts` | Shared resolution of tool `source` input (inline YAML/JSON vs file path) |
| `tests/` | Vitest tests; `tests/helpers.ts` for MCP client test harness |

## npm scripts

| Script | Purpose |
|--------|---------|
| `npm run build` | `tsc` compile + `chmod +x` on `dist/*.js` (Unix) |
| `npm run watch` | TypeScript watch mode |
| `npm start` | Run compiled server (`node dist/index.js`) |
| `npm test` | `vitest run` |
| `npm run test:watch` | Vitest watch |
| `npm run lint` | ESLint on `src/` |
| `npm run lint:fix` | ESLint with `--fix` |
| `npm run inspect` | Launch **MCP Inspector** against the built server |
| `npm run bump:version` | Bump `package.json` version (used by release CI) |
| `npm run generate:assets` | Build step for release asset generation |

## Testing

Tests use **Vitest** and the official **MCP SDK** in-process (`Client` + linked transports) so tool registration and JSON-RPC behavior match real clients.

```bash
npm run build
npm test
```

When adding a tool, mirror the pattern in `tests/tools/parse-document.test.ts` or `tests/tools/generate-models.test.ts`.

## Debugging with MCP Inspector

1. Build: `npm run build`
2. Run: `npm run inspect`  
   (equivalent to `npx @modelcontextprotocol/inspector node dist/index.js`)

The server uses **stdio** by default; configure the Inspector for stdio when prompted.

## Adding a new tool

1. Create `src/tools/<tool-name>/params.ts` with a Zod `inputSchema` export.
2. Create `src/tools/<tool-name>/index.ts`:
   - Export `name` (snake_case MCP tool id), `description`, `execute`, and `register(server)`.
   - Call `server.registerTool(name, { title, description, inputSchema: params.shape }, execute)`.
3. Implement or extend logic under `src/api/` if it is not a one-liner.
4. Register the tool in `src/tools/index.ts` by importing it and appending to the `tools` array.
5. Add `tests/tools/<tool-name>.test.ts`.

Avoid logging to **stdout** from the server process—the MCP wire protocol uses stdout. Use **stderr** for diagnostics only (see `src/index.ts`).

## Release process

This project uses [semantic-release](https://github.com/semantic-release/semantic-release) to automate versioning, npm publishing, and GitHub Release creation. The entire flow is driven by **Conventional Commits** — no manual version bumps or publish commands are needed for normal releases.

### How it works (end-to-end)

```
PR merged to main
       │
       ▼
 ┌─────────────────────────────────────────┐
 │ Release workflow (.github/workflows/    │
 │ release.yml) triggers if the squash     │
 │ commit starts with fix: or feat:        │
 └─────────────────────────────────────────┘
       │
       ▼
 Tests run on ubuntu / macOS / Windows
       │
       ▼
 semantic-release analyzes commits since
 the last release tag
       │
       ▼
 Determines version bump (patch / minor / major)
       │
       ▼
 Publishes to npm with provenance
       │
       ▼
 Creates a GitHub Release with auto-generated
 changelog from commit messages
       │
       ▼
 Version-bump workflow opens a PR to update
 package.json with the new version number
```

### Conventional Commits and version bumps

The commit message (or squash-merge PR title) determines the release type:

| Prefix | Example | Release |
|--------|---------|---------|
| `fix:` | `fix: resolve spectral ruleset path on Windows` | **Patch** (1.3.0 → 1.3.1) |
| `feat:` | `feat: add tool to list AsyncAPI templates` | **Minor** (1.3.0 → 1.4.0) |
| `feat!:` or `fix!:` | `feat!: drop Node 18 support` | **Major** (1.3.0 → 2.0.0) |
| `BREAKING CHANGE:` in body | Any prefix with `BREAKING CHANGE:` in the commit body | **Major** |
| `docs:`, `chore:`, `test:`, `refactor:`, `ci:` | `docs: update DEVELOPMENT.md` | **No release** |

Commits that don't start with `fix:` or `feat:` (including breaking variants) **do not trigger the release workflow at all**.

### Pre-release channels

Push to the `beta` or `alpha` branches to create pre-release versions:

- `beta` branch → e.g. `2.0.0-beta.1`
- `alpha` branch → e.g. `2.0.0-alpha.1`

These are published to npm under dist-tags (`npm install asyncapi-mcp-server@beta`). The `.releaserc` file configures which branches are release branches.

### Configuration files

| File | Purpose |
|------|---------|
| `.releaserc` | semantic-release branch and plugin configuration |
| `.github/workflows/release.yml` | CI workflow: test matrix + semantic-release publish |
| `.github/workflows/version-bump.yml` | Opens a PR to bump `package.json` version after a GitHub Release is published |


### Verifying a release

After CI publishes a new version:

1. **npm registry** — `npm view asyncapi-mcp-server versions --json` should list the new version
2. **GitHub Releases** — check the [Releases page](https://github.com/Adi-204/asyncapi-mcp-server/releases) for the auto-generated changelog
3. **Smoke test** — `npx asyncapi-mcp-server` (or `npx asyncapi-mcp-server@<version>`) should start the MCP server on stdio
4. **Version-bump PR** — a PR titled `chore(release): vX.Y.Z` should appear; merge it to keep `package.json` in sync

## Tech stack (summary)

- **MCP:** `@modelcontextprotocol/sdk`
- **Validation:** `zod`
- **AsyncAPI:** `@asyncapi/parser`, `@asyncapi/converter`, `@asyncapi/generator`, `@asyncapi/modelina`
- **Linting:** `@stoplight/spectral-core` and related ruleset packages

Pinned dependency versions and upgrade notes live in `package.json` and `package-lock.json`.
