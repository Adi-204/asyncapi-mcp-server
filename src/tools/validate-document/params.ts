import { z } from "zod";

export const params = z
  .object({
    source: z
      .string()
      .describe(
        "AsyncAPI spec as raw YAML/JSON or an absolute file path ending in .yaml, .yml, or .json"
      ),
  })
  .describe("Parameters for validate_document.");

export type QueryParams = z.infer<typeof params>;

export default params;
