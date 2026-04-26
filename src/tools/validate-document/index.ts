import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import params, { type QueryParams } from "./params.js";
import { validateDocument } from "../../parser-api/index.js";

export const name = "validate_document";

export const description = `AsyncAPI MCP server — validate an AsyncAPI document for schema and Spectral rules.
Returns a JSON object with { valid, issues, summary? }.
Accepts either raw YAML/JSON content or an absolute file path (e.g. /path/to/asyncapi.yaml or C:\\path\\to\\asyncapi.yaml).`;

export const execute = async ({ document }: QueryParams) => {
  try {
    const result = await validateDocument(document);
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(result, null, 2),
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
