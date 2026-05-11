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
  })
  .describe("Parameters for list_asyncapi_messages.");

export type QueryParams = z.infer<typeof params>;

export default params;
