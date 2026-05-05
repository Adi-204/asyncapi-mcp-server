import { z } from "zod";

/**
 * Shared `source` field for tools that accept an AsyncAPI document as inline
 * YAML/JSON or as an absolute file path.
 */
export const sourceField = z
  .string()
  .describe(
    "AsyncAPI spec as raw YAML/JSON or an absolute file path ending in .yaml, .yml, or .json"
  );

export type SourceField = z.infer<typeof sourceField>;
