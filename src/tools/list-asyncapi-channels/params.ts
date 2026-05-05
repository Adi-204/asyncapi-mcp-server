import { z } from "zod";
import { sourceField } from "../_source.js";

export const params = z
  .object({
    source: sourceField,
  })
  .describe("Parameters for list_asyncapi_channels.");

export type QueryParams = z.infer<typeof params>;

export default params;
