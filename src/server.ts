import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import tools from "./tools/index.js";

const PKG_NAME = "asyncapi-mcp-server";
const PKG_VERSION = "0.1.0";

export default function createServer(): McpServer {
  const server = new McpServer({
    name: PKG_NAME,
    version: PKG_VERSION,
  });

  for (const tool of tools) {
    tool.register(server);
  }

  return server;
}
