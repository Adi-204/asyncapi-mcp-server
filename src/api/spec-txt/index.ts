import type { AsyncAPIDocumentInterface, Diagnostic } from "@asyncapi/parser";
import { Parser as ParserClass } from "@asyncapi/parser";
import { parseOptionsForInput, resolveInput } from "../helpers.js";
import {
  renderBindings,
  renderChannels,
  renderExtensions,
  renderMessages,
  renderOperations,
  renderSchemas,
  renderSecuritySchemes,
  renderServers,
  renderSpecInfo,
  renderTitleAndSummary,
} from "./renderers.js";

export interface BuildSpecTxtOptions {
  full?: boolean;
}

/**
 * Builds an LLM-optimized markdown summary (`spec.txt`) of an AsyncAPI
 * document. The output follows llms.txt / llms-full.txt conventions.
 *
 * Two modes:
 * - `full: false` (default) — compact TOC with JSON Pointer links per item.
 * - `full: true` — everything inline: payload schemas, property lists, binding
 *   configs, extension values, example payloads.
 *
 * Empty sections are omitted entirely in both modes.
 */
export async function buildSpecTxt(
  input: string,
  options: BuildSpecTxtOptions = {}
): Promise<string> {
  const content = await resolveInput(input);
  const parser = new ParserClass();
  const { document, diagnostics } = await parser.parse(
    content,
    parseOptionsForInput(input)
  );

  if (!document) {
    const errors = diagnostics
      .filter((d: Diagnostic) => d.severity === 0)
      .map((d: Diagnostic) => d.message);
    throw new Error(`Invalid AsyncAPI document:\n${errors.join("\n")}`);
  }

  return renderDocument(document, options.full ?? false);
}

function renderDocument(
  doc: AsyncAPIDocumentInterface,
  full: boolean
): string {
  const blocks: string[] = [];

  blocks.push(renderTitleAndSummary(doc));
  blocks.push(renderSpecInfo(doc));
  blocks.push(renderServers(doc, full));
  blocks.push(renderChannels(doc, full));
  blocks.push(renderOperations(doc, full));
  blocks.push(renderMessages(doc, full));
  blocks.push(renderSchemas(doc, full));
  blocks.push(renderSecuritySchemes(doc, full));
  blocks.push(renderBindings(doc, full));
  blocks.push(renderExtensions(doc, full));
  
  return blocks.filter((b) => b.length > 0).join("\n\n");
}
