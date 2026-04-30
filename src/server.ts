import { readFileSync } from "node:fs";
import { join } from "node:path";

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import tools from "./tools/index.js";

const pkgPath = join(__dirname, "..", "package.json");
const { name, version } = JSON.parse(readFileSync(pkgPath, "utf8")) as {
  name: string;
  version: string;
};

export default function createServer(): McpServer {
  const server = new McpServer({
    name,
    version,
  });

  for (const tool of tools) {
    tool.register(server);
  }

  return server;
}
