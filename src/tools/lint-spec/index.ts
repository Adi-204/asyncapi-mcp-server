import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import params, { type QueryParams } from "./params.js";
import { lintSpec } from "../../api/spectral/index.js";
import { buildToolDescription } from "../_meta.js";

export const name = "lint_spec";

export const title = "Lint AsyncAPI spec (Spectral)";

export const description = buildToolDescription({
  name,
  title,
  summary:
    "Lint an AsyncAPI document using Spectral (defaults to the built-in `spectral:asyncapi` ruleset).",
  inputs: [
    "`source`: raw YAML/JSON text OR an absolute path to a `.yaml`, `.yml`, or `.json` file",
    "`ruleset` (optional): path to a Spectral ruleset file (e.g. `.spectral.yaml`)",
  ],
  returns: ["`{ diagnostics: [{ rule, severity, message, path, line }] }`"],
  notes: [
    "If `ruleset` is omitted/blank, the built-in AsyncAPI ruleset is used.",
  ],
  examples: [
    {
      args: {
        source: "C:\\\\specs\\\\asyncapi.yaml",
      },
    },
  ],
});

export const execute = async ({ source, ruleset }: QueryParams) => {
  try {
    const result = await lintSpec(source, { ruleset });
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
