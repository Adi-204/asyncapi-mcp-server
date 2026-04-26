import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import params, { type QueryParams } from "./params.js";
import { listBakedInTemplates } from "../../generator-api/index.js";

export const name = "list_baked_templates";

export const description =
  "AsyncAPI MCP server — list core baked-in templates bundled with @asyncapi/generator. Optionally filter by type, stack, protocol, or target.";

export const execute = async ({ type, stack, protocol, target }: QueryParams) => {
  const filter: QueryParams = {};
  if (type) filter.type = type;
  if (stack) filter.stack = stack;
  if (protocol) filter.protocol = protocol;
  if (target) filter.target = target;

  const hasFilter = Object.values(filter).some(Boolean);
  const templates = listBakedInTemplates(hasFilter ? filter : undefined);

  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(templates, null, 2),
      },
    ],
  };
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
