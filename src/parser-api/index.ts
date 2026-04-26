import { createRequire } from "node:module";
import { resolveInput, toParsedDocument } from "./utils.js";
import type { ParsedDocument } from "./types.js";

const require = createRequire(import.meta.url);
const { Parser } = require("@asyncapi/parser");

export type {
  ParsedChannel,
  ParsedDocument,
  ParsedMessage,
  ParsedOperation,
  ParsedServer,
} from "./types.js";

/**
 * Parse an AsyncAPI document (YAML/JSON string or file path) and return a
 * structured summary. Uses @asyncapi/parser.
 */
export async function parseDocument(input: string): Promise<ParsedDocument> {
  const content = await resolveInput(input);
  const parser = new Parser();
  const { document, diagnostics } = await parser.parse(content);

  const errors = diagnostics.filter(
    (d: { severity: number }) => d.severity === 0
  );
  if (!document) {
    const msgs = errors.map((d: { message: string }) => d.message);
    throw new Error(`Invalid AsyncAPI document:\n${msgs.join("\n")}`);
  }

  return toParsedDocument(document);
}
