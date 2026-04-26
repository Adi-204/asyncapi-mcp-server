export interface ParsedServer {
  id: string;
  host: string;
  pathname?: string;
  protocol: string;
  description?: string;
}

export interface ParsedChannel {
  id: string;
  address: string | null;
  description?: string;
  messages: string[];
}

export interface ParsedOperation {
  id: string;
  action: string;
  channel: string;
  description?: string;
  messages: string[];
}

export interface ParsedMessage {
  id: string;
  description?: string;
  contentType?: string;
  hasPayload: boolean;
}

export interface ParsedDocument {
  asyncapi: string;
  title: string;
  version: string;
  description?: string;
  defaultContentType?: string;
  servers: ParsedServer[];
  channels: ParsedChannel[];
  operations: ParsedOperation[];
  messages: ParsedMessage[];
}

export type ValidationIssueSeverity = "error" | "warning" | "info" | "hint";

export interface ValidationIssue {
  message: string;
  code?: string;
  path?: (string | number)[];
  severity: ValidationIssueSeverity;
}

/**
 * Outcome of validating an AsyncAPI document. When `valid` is true, `summary`
 * contains basic document identity; `issues` may still list non-error severities.
 */
export interface ValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
  summary?: {
    asyncapi: string;
    title: string;
    version: string;
  };
}
