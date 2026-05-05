import { z } from "zod";
import { sourceField } from "../_source.js";

export const params = z
  .object({
    source: sourceField,
    id: z
      .string()
      .describe(
        "Schema id: the key under `components.schemas` in your AsyncAPI file (e.g. `User` or `hello`). Use `list_asyncapi_schemas` or a `#/components/schemas/...` reference to find valid ids."
      ),
    maxDepth: z
      .number()
      .int()
      .min(1)
      .max(32)
      .optional()
      .default(8)
      .describe("Maximum nesting depth when serializing the schema."),
  })
  .describe("Parameters for get_asyncapi_schema.");

export type QueryParams = z.infer<typeof params>;

export default params;
