import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import params, { type QueryParams } from "./params.js";
import { buildToolDescription } from "../_meta.js";

export const name = "get_asyncapi_info";

export const title = "Get AsyncAPI document info";

export const description = buildToolDescription({
  name,
  title,
  summary:
    "Return high-level metadata: `asyncapi` version, `defaultContentType`, and the `info` object (title, version, description, contact, license, tags).",
  inputs: ["`source`: raw YAML/JSON or absolute path to `.yaml`, `.yml`, or `.json`"],
  returns: ["JSON object with `asyncapi`, `defaultContentType?`, and `info`."],
  examples: [{ args: { source: "C:\\\\specs\\\\asyncapi.yaml" } }],
});

export const execute = async ({ source }: QueryParams) => {
  try {
    const { parseToDocument } = await import("../../api/parser/index.js");
    const { extractAsyncApiInfo } = await import(
      "../../api/parser/extractors.js"
    );
    const doc = await parseToDocument(source);
    const data = extractAsyncApiInfo(doc);
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
