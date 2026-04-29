import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import type { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { createTestClient } from "../helpers.js";

const FIXTURE_PATH = resolve(import.meta.dirname!, "../fixtures/asyncapi-v3.yaml");

describe("validate_document", () => {
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
    const tool = tools.find((t) => t.name === "validate_document");
    expect(tool).toBeDefined();
    expect(tool!.description?.toLowerCase()).toContain("validate");
  });

  it("returns valid: true for good YAML content", async () => {
    const yaml = await readFile(FIXTURE_PATH, "utf-8");
    const result = await client.callTool({
      name: "validate_document",
      arguments: { source: yaml },
    });

    expect(result.isError).toBeFalsy();
    const content = result.content as Array<{ type: string; text: string }>;
    const body = JSON.parse(content[0].text) as {
      valid: boolean;
      issues: unknown[];
      summary?: { asyncapi: string; title: string; version: string };
    };

    expect(body.valid).toBe(true);
    expect(body.summary).toBeDefined();
    expect(body.summary!.asyncapi).toBe("3.1.0");
    expect(body.summary!.title).toBe("Test WebSocket Chat API");
    expect(body.summary!.version).toBe("1.0.0");
  });

  it("validates from an absolute file path", async () => {
    const result = await client.callTool({
      name: "validate_document",
      arguments: { source: FIXTURE_PATH },
    });

    expect(result.isError).toBeFalsy();
    const content = result.content as Array<{ type: string; text: string }>;
    const body = JSON.parse(content[0].text) as { valid: boolean; summary?: { title: string } };

    expect(body.valid).toBe(true);
    expect(body.summary?.title).toBe("Test WebSocket Chat API");
  });

  it("returns valid: false for invalid content", async () => {
    const result = await client.callTool({
      name: "validate_document",
      arguments: { source: "not: valid: asyncapi: doc" },
    });

    expect(result.isError).toBeFalsy();
    const content = result.content as Array<{ type: string; text: string }>;
    const body = JSON.parse(content[0].text) as { valid: boolean; issues: { severity: string }[] };

    expect(body.valid).toBe(false);
    expect(Array.isArray(body.issues)).toBe(true);
    expect(body.issues.length).toBeGreaterThan(0);
  });

  it("returns isError for nonexistent file path", async () => {
    const result = await client.callTool({
      name: "validate_document",
      arguments: { source: "/tmp/does-not-exist-12345.yaml" },
    });

    expect(result.isError).toBe(true);
    const content = result.content as Array<{ type: string; text: string }>;
    expect(content[0].text).toContain("File not found");
  });
});
