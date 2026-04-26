import { describe, it, expect, beforeAll, afterAll } from "vitest";
import type { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { createTestClient } from "../helpers.js";

describe("list_baked_templates", () => {
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
    const tool = tools.find((t) => t.name === "list_baked_templates");
    expect(tool).toBeDefined();
    expect(tool!.description).toContain("baked-in templates");
  });

  it("returns all templates when called with no filter", async () => {
    const result = await client.callTool({
      name: "list_baked_templates",
      arguments: {},
    });

    expect(result.isError).toBeFalsy();
    const content = result.content as Array<{ type: string; text: string }>;
    expect(content).toHaveLength(1);
    expect(content[0].type).toBe("text");

    const templates = JSON.parse(content[0].text);
    expect(Array.isArray(templates)).toBe(true);
    expect(templates.length).toBeGreaterThan(0);

    for (const t of templates) {
      expect(t).toHaveProperty("name");
      expect(t).toHaveProperty("type");
    }
  });

  it("filters by protocol", async () => {
    const result = await client.callTool({
      name: "list_baked_templates",
      arguments: { protocol: "websocket" },
    });

    const content = result.content as Array<{ type: string; text: string }>;
    const templates = JSON.parse(content[0].text);

    for (const t of templates) {
      expect(t.protocol.toLowerCase()).toBe("websocket");
    }
  });

  it("returns empty array for non-matching filter", async () => {
    const result = await client.callTool({
      name: "list_baked_templates",
      arguments: { protocol: "nonexistent-protocol-xyz" },
    });

    const content = result.content as Array<{ type: string; text: string }>;
    const templates = JSON.parse(content[0].text);
    expect(templates).toEqual([]);
  });
});
