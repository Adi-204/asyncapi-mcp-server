import type { BindingsInterface, SchemaInterface } from "@asyncapi/parser";
import type { BindingCompactEntry } from "./types.js";

function schemaTypeLabel(schema: SchemaInterface): string {
  const union = unionLabel(schema);
  if (union) return union;

  const type = schema.type();

  if (Array.isArray(type)) {
    return type.join(" | ");
  }

  if (type === "array") {
    const items = schema.items();
    const element = Array.isArray(items) ? items[0] : items;
    if (!element) return "unknown[]";
    return `${schemaTypeLabel(element)}[]`;
  }

  if (!type) return "unknown";
  return type;
}

function unionLabel(schema: SchemaInterface): string | undefined {
  const variants = schema.oneOf() ?? schema.anyOf() ?? schema.allOf();
  if (!variants || variants.length === 0) return undefined;
  const parts = variants.map((v) => schemaTypeLabel(v));
  const unique = Array.from(new Set(parts));
  return unique.join(" | ");
}

/** One-line `{ prop: type, ... }` for objects; otherwise a compact type label. */
export function schemaToOneLiner(schema: SchemaInterface): string {
  const props = schema.properties();
  if (!props || Object.keys(props).length === 0) {
    return schemaTypeLabel(schema);
  }

  const rendered = Object.entries(props)
    .map(([name, sub]) => `${name}: ${schemaTypeLabel(sub)}`)
    .join(", ");

  return `{ ${rendered} }`;
}

/** One row per protocol: short human-readable summary of the binding payload. */
export function bindingsToCompact(
  bindings: BindingsInterface
): BindingCompactEntry[] {
  if (bindings.isEmpty()) return [];

  return bindings.all().map((b) => ({
    protocol: b.protocol(),
    summary: bindingValueSummary(b.value()),
  }));
}

function bindingValueSummary(val: unknown): string {
  if (!val || typeof val !== "object") {
    return String(val ?? "");
  }

  const entries = Object.entries(val as Record<string, unknown>);
  if (entries.length === 0) {
    return "(empty)";
  }

  const parts: string[] = [];

  for (const [key, value] of entries) {
    if (value && typeof value === "object" && ("type" in value || "properties" in value || "$ref" in value)) {
      const s = value as Record<string, unknown>;
      const schemaDesc = s.description as string | undefined;
      const schemaTitle = (s.title as string) ?? key;
      const schemaType = (s.type as string) ?? "object";
      const propNames = s.properties
        ? Object.keys(s.properties as Record<string, unknown>)
        : [];

      const propSuffix =
        propNames.length > 0 ? ` {${propNames.join(", ")}}` : "";
      parts.push(`${key}: ${schemaTitle} (${schemaType})${propSuffix}`);
      if (schemaDesc) parts.push(`  → ${schemaDesc}`);
    } else {
      parts.push(`${key}=${compactValue(value)}`);
    }
  }

  return parts.join("\n    ");
}

function compactValue(val: unknown): string {
  if (val == null) return "null";
  if (typeof val === "string") return val;
  if (typeof val === "number" || typeof val === "boolean") return String(val);
  return JSON.stringify(val);
}
