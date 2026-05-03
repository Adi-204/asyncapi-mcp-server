import type {
  BindingsInterface,
  ExtensionsInterface,
  SchemaInterface,
} from "@asyncapi/parser";

const MAX_PROPS_IN_ONE_LINER = 10;
const MAX_JSON_VALUE_LEN = 100;

/**
 * Extracts a compact type label for a single schema node.
 * Handles primitives, arrays (`type[]`), unions (`a | b`), nested objects
 * (collapsed to just `object`). Undefined type falls back to `unknown`.
 */
export function schemaTypeLabel(schema: SchemaInterface): string {
  const union = unionLabel(schema);
  if (union) return union;

  const type = schema.type();

  if (Array.isArray(type)) {
    return type.join(" | ");
  }

  if (type === "array") {
    const items = schema.items();
    if (items && !Array.isArray(items)) {
      return `${schemaTypeLabel(items)}[]`;
    }
    if (Array.isArray(items) && items.length > 0) {
      return `${schemaTypeLabel(items[0])}[]`;
    }
    return "unknown[]";
  }

  if (!type) return "unknown";
  return type;
}

function unionLabel(schema: SchemaInterface): string | undefined {
  const variants =
    schema.oneOf() ?? schema.anyOf() ?? schema.allOf() ?? undefined;
  if (!variants || variants.length === 0) return undefined;
  const parts = variants.map((v) => schemaTypeLabel(v));
  const unique = Array.from(new Set(parts));
  return unique.join(" | ");
}

/**
 * Renders a schema's top-level properties as a single-line TypeScript-ish
 * shape: `{ userId: integer, email: string, tags: string[] }`. Truncates at
 * `maxProps` properties with a `... +N more` suffix. Non-object schemas
 * render as their type label.
 */
export function schemaToOneLiner(
  schema: SchemaInterface,
  maxProps: number = MAX_PROPS_IN_ONE_LINER
): string {
  const props = schema.properties();
  if (!props || Object.keys(props).length === 0) {
    return schemaTypeLabel(schema);
  }

  const entries = Object.entries(props);
  const shown = entries.slice(0, maxProps);
  const rest = entries.length - shown.length;

  const rendered = shown
    .map(([name, sub]) => `${name}: ${schemaTypeLabel(sub)}`)
    .join(", ");

  const suffix = rest > 0 ? `, ... +${rest} more` : "";
  return `{ ${rendered}${suffix} }`;
}

/**
 * Renders a schema's top-level properties as indented markdown bullet lines
 * suitable for the Schemas section. One indent level only — nested objects
 * render as `propName (object)` without recursive expansion.
 *
 * Returns an empty array if the schema has no properties (non-object schemas
 * are described by the caller via the section heading's type label).
 */
export function schemaToPropertyList(schema: SchemaInterface): string[] {
  const props = schema.properties();
  if (!props) return [];

  const required = new Set(schema.required() ?? []);

  return Object.entries(props).map(([name, sub]) => {
    const type = schemaTypeLabel(sub);
    const requiredness = required.has(name) ? "required" : "optional";
    const description = sub.description()?.trim();
    const descSuffix = description ? ` — ${description}` : "";
    return `  - \`${name}\` (${type}, ${requiredness})${descSuffix}`;
  });
}

/**
 * Flattens a Bindings collection into readable descriptions per protocol.
 * For schema-typed values (objects with `type` and `properties`), renders
 * them as meaningful descriptions rather than raw JSON.
 */
export function bindingsToCompact(
  bindings: BindingsInterface
): Array<{ protocol: string; summary: string; description: string }> {
  if (bindings.isEmpty()) return [];

  return bindings.all().map((b) => {
    const val = b.value();
    const { summary, description } = summarizeBindingValue(val);
    return { protocol: b.protocol(), summary, description };
  });
}

function summarizeBindingValue(val: unknown): {
  summary: string;
  description: string;
} {
  if (!val || typeof val !== "object") {
    return { summary: String(val ?? ""), description: "binding" };
  }

  const entries = Object.entries(val as Record<string, unknown>);
  if (entries.length === 0) {
    return { summary: "(empty)", description: "binding" };
  }

  const parts: string[] = [];
  let topDescription = "";

  for (const [key, value] of entries) {
    if (isSchemaLike(value)) {
      const s = value as Record<string, unknown>;
      const schemaDesc = (s.description as string) ?? "";
      const schemaTitle = (s.title as string) ?? key;
      const schemaType = (s.type as string) ?? "object";
      const propNames = s.properties
        ? Object.keys(s.properties as Record<string, unknown>)
        : [];

      if (!topDescription && schemaDesc) topDescription = schemaDesc;

      const propSuffix =
        propNames.length > 0 ? ` {${propNames.join(", ")}}` : "";
      parts.push(`${key}: ${schemaTitle} (${schemaType})${propSuffix}`);
      if (schemaDesc) parts.push(`  → ${schemaDesc}`);
    } else {
      parts.push(`${key}=${compactValue(value)}`);
    }
  }

  return {
    summary: parts.join("\n    "),
    description: topDescription || "protocol-specific binding",
  };
}

function isSchemaLike(val: unknown): boolean {
  if (!val || typeof val !== "object") return false;
  const obj = val as Record<string, unknown>;
  return "type" in obj || "properties" in obj || "$ref" in obj;
}

/**
 * Renders extension entries from an Extensions collection as markdown lines.
 * Each line: `- {scopeLabel} / {x-key}: {compactValue}`
 */
export function extensionsToLines(
  extensions: ExtensionsInterface,
  scopeLabel: string
): string[] {
  if (extensions.isEmpty()) return [];

  return extensions
    .all()
    .filter((ext) => !ext.id().startsWith("x-parser-"))
    .map((ext) => {
      const val = compactValue(ext.value());
      return `- **${scopeLabel} / \`${ext.id()}\`**: ${val}`;
    });
}

function compactValue(val: unknown): string {
  if (val === null || val === undefined) return "null";
  if (typeof val === "string") return val;
  if (typeof val === "number" || typeof val === "boolean") return String(val);
  const json = JSON.stringify(val);
  if (json.length > MAX_JSON_VALUE_LEN) {
    return json.slice(0, MAX_JSON_VALUE_LEN) + "...";
  }
  return json;
}
