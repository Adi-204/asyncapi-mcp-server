import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import params, { type QueryParams } from "./params.js";
import { buildToolDescription } from "../_meta.js";

export const name = "list_asyncapi_security_schemes";

export const title = "List AsyncAPI security schemes";

export const description = buildToolDescription({
  name,
  title,
  summary:
    "List security schemes: each item is the scheme `id` plus the parser’s JSON object (type, name, in, flows, etc.).",
  inputs: ["`source`: raw YAML/JSON or absolute path to spec file"],
  returns: ["JSON array of security scheme summary objects."],
  examples: [{ args: { source: "/abs/asyncapi.yaml" } }],
});

export const execute = async ({ source }: QueryParams) => {
  try {
    const { parseToDocument, extractSecuritySchemes } = await import(
      "../../api/parser/index.js"
    );
    const doc = await parseToDocument(source);
    const data = extractSecuritySchemes(doc);
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
