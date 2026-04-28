import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import params, { type QueryParams } from "./params.js";
import { lintSpec } from "../../api/spectral/index.js";

export const name = "lint_spec";

export const description = `Lint an AsyncAPI document with Spectral's built-in AsyncAPI ruleset (spectral:asyncapi), or an optional custom ruleset file.
Returns JSON { diagnostics: [{ rule, severity, message, path, line }] }.
Source may be raw YAML/JSON or an absolute file path.`;

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
      title: name,
      description,
      inputSchema: params.shape,
    },
    execute
  );
};

export default { name, description, inputSchema: params.shape, execute, register };
