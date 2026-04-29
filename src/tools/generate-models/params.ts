import { z } from "zod";
import { MODEL_LANGUAGE } from "../../api/modelina/index.js";

const optionsSchema = z
  .object({
    indentation: z
      .object({
        type: z.enum(["spaces", "tabs"]),
        size: z.number().int().positive(),
      })
      .optional(),
    processorOptions: z.record(z.string(), z.unknown()).optional(),
    generator: z.record(z.string(), z.unknown()).optional(),
  })
  .strict();

export const params = z.object({
  source: z
    .string()
    .describe(
      "AsyncAPI document — raw YAML/JSON content or an absolute file path (.yaml, .yml, .json)"
    ),
  language: z.enum(MODEL_LANGUAGE),
  options: optionsSchema.optional().describe(
    "Serializable Modelina options: indentation (spaces/tabs + size), processorOptions (nested asyncapi parser hints), generator (language-specific fields). presets/dependencyManager are ignored."
  ),
});

export type GenerateModelsParams = z.infer<typeof params>;

export default params;
