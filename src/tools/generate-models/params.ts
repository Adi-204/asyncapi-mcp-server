import { z } from "zod";
import { MODEL_LANGUAGE } from "../../api/modelina/index.js";

const indentationSchema = z
  .object({
    type: z.enum(["spaces", "tabs"]).describe("Indentation style for generated code."),
    size: z
      .number()
      .int()
      .positive()
      .describe("Indentation size (e.g. 2, 4)."),
  })
  .describe("Indentation settings.");

const optionsSchema = z
  .object({
    indentation: indentationSchema.optional().describe("Optional indentation settings."),
    processorOptions: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        "Optional Modelina processor options (JSON-serializable). Use sparingly unless you know the target generator’s behavior."
      ),
    generator: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        "Optional language-specific generator configuration (JSON-serializable). Keys depend on the selected language."
      ),
  })
  .strict()
  .describe("Model generation options.");

export const params = z.object({
  source: z
    .string()
    .describe(
      "AsyncAPI document — raw YAML/JSON content or an absolute file path (.yaml, .yml, .json)"
    ),
  language: z
    .enum(MODEL_LANGUAGE)
    .describe(
      "Target language for generated models (e.g. typescript, java, csharp, go, python)."
    ),
  options: optionsSchema
    .optional()
    .describe(
      "Optional Modelina options (JSON-serializable). Focus on indentation + language generator config. Non-serializable functions/classes are not supported."
    ),
}).describe("Parameters for generate_models.");

export type GenerateModelsParams = z.infer<typeof params>;

export default params;
