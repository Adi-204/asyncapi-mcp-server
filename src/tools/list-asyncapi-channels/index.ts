import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import params, { type QueryParams } from "./params.js";
import { buildToolDescription } from "../_meta.js";

export const name = "list_asyncapi_channels";

export const title = "List AsyncAPI channels";

export const description = buildToolDescription({
  name,
  title,
  summary:
    "List channels with address, text fields, parameter ids, message ids, tags, and binding summaries.",
  inputs: ["`source`: raw YAML/JSON or absolute path to spec file"],
  returns: ["JSON array of channel summary objects."],
  examples: [{ args: { source: "/abs/path/asyncapi.yaml" } }],
});

export const execute = async ({ source }: QueryParams) => {
  try {
    const { parseToDocument } = await import("../../api/parser/index.js");
    const { extractChannels } = await import("../../api/parser/extractors.js");
    const doc = await parseToDocument(source);
    const data = extractChannels(doc);
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
