import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import type { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { createTestClient } from "../helpers.js";

const FIXTURE_PATH = resolve(import.meta.dirname!, "../fixtures/asyncapi-v3.yaml");

describe("parse_document", () => {
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
    const tool = tools.find((t) => t.name === "parse_document");
    expect(tool).toBeDefined();
    expect(tool!.description).toContain("AsyncAPI document");
  });

  it("parses raw YAML content", async () => {
    const yaml = await readFile(FIXTURE_PATH, "utf-8");
    const result = await client.callTool({
      name: "parse_document",
      arguments: { source: yaml },
    });

    expect(result.isError).toBeFalsy();
    const content = result.content as Array<{ type: string; text: string }>;
    const parsed = JSON.parse(content[0].text);

    expect(parsed.asyncapi).toBe("3.1.0");
    expect(parsed.title).toBe("Test WebSocket Chat API");
    expect(parsed.version).toBe("1.0.0");
    expect(parsed.description).toBe(
      "A test AsyncAPI document shared across MCP tool tests"
    );

    expect(parsed.servers).toHaveLength(1);
    expect(parsed.servers[0]).toMatchObject({
      id: "production",
      host: "ws.example.com",
      protocol: "ws",
    });

    expect(parsed.channels).toHaveLength(1);
    expect(parsed.channels[0].id).toBe("chat");
    expect(parsed.channels[0].address).toBe("/chat");

    expect(parsed.operations).toHaveLength(2);
    expect(parsed.operations[0]).toMatchObject({
      action: "send",
      channel: "chat",
    });
    expect(parsed.operations[1]).toMatchObject({
      action: "receive",
      channel: "chat",
    });

    expect(parsed.messages.length).toBeGreaterThan(0);
  });

  it("parses from an absolute file path", async () => {
    const result = await client.callTool({
      name: "parse_document",
      arguments: { source: FIXTURE_PATH },
    });

    expect(result.isError).toBeFalsy();
    const content = result.content as Array<{ type: string; text: string }>;
    const parsed = JSON.parse(content[0].text);

    expect(parsed.title).toBe("Test WebSocket Chat API");
    expect(parsed.servers).toHaveLength(1);
  });

  it("returns error for invalid YAML", async () => {
    const result = await client.callTool({
      name: "parse_document",
      arguments: { source: "not: valid: asyncapi: doc" },
    });

    expect(result.isError).toBe(true);
    const content = result.content as Array<{ type: string; text: string }>;
    expect(content[0].text.length).toBeGreaterThan(0);
  });

  it("returns error for nonexistent file path", async () => {
    const result = await client.callTool({
      name: "parse_document",
      arguments: { source: "/tmp/does-not-exist-12345.yaml" },
    });

    expect(result.isError).toBe(true);
    const content = result.content as Array<{ type: string; text: string }>;
    expect(content[0].text).toContain("File not found");
  });
});
