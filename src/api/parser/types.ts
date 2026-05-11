import type { ChannelInterface, TagsInterface } from "@asyncapi/parser";

// --- Validation ---

export type ValidationIssueSeverity = "error" | "warning" | "info" | "hint";

export interface ValidationIssue {
  message: string;
  code?: string;
  path?: (string | number)[];
  severity: ValidationIssueSeverity;
}

export interface DocumentIdentitySummary {
  asyncapi: string;
  title: string;
  version: string;
}

/**
 * Outcome of validating an AsyncAPI document. When `valid` is true, `summary`
 * contains basic document identity; `issues` may still list non-error severities.
 */
export interface ValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
  summary?: DocumentIdentitySummary;
}

// --- Domain extractors ---

/** Parser mix-in shape (not always reflected on every TypeScript interface). */
export type WithTags = { tags(): TagsInterface };

/** Runtime channels expose `tags()` (CoreModel) though `ChannelInterface` types omit it. */
export type ChannelWithTags = ChannelInterface & WithTags;

/**
 * Optional CoreModel title/summary/description accessors when the runtime model
 * implements them (v3 shapes); fields omitted when not present.
 */
export type MaybeCoreText = {
  hasTitle?: () => boolean;
  title?: () => string | undefined;
  hasSummary?: () => boolean;
  summary?: () => string | undefined;
  hasDescription?: () => boolean;
  description?: () => string | undefined;
};

export type CoreTextFields = {
  title?: string;
  summary?: string;
  description?: string;
};

// --- Bindings (schema-utils) ---

export type BindingCompactEntry = {
  protocol: string;
  summary: string;
};
