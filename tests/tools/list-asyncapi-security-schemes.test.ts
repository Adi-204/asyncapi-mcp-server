import { describe, it, expect, beforeAll, afterAll } from "vitest";
import type { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { createTestClient } from "../helpers.js";
import { ASYNCAPI_V3_FIXTURE_PATH } from "./asyncapi-v3-fixture.js";

describe("list_asyncapi_security_schemes", () => {
  let client: Client;
  let cleanup: () => Promise<void>;

  beforeAll(async () => {
    ({ client, cleanup } = await createTestClient());
  });

  afterAll(async () => {
    await cleanup();
  });

  it("is discoverable via listTools", async () => {
    const { tools } = await client.listTools();
    const tool = tools.find((t) => t.name === "list_asyncapi_security_schemes");
    expect(tool).toBeDefined();
    expect(tool!.description?.toLowerCase()).toContain("security");
  });

  it("returns an array", async () => {
    const result = await client.callTool({
      name: "list_asyncapi_security_schemes",
      arguments: { source: ASYNCAPI_V3_FIXTURE_PATH },
    });
    expect(result.isError).toBeFalsy();
    const rows = JSON.parse((result.content as Array<{ text: string }>)[0].text);
    expect(Array.isArray(rows)).toBe(true);
  });
});
