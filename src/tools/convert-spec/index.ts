import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ConvertOptions } from "@asyncapi/converter";
import { convertAsyncApiSpec } from "../../api/converter/index.js";
import params, { type QueryParams } from "./params.js";

export const name = "convert_spec";

export const description = `Convert an AsyncAPI document toward a newer AsyncAPI version (1.x → 2.x → 3.x) using @asyncapi/converter.
Returns JSON with { document, inputFormat }. The document field is YAML or JSON text depending on outputFormat.

Inputs: source (inline YAML/JSON or file path), targetVersion (e.g. "3.0.0"), optional outputFormat (preserve | yaml | json), optional options.v2tov3 for 2→3 migration (pointOfView application|client, useChannelIdExtension, etc.).

Same AsyncAPI version as targetVersion: only changes serialization when outputFormat differs from the input (YAML ↔ JSON). Upgrades only — downgrades are not supported.

2.x → 3.x: input should be valid AsyncAPI; external $refs are not resolved; see AsyncAPI converter docs for publish/subscribe mapping and known limitations.`;

export const execute = async ({
  source,
  targetVersion,
  outputFormat,
  options,
}: QueryParams) => {
  try {
    const opts = options as ConvertOptions | undefined;
    const result = await convertAsyncApiSpec({
      source,
      targetVersion,
      outputFormat,
      options: opts,
    });
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
      title: name,
      description,
      inputSchema: params.shape,
    },
    execute
  );
};

export default { name, description, inputSchema: params.shape, execute, register };
