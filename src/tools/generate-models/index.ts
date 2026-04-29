import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import params, { type GenerateModelsParams } from "./params.js";
import { generateModelsFromSource } from "../../api/modelina/index.js";
import type { ModelinaGenerationOptionsInput } from "../../api/modelina/index.js";

export const name = "generate_models";

export const description = `Generate typed payload models from AsyncAPI message schemas using @asyncapi/modelina (Java POJOs, TypeScript interfaces, C# classes, etc.). This is not the template-based @asyncapi/generator "generate" tool — it emits in-memory models only.

Input: source (YAML/JSON string or absolute path), language (java, typescript, csharp, go, javascript, dart, rust, python, kotlin, cpp, php, scala), optional options for indentation and generator settings.

Returns JSON with files (logical filename → generated source), language, and modelCount.`;

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
  server.registerTool(name, {
    title: name,
    description,
    inputSchema: params.shape,
  }, execute);
};

export default {
  name,
  description,
  inputSchema: params.shape,
  execute,
  register,
};
