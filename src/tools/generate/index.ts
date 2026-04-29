import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import params, { type GenerateParams } from "./params.js";
import { generateCode } from "../../api/generator/index.js";
import { buildToolDescription } from "../_meta.js";

export const name = "generate";

export const title = "Generate code/docs from template";

export const description = buildToolDescription({
  name,
  title,
  summary:
    "Generate code or documentation from an AsyncAPI document using an AsyncAPI Generator template.",
  inputs: [
    "`document`: raw YAML/JSON text OR an absolute path to a `.yaml`, `.yml`, or `.json` file",
    "`template`: a baked-in template id OR an npm template package name (e.g. `@asyncapi/html-template`)",
    "`targetDir`: absolute directory path where files will be written (created if missing)",
    "`templateParams` (optional): string key/value map passed to the template",
  ],
  returns: [
    "JSON describing generated output (including a list of created files and their locations).",
  ],
  notes: [
    "This tool writes to disk under `targetDir` (ensure it’s safe/expected).",
  ],
  examples: [
    {
      args: {
        document: "C:\\\\specs\\\\asyncapi.yaml",
        template: "@asyncapi/html-template",
        targetDir: "C:\\\\tmp\\\\asyncapi-gen",
        templateParams: { title: "My API" },
      },
    },
  ],
});

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
      title,
      description,
      inputSchema: params.shape,
    },
    execute
  );
};

export default {
  name,
  title,
  description,
  inputSchema: params.shape,
  execute,
  register,
};
