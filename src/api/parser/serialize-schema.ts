import type { SchemaInterface } from "@asyncapi/parser";
import type { SerializeSchemaOptions } from "./types.js";

/**
 * Depth-limit arbitrary JSON from `schema.json()`. Visits each object only
 * once along a path so shared references do not loop forever.
 */
function limitJsonDepth(
  value: unknown,
  maxDepth: number,
  depth: number,
  visiting: Set<object>
): unknown {
  if (depth >= maxDepth) {
    if (value !== null && typeof value === "object") {
      return { $truncated: true };
    }
    return value;
  }
  if (value === null || typeof value !== "object") {
    return value;
  }
  if (visiting.has(value)) {
    return { $recursive: true };
  }
  visiting.add(value);
  try {
    if (Array.isArray(value)) {
      return value.map((item) =>
        limitJsonDepth(item, maxDepth, depth + 1, visiting)
      );
    }
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, child]) => [
        key,
        limitJsonDepth(child, maxDepth, depth + 1, visiting),
      ])
    );
  } finally {
    visiting.delete(value);
  }
}

/**
 * Return the schema as plain JSON (via the parser model's `json()`), capped by
 * `maxDepth` so huge or highly nested specs cannot blow the MCP response.
 */
export function serializeSchema(
  schema: SchemaInterface,
  options: SerializeSchemaOptions = { maxDepth: 8 }
): unknown {
  if (schema.isCircular()) {
    return { $circular: true };
  }
  return limitJsonDepth(schema.json() as unknown, options.maxDepth, 0, new Set());
}
