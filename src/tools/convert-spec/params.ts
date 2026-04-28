import { z } from "zod";

const v2tov3Options = z
  .object({
    pointOfView: z.enum(["application", "client"]).optional(),
    useChannelIdExtension: z.boolean().optional(),
    convertServerComponents: z.boolean().optional(),
    convertChannelComponents: z.boolean().optional(),
  })
  .optional();

export const params = z.object({
  source: z
    .string()
    .describe(
      "AsyncAPI document — raw YAML/JSON content or an absolute file path (.yaml, .yml, .json)"
    ),
  targetVersion: z
    .string()
    .describe(
      'Target AsyncAPI version (e.g. "3.0.0", "2.6.0"). Only upgrades are supported; downgrades fail.'
    ),
  outputFormat: z
    .enum(["preserve", "yaml", "json"])
    .optional()
    .describe(
      "preserve = match input serialization; yaml | json = force output encoding after conversion"
    ),
  options: z
    .object({
      v2tov3: v2tov3Options,
      openAPIToAsyncAPI: z
        .object({
          perspective: z.enum(["client", "server"]).optional(),
        })
        .optional(),
    })
    .optional()
    .describe("Passthrough options for @asyncapi/converter (mainly v2tov3 for 2.x → 3.x)."),
});

export type QueryParams = z.infer<typeof params>;

export default params;
