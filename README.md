# AsyncAPI MCP Server

An [MCP](https://modelcontextprotocol.io/) server for **AsyncAPI**: inspect specs (domain tools), validate, lint (Spectral), convert versions, generate models (Modelina), and run the AsyncAPI Generator from any MCP client (Cursor, Claude Desktop, VS Code, and others). Uses **stdio** by default—no port or API key for core features.

## Tools

Most tools take the AsyncAPI document as **`source`**: inline YAML/JSON or an absolute path to a `.yaml`, `.yml`, or `.json` file. **`generate`** and **`convert_spec`** require additional parameters (`template`, `targetDir`, `targetVersion`, etc.); see those sections.

### Domain inspection (split by concern)

Each tool parses once and returns only that slice (smaller responses than dumping a full document in one call).

| Tool | Purpose |
|------|---------|
| `get_asyncapi_info` | `asyncapi` version, `defaultContentType`, and full `info` (contact, license, tags, etc.) |
| `list_asyncapi_servers` | Servers, hosts, protocols, variables, binding summaries |
| `list_asyncapi_channels` | Channels, addresses, parameters, message ids, bindings |
| `list_asyncapi_operations` | Operations, actions, operationId, channel/message links |
| `list_asyncapi_messages` | Messages; default payload **summary**; optional `payloadDetail: full` + `payloadMaxDepth`; optional `includeHeadersSummary` |
| `list_asyncapi_schemas` | Compact index: schema `id`, type summary, one-line `shape` |
| `get_asyncapi_schema` | One component schema by **`id`** (the key under `components.schemas`), bounded depth |
| `list_asyncapi_security_schemes` | Security schemes (`id` plus the parser’s JSON for each scheme, e.g. nested OAuth `flows` when present) |

**Parameters:** each domain tool requires `source` (string). `get_asyncapi_schema` also requires `id`; optional `maxDepth` (default 8). `list_asyncapi_messages` supports `includeHeadersSummary`, `payloadDetail`, `payloadMaxDepth` — see tool descriptions in your MCP client.

For validation diagnostics (severity, paths, codes), use `validate_document` below.

### `validate_document`

Validate structure with the AsyncAPI parser; returns issues (severity, message, path, optional codes).

**Parameters:** `source` (string, required).

### `lint_spec`

Lint with Spectral using built-in AsyncAPI rulesets unless you pass a custom ruleset.

**Parameters:** `source` (string, required); `ruleset` (string, optional)—path to a Spectral ruleset (may extend `spectral:asyncapi`).

### `convert_spec`

Convert toward a target version (e.g. 2.x → 3.x). Downgrades are not supported.

**Parameters:** `source` (string, required); `targetVersion` (string, required, e.g. `"3.0.0"`); `outputFormat` (optional): `preserve` | `yaml` | `json`; `options` (object, optional)—passthrough for `@asyncapi/converter`.

### `generate_models`

Generate typed payload models via [@asyncapi/modelina](https://github.com/asyncapi/modelina).

**Parameters:** `source` (string, required); `language` (enum, required): `java`, `typescript`, `csharp`, `go`, `javascript`, `dart`, `rust`, `python`, `kotlin`, `cpp`, `php`, `scala`; `options` (object, optional)—Modelina options (`indentation`, `processorOptions`, etc.).

### `generate`

Generate from a template with [@asyncapi/generator](https://github.com/asyncapi/generator). Output goes under **`targetDir`**.

**Parameters:** `source` (string, required); `template` (string, required)—built-in template id or npm package (e.g. `@asyncapi/html-template`); `targetDir` (string, required, **absolute** path; created if missing); `templateParams` (object, optional).

## Prerequisites

- **Node.js** 24.11+ (see `package.json` → `engines`).

## Installation

**Published package**

```bash
npm install -g asyncapi-mcp-server
```

On demand:

```bash
npx -y asyncapi-mcp-server
```

If `npx` cold-start times out your client, install globally once and point the client at the `asyncapi-mcp-server` binary.

**From source**

```bash
git clone https://github.com/Adi-204/asyncapi-mcp-server.git
cd asyncapi-mcp-server
npm install && npm run build
```

Use `node /absolute/path/to/asyncapi-mcp-server/dist/index.js` in MCP config.

## Usage

### Claude Desktop

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "asyncapi": {
      "command": "npx",
      "args": ["-y", "asyncapi-mcp-server"]
    }
  }
}
```

For a local build, replace with `"command": "node"` and `"args": ["/absolute/path/to/asyncapi-mcp-server/dist/index.js"]`.

### Cursor

**Settings → MCP:** command `npx`, args `-y`, `asyncapi-mcp-server` (or `node` + path to `dist/index.js` for local dev).

### VS Code

In User Settings JSON or `.vscode/mcp.json`:

```json
{
  "servers": {
    "asyncapi": {
      "command": "npx",
      "args": ["-y", "asyncapi-mcp-server"]
    }
  }
}
```

## Build

Entrypoint: `dist/index.js` (ESM).

```bash
npm install
npm run build
```

## Development

Inspector: `npm run inspect`. Clone setup, tests, layout: [DEVELOPMENT.md](./DEVELOPMENT.md). Contributions: [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

Apache-2.0 — see `LICENSE` and `package.json`.
