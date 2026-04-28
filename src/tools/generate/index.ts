import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import params, { type GenerateParams } from "./params.js";
import { generateCode } from "../../api/generator/index.js";

export const name = "generate";

export const description = `AsyncAPI MCP server — generate code or documentation from an AsyncAPI document using a template.
Writes generated files to the specified target directory and returns a listing of all created files.
Use list_baked_templates first to discover available templates and their supported protocols/targets.
Accepts either raw YAML/JSON content or an absolute file path for the AsyncAPI document.`;

export const execute = async ({
  document,
  template,
  targetDir,
  templateParams,
}: GenerateParams) => {
  try {
    const result = await generateCode({
      document,
      template,
      targetDir,
      templateParams,
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

export default {
  name,
  description,
  inputSchema: params.shape,
  execute,
  register,
};
