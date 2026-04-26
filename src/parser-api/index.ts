import { createRequire } from "node:module";
import { resolveInput, toParsedDocument } from "./utils.js";
import type { ParsedDocument, ValidationIssue, ValidationResult } from "./types.js";

const require = createRequire(import.meta.url);
const { Parser } = require("@asyncapi/parser");

const SEVERITY_MAP: Record<number, ValidationIssue["severity"]> = {
  0: "error",
  1: "warning",
  2: "info",
  3: "hint",
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toValidationIssues(diagnostics: any[]): ValidationIssue[] {
  return diagnostics.map((d) => {
    const severity =
      SEVERITY_MAP[typeof d.severity === "number" ? d.severity : 0] ?? "error";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const path = (d as any).path as (string | number)[] | undefined;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const code = (d as any).code as string | undefined;
    return {
      message: d.message,
      code,
      path,
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

/**
 * Validate an AsyncAPI document (YAML/JSON string or file path) using
 * @asyncapi/parser. `valid` is true when a document model is produced and there
 * are no error-severity diagnostics.
 */
export async function validateDocument(input: string): Promise<ValidationResult> {
  const content = await resolveInput(input);
  const parser = new Parser();
  const { document, diagnostics } = await parser.parse(content);

  const issues = toValidationIssues(diagnostics);
  const hasErrors = issues.some((i) => i.severity === "error");
  const valid = Boolean(document) && !hasErrors;

  if (!valid || !document) {
    return { valid, issues };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const doc = document as any;
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
