import { z } from "zod";

export const params = z
  .object({
    document: z
      .string()
      .describe(
        "AsyncAPI document — either raw YAML/JSON content or an absolute file path ending in .yaml, .yml, or .json"
      ),
    template: z
      .string()
      .describe(
        "Template to use for generation. Provide a baked-in template id (if your environment has one) or a full npm package name (e.g. '@asyncapi/html-template')."
      ),
    targetDir: z
      .string()
      .describe(
        "Absolute path to the directory where generated files will be written. The directory will be created if it does not exist."
      ),
    templateParams: z
      .record(z.string(), z.string())
      .optional()
      .describe(
        "Optional template-specific parameters as key-value pairs. Each template defines its own params — consult the template's npm page or README for available options."
      ),
  })
  .describe("Parameters for generate.");

export type GenerateParams = z.infer<typeof params>;

export default params;
