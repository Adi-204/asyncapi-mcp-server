import { z } from "zod";

export const params = z.object({
  document: z
    .string()
    .describe(
      "AsyncAPI document — either raw YAML/JSON content or an absolute file path ending in .yaml, .yml, or .json"
    ),
});

export type QueryParams = z.infer<typeof params>;

export default params;
