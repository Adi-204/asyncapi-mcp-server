import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { readFile } from "node:fs/promises";
import type { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { createTestClient } from "../helpers.js";
import { ASYNCAPI_V3_FIXTURE_PATH } from "./asyncapi-v3-fixture.js";

describe("get_asyncapi_info", () => {
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
    const tool = tools.find((t) => t.name === "get_asyncapi_info");
    expect(tool).toBeDefined();
    expect(tool!.description?.toLowerCase()).toContain("asyncapi");
  });

  it("returns document metadata", async () => {
    const yaml = await readFile(ASYNCAPI_V3_FIXTURE_PATH, "utf-8");
    const result = await client.callTool({
      name: "get_asyncapi_info",
      arguments: { source: yaml },
    });

    expect(result.isError).toBeFalsy();
    const content = result.content as Array<{ type: string; text: string }>;
    const data = JSON.parse(content[0].text);

    expect(data.asyncapi).toBe("3.1.0");
    expect(data.info.title).toBe("Test WebSocket Chat API");
    expect(data.info.version).toBe("1.0.0");
    expect(data.info.description).toBe(
      "A test AsyncAPI document shared across MCP tool tests"
    );
  });

  it("returns parser error for invalid spec", async () => {
    const result = await client.callTool({
      name: "get_asyncapi_info",
      arguments: { source: "not: valid: asyncapi" },
    });
    expect(result.isError).toBe(true);
  });

  it("returns error for missing file path", async () => {
    const result = await client.callTool({
      name: "get_asyncapi_info",
      arguments: { source: "/tmp/does-not-exist-asyncapi-999.yaml" },
    });
    expect(result.isError).toBe(true);
    expect((result.content as Array<{ text: string }>)[0].text).toContain(
      "File not found"
    );
  });
});
