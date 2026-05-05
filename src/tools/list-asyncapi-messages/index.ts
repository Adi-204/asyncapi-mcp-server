import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import params, { type QueryParams } from "./params.js";
import { buildToolDescription } from "../_meta.js";

export const name = "list_asyncapi_messages";

export const title = "List AsyncAPI messages";

export const description = buildToolDescription({
  name,
  title,
  summary:
    "List messages with names, content types, payload summary (default) or full bounded schema, and optional headers summary.",
  inputs: [
    "`source`: raw YAML/JSON or absolute path to spec file",
    "`includeHeadersSummary` (optional): add headers one-liner when true",
    "`payloadDetail`: `summary` | `full`",
    "`payloadMaxDepth` (optional): depth cap when `payloadDetail` is `full`",
  ],
  returns: ["JSON array of message objects."],
  examples: [
    { args: { source: "/abs/asyncapi.yaml" } },
    {
      description: "Full payload trees (bounded depth)",
      args: {
        source: "/abs/asyncapi.yaml",
        payloadDetail: "full",
        payloadMaxDepth: 6,
      },
    },
  ],
});

export const execute = async ({
  source,
  includeHeadersSummary,
  payloadDetail,
  payloadMaxDepth,
}: QueryParams) => {
  try {
    const { parseToDocument, extractMessages } = await import(
      "../../api/parser/index.js"
    );
    const doc = await parseToDocument(source);
    const data = extractMessages(doc, {
      includeHeadersSummary,
      payloadDetail,
      payloadMaxDepth,
    });
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
