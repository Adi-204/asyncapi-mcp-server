import { z } from "zod";

export const params = z
  .object({
    source: z
      .string()
      .describe(
        "AsyncAPI spec as raw YAML/JSON or an absolute file path ending in .yaml, .yml, or .json"
      ),
    full: z
      .boolean()
      .optional()
      .default(false)
      .describe(
        "false (default): compact TOC with JSON Pointer links. true: everything inline with payload schemas, property lists, binding configs, extension values, and example payloads."
      ),
  })
  .describe("Parameters for build_spec_txt.");

export type QueryParams = z.infer<typeof params>;

export default params;
