import { z } from "zod";
import { sourceField } from "../_source.js";

export const params = z
  .object({
    source: sourceField,
    includeHeadersSummary: z
      .boolean()
      .optional()
      .default(false)
      .describe(
        "When true, include a one-line summary of the headers schema per message."
      ),
    payloadDetail: z
      .enum(["summary", "full"])
      .optional()
      .default("summary")
      .describe(
        "`summary` (default): payload as a compact type one-liner. `full`: nested JSON-schema-like object (see maxDepth)."
      ),
    payloadMaxDepth: z
      .number()
      .int()
      .min(1)
      .max(32)
      .optional()
      .default(8)
      .describe(
        "When payloadDetail is `full`, max nesting depth for schema serialization."
      ),
  })
  .describe("Parameters for list_asyncapi_messages.");

export type QueryParams = z.infer<typeof params>;

export default params;
