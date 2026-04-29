# AsyncAPI MCP Server

An [MCP (Model Context Protocol)](https://modelcontextprotocol.io/) server that brings **AsyncAPI** into AI-assisted workflows. It wraps the official AsyncAPI JavaScript tooling—parser, Spectral linting, converter, Modelina, and the Generator—so any MCP-capable client (Cursor, Claude Desktop, VS Code, and others) can **parse**, **validate**, **lint**, **convert**, **generate models**, and **run template-based generation** on AsyncAPI documents without shelling out to separate CLIs.

The server communicates over **stdio** (subprocess transport), which matches how most IDEs and desktop agents run local MCP servers: no open port, no API keys required for core features.

---

## Tools

Each tool takes the AsyncAPI **spec** as **`source`**: either inline YAML/JSON or an absolute path to a `.yaml`, `.yml`, or `.json` file.

### `parse_document`

Parse an AsyncAPI document and return a structured summary (servers, channels, operations, messages, metadata).

**Parameters:**

- `source` (string, required): Raw YAML/JSON content or absolute file path to the spec.

### `validate_document`

Validate the document for structural correctness using the AsyncAPI parser and report issues (with severity/message/path and optional codes).

**Parameters:**

- `source` (string, required): Raw YAML/JSON content or absolute file path.

### `lint_spec`

Lint an AsyncAPI document with Spectral, using the built-in AsyncAPI rulesets (e.g. `spectral:asyncapi`) unless you supply a custom ruleset.

**Parameters:**

- `source` (string, required): Raw YAML/JSON content or absolute file path.
- `ruleset` (string, optional): Path to a Spectral ruleset file (may extend `spectral:asyncapi`).

### `convert_spec`

Convert an AsyncAPI document toward a **target version** (e.g. 2.x → 3.x). Downgrades are not supported.

**Parameters:**

- `source` (string, required): Raw YAML/JSON content or absolute file path.
- `targetVersion` (string, required): Target version string (e.g. `"3.0.0"`, `"2.6.0"`).
- `outputFormat` (enum, optional): `preserve` | `yaml` | `json` — control output serialization (`preserve` matches input style).
- `options` (object, optional): Passthrough for `@asyncapi/converter` (e.g. `v2tov3`, `openAPIToAsyncAPI`).

### `generate_models`

Generate typed payload models from message schemas via **[@asyncapi/modelina](https://github.com/asyncapi/modelina)**.

**Parameters:**

- `source` (string, required): Raw YAML/JSON content or absolute file path.
- `language` (enum, required): One of: `java`, `typescript`, `csharp`, `go`, `javascript`, `dart`, `rust`, `python`, `kotlin`, `cpp`, `php`, `scala`.
- `options` (object, optional): Modelina-oriented options — `indentation` (`spaces` | `tabs` + `size`), `processorOptions`, `generator` (language-specific; see Modelina docs).

### `generate`

Generate code or documentation from a template using **[@asyncapi/generator](https://github.com/asyncapi/generator)**. Output is written under `targetDir`.

**Parameters:**

- `source` (string, required): Raw YAML/JSON content or absolute file path.
- `template` (string, required): Baked-in template id (if your environment has one) or a full npm template package (e.g. `@asyncapi/html-template`).
- `targetDir` (string, required): **Absolute** directory path for generated files (created if missing).
- `templateParams` (object, optional): String key-value map of template-specific parameters.

---

## Requirements

- **Node.js** 24.11 or newer (see `package.json` `engines`).

No external API key is required. Runtime dependencies are installed with the package as normal npm modules (this is not a single-file bundle).

---

## Installation

### From npm (when published)

```bash
npm install -g asyncapi-mcp-server
```

Or run on demand:

```bash
npx -y asyncapi-mcp-server
```

The first `npx` run can take a minute while npm installs transitive dependencies. If your MCP client times out, install once globally (`npm install -g asyncapi-mcp-server`) and configure the client to run the `asyncapi-mcp-server` binary instead of `npx`.

### Local development build

```bash
git clone <your-repo-url> asyncapi-mcp-server
cd asyncapi-mcp-server
npm install
npm run build
```

Point your MCP client at `node /absolute/path/to/asyncapi-mcp-server/dist/index.js` (see [DEVELOPMENT.md](./DEVELOPMENT.md)).

---

## Usage

### Claude Desktop

Add to `claude_desktop_config.json` (paths depend on your OS):

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

For a **local checkout**, use `node` with the absolute path to `dist/index.js` instead of `npx`.

### Cursor

In **Cursor Settings → MCP**, add a server with command `npx`, arguments `-y`, `asyncapi-mcp-server`, or the same `node …/dist/index.js` pattern for local development.

### VS Code (MCP)

Add to User Settings JSON or `.vscode/mcp.json`, following the same pattern as other stdio servers:

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

After the client loads the server, tools appear automatically; you can ask the model to validate a spec, lint it, convert versions, or generate models/code from your repo’s AsyncAPI files.

---

## Build

```bash
npm install
npm run build
```

The compiled entrypoint is `dist/index.js` (ESM, executable bit set on Unix via `shx chmod`).

---

## Development

For clone/setup, testing, MCP Inspector, and how the repo is laid out, see **[DEVELOPMENT.md](./DEVELOPMENT.md)**.  
For contribution guidelines, see **[CONTRIBUTING.md](./CONTRIBUTING.md)**.

---

## License

Apache License 2.0 — see `package.json` and the `LICENSE` file in this repository (if present).
