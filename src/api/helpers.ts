import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

/**
 * True when the input string likely refers to a local file path rather than inline document content.
 */
export function looksLikeFilePath(input: string): boolean {
  const trimmed = input.trim();
  if (trimmed.startsWith("{") || trimmed.startsWith("asyncapi:")) return false;
  return (
    /\.(ya?ml|json)$/i.test(trimmed) ||
    /^[a-zA-Z]:[/\\]/.test(trimmed) ||
    trimmed.startsWith("/")
  );
}

/**
 * Returns raw document string. If input looks like a file path, reads it
 * asynchronously (try/catch — no existsSync).
 */
export async function resolveInput(input: string): Promise<string> {
  const trimmed = input.trim();
  if (!looksLikeFilePath(trimmed)) return trimmed;

  const absolute = resolve(trimmed);
  try {
    return await readFile(absolute, "utf-8");
  } catch (err: unknown) {
    if (err instanceof Error && "code" in err && err.code === "ENOENT") {
      throw new Error(`File not found: ${absolute}`);
    }
    throw err;
  }
}
