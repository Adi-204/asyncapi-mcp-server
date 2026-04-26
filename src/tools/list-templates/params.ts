import { z } from "zod";

export const params = z.object({
  type: z
    .string()
    .optional()
    .describe("Filter by template type, e.g. 'client', 'docs'"),
  stack: z
    .string()
    .optional()
    .describe("Filter by stack, e.g. 'quarkus', 'express'"),
  protocol: z
    .string()
    .optional()
    .describe("Filter by protocol, e.g. 'websocket', 'kafka'"),
  target: z
    .string()
    .optional()
    .describe(
      "Filter by target language, e.g. 'java', 'javascript', 'python'"
    ),
});

export type QueryParams = z.infer<typeof params>;

export default params;
