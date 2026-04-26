#!/usr/bin/env node

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import createServer from "./server.js";

async function main() {
  const transport = new StdioServerTransport();
  const server = createServer();
  await server.connect(transport);
}

main().catch((err) => {
  // Entry-point fatal: must log to stderr (not stdout — MCP wire format)
  // eslint-disable-next-line no-console -- CLI diagnostic only; not MCP protocol traffic
  console.error("Fatal error:", err);
  process.exit(1);
});
