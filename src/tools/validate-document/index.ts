import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import params, { type QueryParams } from "./params.js";
import { validateDocument } from "../../api/parser/index.js";
import { buildToolDescription } from "../_meta.js";

export const name = "validate_document";

export const title = "Validate AsyncAPI document";

export const description = buildToolDescription({
  name,
  title,
  summary:
    "Validate an AsyncAPI document and return `valid` plus a list of validation issues from the parser pipeline.",
  inputs: [
    "`document`: raw YAML/JSON text OR an absolute path to a `.yaml`, `.yml`, or `.json` file",
  ],
  returns: [
    "`{ valid, issues, summary? }` where `issues` include severity/message/path (and optional code)",
  ],
  notes: [
    "`summary` is present only when a valid document model is produced (title/version/asyncapi).",
  ],
  examples: [
    {
      args: {
        document: "/abs/path/to/asyncapi.json",
      },
    },
  ],
});

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
      title,
      description,
      inputSchema: params.shape,
    },
    execute
  );
};

export default { name, title, description, inputSchema: params.shape, execute, register };
