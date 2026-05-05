import { describe, it, expect, beforeAll, afterAll } from "vitest";
import type { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { createTestClient } from "../helpers.js";

const DOMAIN_TOOLS = [
  "get_asyncapi_info",
  "list_asyncapi_servers",
  "list_asyncapi_channels",
  "list_asyncapi_operations",
  "list_asyncapi_messages",
  "list_asyncapi_schemas",
  "get_asyncapi_schema",
  "list_asyncapi_security_schemes",
] as const;

describe("AsyncAPI domain tool registry", () => {
  let client: Client;
  let cleanup: () => Promise<void>;

  beforeAll(async () => {
    ({ client, cleanup } = await createTestClient());
  });

  afterAll(async () => {
    await cleanup();
  });

  it("exposes all domain tools and not the removed parse_document", async () => {
    const { tools } = await client.listTools();
    const names = new Set(tools.map((t) => t.name));
    for (const n of DOMAIN_TOOLS) {
      expect(names.has(n)).toBe(true);
    }
    expect(names.has("parse_document")).toBe(false);
  });
});
