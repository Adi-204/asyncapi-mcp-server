import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { readFile } from "node:fs/promises";
import type { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { createTestClient } from "../helpers.js";
import { ASYNCAPI_V3_FIXTURE_PATH } from "./asyncapi-v3-fixture.js";

describe("get_asyncapi_schema", () => {
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
    const tool = tools.find((t) => t.name === "get_asyncapi_schema");
    expect(tool).toBeDefined();
    expect(tool!.description?.toLowerCase()).toContain("schema");
  });

  it("returns JSON for a known id", async () => {
    const yaml = await readFile(ASYNCAPI_V3_FIXTURE_PATH, "utf-8");
    const result = await client.callTool({
      name: "get_asyncapi_schema",
      arguments: { source: yaml, id: "SimpleRecord", maxDepth: 6 },
    });
    expect(result.isError).toBeFalsy();
    const tree = JSON.parse((result.content as Array<{ text: string }>)[0].text);
    expect(tree.type).toBe("object");
    expect(tree.properties).toBeDefined();
    expect(tree.properties.key).toBeDefined();
  });

  it("errors for unknown id", async () => {
    const yaml = await readFile(ASYNCAPI_V3_FIXTURE_PATH, "utf-8");
    const result = await client.callTool({
      name: "get_asyncapi_schema",
      arguments: { source: yaml, id: "DoesNotExist_12345" },
    });
    expect(result.isError).toBe(true);
    const text = (result.content as Array<{ text: string }>)[0].text;
    expect(text).toContain("Unknown schema id");
    expect(text).toContain("list_asyncapi_schemas");
  });
});
