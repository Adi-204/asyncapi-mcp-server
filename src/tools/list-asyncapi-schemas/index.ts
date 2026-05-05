import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import params, { type QueryParams } from "./params.js";
import { buildToolDescription } from "../_meta.js";

export const name = "list_asyncapi_schemas";

export const title = "List AsyncAPI schemas (compact)";

export const description = buildToolDescription({
  name,
  title,
  summary:
    "List component schemas as compact rows: `id`, type `summary`, and a one-line `shape`. For full nested JSON, call `get_asyncapi_schema` with an `id` from this list or from `#/components/schemas/MyId`.",
  inputs: ["`source`: raw YAML/JSON or absolute path to spec file"],
  returns: ["JSON array of `{ id, summary, shape }`."],
  notes: [
    "Does not return full schema trees — use `get_asyncapi_schema` for one id.",
  ],
  examples: [{ args: { source: "/abs/asyncapi.yaml" } }],
});

export const execute = async ({ source }: QueryParams) => {
  try {
    const { parseToDocument, extractSchemaSummaries } = await import(
      "../../api/parser/index.js"
    );
    const doc = await parseToDocument(source);
    const data = extractSchemaSummaries(doc);
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
