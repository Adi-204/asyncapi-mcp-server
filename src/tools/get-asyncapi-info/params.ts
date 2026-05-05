import { z } from "zod";
import { sourceField } from "../_source.js";

export const params = z
  .object({
    source: sourceField,
  })
  .describe("Parameters for get_asyncapi_info.");

export type QueryParams = z.infer<typeof params>;

export default params;
