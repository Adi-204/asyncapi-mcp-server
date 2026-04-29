import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import tools from "./tools/index.js";

declare const __PKG_NAME__: string;
declare const __PKG_VERSION__: string;

const name: string = typeof __PKG_NAME__ !== "undefined" ? __PKG_NAME__ : "asyncapi-mcp-server";
const version: string = typeof __PKG_VERSION__ !== "undefined" ? __PKG_VERSION__ : "0.0.0";

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
