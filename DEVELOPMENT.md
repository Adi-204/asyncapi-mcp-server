# Development

How to build, test, and extend this MCP server locally.

## Prerequisites

- **Node.js** 24.11+ (`engines.node` in `package.json`)
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
| `src/api/helpers.ts` | Shared resolution of `document` / `source` (inline vs file path) |
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

## Tech stack (summary)

- **MCP:** `@modelcontextprotocol/sdk`
- **Validation:** `zod`
- **AsyncAPI:** `@asyncapi/parser`, `@asyncapi/converter`, `@asyncapi/generator`, `@asyncapi/modelina`
- **Linting:** `@stoplight/spectral-core` and related ruleset packages

Pinned dependency versions and upgrade notes live in `package.json` and `package-lock.json`.
