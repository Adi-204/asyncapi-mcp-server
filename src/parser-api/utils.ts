import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import type {
  ParsedChannel,
  ParsedDocument,
  ParsedMessage,
  ParsedOperation,
  ParsedServer,
} from "./types.js";

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function toParsedDocument(document: any): ParsedDocument {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const servers: ParsedServer[] = document.allServers().all().map((s: any) => ({
    id: s.id(),
    host: s.host(),
    pathname: s.pathname() ?? undefined,
    protocol: s.protocol(),
    description: s.description() ?? undefined,
  }));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const channels: ParsedChannel[] = document.allChannels().all().map((c: any) => ({
    id: c.id(),
    address: c.address() ?? null,
    description: c.description() ?? undefined,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    messages: c.messages().all().map((m: any) => m.id()),
  }));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const operations: ParsedOperation[] = document.allOperations().all().map((o: any) => ({
    id: o.id() ?? "",
    action: o.action(),
    channel: o.channels().all()[0]?.id() ?? "",
    description: o.description() ?? undefined,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    messages: o.messages().all().map((m: any) => m.id()),
  }));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const messages: ParsedMessage[] = document.allMessages().all().map((m: any) => ({
    id: m.id(),
    description: m.description() ?? undefined,
    contentType: m.contentType() ?? undefined,
    hasPayload: m.hasPayload(),
  }));

  return {
    asyncapi: document.version(),
    title: document.info().title(),
    version: document.info().version(),
    description: document.info().description() ?? undefined,
    defaultContentType: document.defaultContentType() ?? undefined,
    servers,
    channels,
    operations,
    messages,
  };
}
