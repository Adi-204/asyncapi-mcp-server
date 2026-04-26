import { z } from "zod";

export const params = z.object({
  document: z
    .string()
    .describe(
      "AsyncAPI document — either raw YAML/JSON content or an absolute file path ending in .yaml, .yml, or .json"
    ),
  template: z
    .string()
    .describe(
      "Template to use for generation. Use a baked-in template name from list_baked_templates (e.g. 'ts-websocket-client') or a full npm package name (e.g. '@asyncapi/html-template')"
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
      "Optional template-specific parameters as key-value pairs. Each template defines its own params — use list_baked_templates or get_template_info to discover available params."
    ),
});

export type GenerateParams = z.infer<typeof params>;

export default params;
