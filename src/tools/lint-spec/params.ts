import { z } from "zod";

export const params = z
  .object({
    source: z
      .string()
      .describe(
        "AsyncAPI spec as raw YAML/JSON or an absolute file path ending in .yaml, .yml, or .json"
      ),
    ruleset: z
      .string()
      .optional()
      .describe(
        "Optional path to a Spectral ruleset file (e.g. .spectral.yaml) that may extend built-in rulesets such as spectral:asyncapi"
      ),
  })
  .describe("Parameters for lint_spec.");

export type QueryParams = z.infer<typeof params>;

export default params;
