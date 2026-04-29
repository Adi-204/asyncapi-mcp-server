import { z } from "zod";

const v2tov3Options = z
  .object({
    pointOfView: z
      .enum(["application", "client"])
      .optional()
      .describe(
        "How to interpret publish/subscribe directionality during 2.x → 3.x conversion."
      ),
    useChannelIdExtension: z
      .boolean()
      .optional()
      .describe(
        "If true, uses the channelId extension behavior during conversion (converter-specific)."
      ),
    convertServerComponents: z
      .boolean()
      .optional()
      .describe("If true, attempts to convert server components during 2.x → 3.x."),
    convertChannelComponents: z
      .boolean()
      .optional()
      .describe(
        "If true, attempts to convert channel components during 2.x → 3.x."
      ),
  })
  .describe("Options for converting AsyncAPI 2.x → 3.x.")
  .optional()
  .describe("Options for converting AsyncAPI 2.x → 3.x.");

export const params = z.object({
  source: z
    .string()
    .describe(
      "AsyncAPI spec as raw YAML/JSON or an absolute file path (.yaml, .yml, .json)"
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
          perspective: z
            .enum(["client", "server"])
            .optional()
            .describe(
              "Perspective used when converting from OpenAPI to AsyncAPI (converter-specific)."
            ),
        })
        .describe("Options for converting from OpenAPI to AsyncAPI.")
        .optional()
        .describe("Options for converting from OpenAPI to AsyncAPI."),
    })
    .describe("Converter-specific options.")
    .optional()
    .describe("Passthrough options for @asyncapi/converter (mainly v2tov3 for 2.x → 3.x)."),
}).describe("Parameters for convert_spec.");

export type QueryParams = z.infer<typeof params>;

export default params;
