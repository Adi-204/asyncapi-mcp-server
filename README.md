# AsyncAPI MCP Server

An [MCP](https://modelcontextprotocol.io/) server for **AsyncAPI**: parse and summarize specs, validate, lint (Spectral), convert versions, generate models (Modelina), and run the AsyncAPI Generator from any MCP client (Cursor, Claude Desktop, VS Code, and others). Uses **stdio** by default—no port or API key for core features.

## Tools

Most tools take **`source`**: inline YAML/JSON or an absolute path to a `.yaml`, `.yml`, or `.json` file. For full parameter shapes (enums, optional fields), use your MCP client’s tool definitions.

| Tool | Purpose |
|------|---------|
| `get_asyncapi_info` | AsyncAPI version, default content type, and `info` block (contact, license, tags, etc.) |
| `list_asyncapi_servers` | Servers: URLs, hosts, protocols, variables, binding summaries |
| `list_asyncapi_channels` | Channels: addresses, parameters, message ids, bindings |
| `list_asyncapi_operations` | Operations: actions, `operationId`, linked channels and messages |
| `list_asyncapi_messages` | Messages: one-line payload shape; optional headers summary |
| `validate_document` | Parser validation: issues with severity, message, path, codes |
| `lint_spec` | Spectral lint; optional custom ruleset path |
| `convert_spec` | Convert toward a target spec version (e.g. 2.x → 3.x); needs `targetVersion` and optional output options |
| `generate_models` | Typed models via Modelina; needs `language` and optional Modelina options |
| `generate` | Generate from a template; needs `template`, absolute `targetDir`, optional `templateParams` |

`convert_spec`, `generate_models`, and `generate` require extra arguments beyond `source`; see each tool’s schema in the client.

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
