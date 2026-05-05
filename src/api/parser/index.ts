import type {
  AsyncAPIDocumentInterface,
  Diagnostic,
  SchemaInterface,
} from "@asyncapi/parser";
import { Parser as ParserClass } from "@asyncapi/parser";
import { parseOptionsForInput, resolveInput } from "../helpers.js";
import type { ValidationIssue, ValidationResult } from "./types.js";

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
  BindingCompactEntry,
  ChannelWithTags,
  CoreTextFields,
  DocumentIdentitySummary,
  ListMessagesOptions,
  MaybeCoreText,
  SerializeSchemaOptions,
  ValidationIssue,
  ValidationIssueSeverity,
  ValidationResult,
  WithTags,
} from "./types.js";

export {
  bindingsToCompact,
  schemaToOneLiner,
  schemaTypeLabel,
} from "./schema-utils.js";

export {
  extractAsyncApiInfo,
  extractChannels,
  extractMessages,
  extractOperations,
  extractSchemaSummaries,
  extractSecuritySchemes,
  extractServers,
} from "./extractors.js";

export { serializeSchema } from "./serialize-schema.js";

async function runParse(input: string) {
  const content = await resolveInput(input);
  const parser = new ParserClass();
  return parser.parse(content, parseOptionsForInput(input));
}

/**
 * Parse and return the AsyncAPI document model, or throw with parser error
 * messages if the document is invalid.
 */
export async function parseToDocument(
  input: string
): Promise<AsyncAPIDocumentInterface> {
  const { document, diagnostics } = await runParse(input);

  const errors = diagnostics.filter(
    (d: { severity: number }) => d.severity === 0
  );
  if (!document) {
    const msgs = errors.map((d: Diagnostic) => d.message);
    throw new Error(`Invalid AsyncAPI document:\n${msgs.join("\n")}`);
  }

  return document;
}

/**
 * Resolve a component schema by id (e.g. the key under `components.schemas`).
 */
export function getSchemaById(
  doc: AsyncAPIDocumentInterface,
  id: string
): SchemaInterface | undefined {
  return doc.allSchemas().get(id);
}

/**
 * Validate an AsyncAPI document (YAML/JSON string or file path) using
 * @asyncapi/parser. `valid` is true when a document model is produced and there
 * are no error-severity diagnostics.
 */
export async function validateDocument(
  input: string
): Promise<ValidationResult> {
  const { document, diagnostics } = await runParse(input);

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
