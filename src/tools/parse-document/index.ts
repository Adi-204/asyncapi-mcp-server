import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import params, { type QueryParams } from "./params.js";
import { buildToolDescription } from "../_meta.js";

export const name = "parse_document";

export const title = "Parse AsyncAPI document";

export const description = buildToolDescription({
  name,
  title,
  summary:
    "Parse an AsyncAPI document and return a structured summary (servers, channels, operations, messages, and metadata).",
  inputs: [
    "`source`: raw YAML/JSON text OR an absolute path to a `.yaml`, `.yml`, or `.json` file",
  ],
  returns: ["JSON summary of the document model (best-effort; no code generation)."],
  notes: [
    "If the input is invalid, this tool returns an error message (and no summary).",
  ],
  examples: [
    {
      args: {
        source: "C:\\\\specs\\\\asyncapi.yaml",
      },
    },
  ],
});

export const execute = async ({ source }: QueryParams) => {
  try {
    const { parseDocument } = await import("../../api/parser/index.js");
    const parsed = await parseDocument(source);
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
      title,
      description,
      inputSchema: params.shape,
    },
    execute
  );
};

export default { name, title, description, inputSchema: params.shape, execute, register };
