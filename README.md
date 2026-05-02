# AsyncAPI MCP Server

An [MCP](https://modelcontextprotocol.io/) server for **AsyncAPI**: parse, validate, lint (Spectral), convert versions, generate models (Modelina), and run the AsyncAPI Generator from any MCP client (Cursor, Claude Desktop, VS Code, and others). Uses **stdio** by default—no port or API key for core features.

## Tools

All tools take the spec as **`source`**: inline YAML/JSON or an absolute path to a `.yaml`, `.yml`, or `.json` file.

### `parse_document`

Parse the document and return a structured summary (servers, channels, operations, messages, metadata).

**Parameters:** `source` (string, required).

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

- **Node.js** 22+ (see `package.json` → `engines`).

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

```bash
npm install
npm run build
```

Entrypoint: `dist/index.js` (ESM).

## Development

Inspector: `npm run inspect`. Clone setup, tests, layout: [DEVELOPMENT.md](./DEVELOPMENT.md). Contributions: [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

Apache-2.0 — see `LICENSE` and `package.json`.
