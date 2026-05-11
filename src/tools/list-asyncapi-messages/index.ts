import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import params, { type QueryParams } from "./params.js";
import { buildToolDescription } from "../_meta.js";

export const name = "list_asyncapi_messages";

export const title = "List AsyncAPI messages";

export const description = buildToolDescription({
  name,
  title,
  summary:
    "List messages with names, content types, one-line payload shape, and optional one-line headers summary.",
  inputs: [
    "`source`: raw YAML/JSON or absolute path to spec file",
    "`includeHeadersSummary` (optional): add headers one-liner when true",
  ],
  returns: ["JSON array of message objects."],
  examples: [
    { args: { source: "/abs/asyncapi.yaml" } },
    {
      args: { source: "/abs/asyncapi.yaml", includeHeadersSummary: true },
    },
  ],
});

export const execute = async ({ source, includeHeadersSummary }: QueryParams) => {
  try {
    const { parseToDocument } = await import("../../api/parser/index.js");
    const { extractMessages } = await import("../../api/parser/extractors.js");
    const doc = await parseToDocument(source);
    const data = extractMessages(doc, includeHeadersSummary);
    return {
      content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
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
    { title, description, inputSchema: params.shape },
    execute
  );
};

export default { name, title, description, inputSchema: params.shape, execute, register };
