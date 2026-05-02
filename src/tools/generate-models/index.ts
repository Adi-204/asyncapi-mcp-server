import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import params, { type GenerateModelsParams } from "./params.js";
import type { ModelinaGenerationOptionsInput } from "../../api/modelina/index.js";
import { buildToolDescription } from "../_meta.js";

export const name = "generate_models";

export const title = "Generate payload models (Modelina)";

export const description = buildToolDescription({
  name,
  title,
  summary:
    "Generate typed payload models from AsyncAPI message schemas using `@asyncapi/modelina` (e.g. TypeScript interfaces, Java POJOs, C# classes).",
  inputs: [
    "`source`: raw YAML/JSON text OR an absolute path to a `.yaml`, `.yml`, or `.json` file",
    "`language`: target language for generated models (e.g. `typescript`, `java`)",
    "`options` (optional): indentation and generator/processor options (must be JSON-serializable)",
  ],
  returns: [
    "`{ files, language, modelCount }` where `files` maps logical filenames to generated source text",
  ],
  notes: [
    "This is NOT the template-based `generate` tool (no files are written; output is returned in-memory).",
  ],
  examples: [
    {
      args: {
        source: "/abs/path/to/asyncapi.yaml",
        language: "typescript",
        options: { indentation: { type: "spaces", size: 2 } },
      },
    },
  ],
});

function toModelinaOptions(
  opts: GenerateModelsParams["options"]
): ModelinaGenerationOptionsInput | undefined {
  if (!opts) return undefined;
  return {
    ...(opts.indentation !== undefined ? { indentation: opts.indentation } : {}),
    ...(opts.processorOptions !== undefined
      ? { processorOptions: opts.processorOptions as ModelinaGenerationOptionsInput["processorOptions"] }
      : {}),
    ...(opts.generator !== undefined ? { generator: opts.generator } : {}),
  };
}

export const execute = async ({
  source,
  language,
  options,
}: GenerateModelsParams) => {
  try {
    const { generateModelsFromSource } = await import("../../api/modelina/index.js");
    const result = await generateModelsFromSource(source, language, toModelinaOptions(options));
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
