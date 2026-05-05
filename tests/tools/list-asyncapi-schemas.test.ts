import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { readFile } from "node:fs/promises";
import type { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { createTestClient } from "../helpers.js";
import { ASYNCAPI_V3_FIXTURE_PATH } from "./asyncapi-v3-fixture.js";

describe("list_asyncapi_schemas", () => {
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
    const tool = tools.find((t) => t.name === "list_asyncapi_schemas");
    expect(tool).toBeDefined();
    expect(tool!.description?.toLowerCase()).toContain("schema");
  });

  it("includes component schema ids", async () => {
    const yaml = await readFile(ASYNCAPI_V3_FIXTURE_PATH, "utf-8");
    const result = await client.callTool({
      name: "list_asyncapi_schemas",
      arguments: { source: yaml },
    });
    expect(result.isError).toBeFalsy();
    const rows = JSON.parse((result.content as Array<{ text: string }>)[0].text);
    const ids = rows.map((r: { id: string }) => r.id);
    expect(ids).toContain("SimpleRecord");
  });
});
