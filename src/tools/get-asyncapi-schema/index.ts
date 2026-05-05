import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import params, { type QueryParams } from "./params.js";
import { buildToolDescription } from "../_meta.js";

export const name = "get_asyncapi_schema";

export const title = "Get AsyncAPI schema by id";

export const description = buildToolDescription({
  name,
  title,
  summary:
    "Return one JSON-schema-like object for a component schema id (bounded depth, cycle-safe). Prefer `list_asyncapi_schemas` first to discover ids.",
  inputs: [
    "`source`: raw YAML/JSON or absolute path to spec file",
    "`id`: `components.schemas` key (case-sensitive; e.g. `ChatPayload`)",
    "`maxDepth` (optional): nesting limit (default 8)",
  ],
  returns: ["JSON object tree for the schema, or an error if id is unknown."],
  notes: [
    "If the id is not found, the tool returns an error suggesting `list_asyncapi_schemas`.",
  ],
  examples: [
    {
      args: { source: "C:\\\\specs\\\\asyncapi.yaml", id: "UserProfile" },
    },
  ],
});

export const execute = async ({ source, id, maxDepth }: QueryParams) => {
  try {
    const {
      parseToDocument,
      getSchemaById,
      serializeSchema,
    } = await import("../../api/parser/index.js");
    const doc = await parseToDocument(source);
    const schema = getSchemaById(doc, id);
    if (!schema) {
      return {
        isError: true,
        content: [
          {
            type: "text" as const,
            text: `Unknown schema id "${id}". Call list_asyncapi_schemas with the same source to list valid ids (keys under components.schemas).`,
          },
        ],
      };
    }
    const data = serializeSchema(schema, { maxDepth });
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
