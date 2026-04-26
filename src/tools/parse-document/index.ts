import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import params, { type QueryParams } from "./params.js";
import { parseDocument } from "../../parser-api/index.js";

export const name = "parse_document";

export const description = `AsyncAPI MCP server — parse an AsyncAPI document and return a structured summary of its servers, channels, operations, and messages.
Accepts either raw YAML/JSON content or an absolute file path (e.g. /path/to/asyncapi.yaml or C:\\path\\to\\asyncapi.yaml).`;

export const execute = async ({ document }: QueryParams) => {
  try {
    const parsed = await parseDocument(document);
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(parsed, null, 2),
        },
      ],
    };
  } catch (err) {
    return {
      isError: true,
      content: [
        {
          type: "text" as const,
          text: err instanceof Error ? err.message : String(err),
        },
      ],
    };
  }
};

export const register = (server: McpServer) => {
  server.registerTool(
    name,
    {
      title: name,
      description,
      inputSchema: params.shape,
    },
    execute
  );
};

export default { name, description, inputSchema: params.shape, execute, register };
