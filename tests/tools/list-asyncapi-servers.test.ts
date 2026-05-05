import { describe, it, expect, beforeAll, afterAll } from "vitest";
import type { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { createTestClient } from "../helpers.js";
import { ASYNCAPI_V3_FIXTURE_PATH } from "./asyncapi-v3-fixture.js";

describe("list_asyncapi_servers", () => {
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
    const tool = tools.find((t) => t.name === "list_asyncapi_servers");
    expect(tool).toBeDefined();
    expect(tool!.description?.toLowerCase()).toContain("server");
  });

  it("parses from file path", async () => {
    const result = await client.callTool({
      name: "list_asyncapi_servers",
      arguments: { source: ASYNCAPI_V3_FIXTURE_PATH },
    });
    expect(result.isError).toBeFalsy();
    const content = result.content as Array<{ type: string; text: string }>;
    const servers = JSON.parse(content[0].text);
    expect(servers).toHaveLength(1);
    expect(servers[0]).toMatchObject({
      id: "production",
      host: "ws.example.com",
      protocol: "ws",
    });
  });
});
