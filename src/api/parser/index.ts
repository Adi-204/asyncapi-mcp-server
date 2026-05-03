import type {
  AsyncAPIDocumentInterface,
  Diagnostic,
} from "@asyncapi/parser";
import { Parser as ParserClass } from "@asyncapi/parser";
import { parseOptionsForInput, resolveInput } from "../helpers.js";
import { toParsedDocument } from "./utils.js";
import type {
  ParsedDocument,
  ValidationIssue,
  ValidationResult,
} from "./types.js";

const SEVERITY_MAP: Record<number, ValidationIssue["severity"]> = {
  0: "error",
  1: "warning",
  2: "info",
  3: "hint",
};

function toValidationIssues(diagnostics: Diagnostic[]): ValidationIssue[] {
  return diagnostics.map((d) => {
    const severity =
      SEVERITY_MAP[typeof d.severity === "number" ? d.severity : 0] ?? "error";
    return {
      message: d.message,
      code: typeof d.code === "string" ? d.code : undefined,
      path: Array.isArray(d.path) ? d.path : undefined,
      severity,
    };
  });
}

export type {
  ParsedChannel,
  ParsedDocument,
  ParsedMessage,
  ParsedOperation,
  ParsedServer,
  ValidationIssue,
  ValidationResult,
} from "./types.js";

/**
 * Parse an AsyncAPI document (YAML/JSON string or file path) and return a
 * structured summary. Uses @asyncapi/parser.
 */
export async function parseDocument(input: string): Promise<ParsedDocument> {
  const content = await resolveInput(input);
  const parser = new ParserClass();
  const { document, diagnostics } = await parser.parse(
    content,
    parseOptionsForInput(input)
  );

  const errors = diagnostics.filter(
    (d: { severity: number }) => d.severity === 0
  );
  if (!document) {
    const msgs = errors.map((d: Diagnostic) => d.message);
    throw new Error(`Invalid AsyncAPI document:\n${msgs.join("\n")}`);
  }

  return toParsedDocument(document);
}

/**
 * Validate an AsyncAPI document (YAML/JSON string or file path) using
 * @asyncapi/parser. `valid` is true when a document model is produced and there
 * are no error-severity diagnostics.
 */
export async function validateDocument(
  input: string
): Promise<ValidationResult> {
  const content = await resolveInput(input);
  const parser = new ParserClass();
  const { document, diagnostics } = await parser.parse(
    content,
    parseOptionsForInput(input)
  );

  const issues = toValidationIssues(diagnostics);
  const hasErrors = issues.some((i) => i.severity === "error");
  const valid = Boolean(document) && !hasErrors;

  if (!valid || !document) {
    return { valid, issues };
  }

  const doc: AsyncAPIDocumentInterface = document;
  return {
    valid: true,
    issues,
    summary: {
      asyncapi: doc.version(),
      title: doc.info().title(),
      version: doc.info().version(),
    },
  };
}
