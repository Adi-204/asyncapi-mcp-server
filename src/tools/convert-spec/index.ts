import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ConvertOptions } from "@asyncapi/converter";
import params, { type QueryParams } from "./params.js";
import { buildToolDescription } from "../_meta.js";

export const name = "convert_spec";

export const title = "Convert AsyncAPI version";

export const description = buildToolDescription({
  name,
  title,
  summary:
    "Convert an AsyncAPI document to a newer AsyncAPI version using `@asyncapi/converter`.",
  inputs: [
    "`source`: raw YAML/JSON text OR an absolute path to a `.yaml`, `.yml`, or `.json` file",
    "`targetVersion`: target AsyncAPI version (e.g. `\"3.0.0\"`)",
    "`outputFormat` (optional): `preserve` | `yaml` | `json`",
    "`options` (optional): passthrough converter options (notably `options.v2tov3` for 2.x → 3.x)",
  ],
  returns: [
    "`{ document, inputFormat }` where `document` is YAML/JSON text (depending on `outputFormat`)",
  ],
  notes: [
    "Upgrades only — downgrades are not supported.",
    "External `$ref`s are not resolved during conversion.",
    "If `targetVersion` matches the input version, this can still change serialization when `outputFormat` forces YAML/JSON.",
  ],
  examples: [
    {
      args: {
        source: "C:\\\\specs\\\\asyncapi-2.6.0.yaml",
        targetVersion: "3.0.0",
        outputFormat: "yaml",
        options: { v2tov3: { pointOfView: "application" } },
      },
    },
  ],
});

export const execute = async ({
  source,
  targetVersion,
  outputFormat,
  options,
}: QueryParams) => {
  try {
    const { convertAsyncApiSpec } = await import("../../api/converter/index.js");
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
      title,
      description,
      inputSchema: params.shape,
    },
    execute
  );
};

export default { name, title, description, inputSchema: params.shape, execute, register };
