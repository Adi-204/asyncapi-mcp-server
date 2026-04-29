import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import type { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { generateModelsFromSource } from "../../src/api/modelina/index.js";
import { createTestClient } from "../helpers.js";

const FIXTURE_PATH = resolve(import.meta.dirname!, "../fixtures/sample.yaml");

describe("generateModelsFromSource API", () => {
  it("generates TypeScript payload models from sample YAML inline", async () => {
    const yaml = await readFile(FIXTURE_PATH, "utf-8");
    const result = await generateModelsFromSource(yaml, "typescript");

    expect(result.language).toBe("typescript");
    expect(result.modelCount).toBeGreaterThan(0);
    expect(
      Object.keys(result.files).some((k) => k.endsWith(".ts"))
    ).toBe(true);
    expect(Object.values(result.files).every(Boolean)).toBe(true);
    const combined = Object.values(result.files).join("\n");
    expect(combined).toContain("sender");
    expect(combined).toContain("reservedText");
  });

  it("generates Java models when source is an absolute path", async () => {
    const result = await generateModelsFromSource(FIXTURE_PATH, "java");

    expect(result.language).toBe("java");
    expect(result.modelCount).toBeGreaterThan(0);
    expect(Object.keys(result.files).some((k) => k.endsWith(".java"))).toBe(
      true
    );
  });

  it("throws a clear message when AsyncAPI is invalid", async () => {
    await expect(
      generateModelsFromSource("hello: world", "typescript")
    ).rejects.toThrow(/invalid asyncapi/i);
  });
});

describe("generate_models MCP tool", () => {
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
    const tool = tools.find((t) => t.name === "generate_models");
    expect(tool).toBeDefined();
    expect(tool!.description?.toLowerCase()).toContain("modelina");
  });

  it("returns files and modelCount", async () => {
    const yaml = await readFile(FIXTURE_PATH, "utf-8");
    const result = await client.callTool({
      name: "generate_models",
      arguments: { source: yaml, language: "typescript" },
    });

    expect(result.isError).toBeFalsy();
    const content = result.content as Array<{ type: string; text: string }>;
    const parsed = JSON.parse(content[0].text) as {
      files: Record<string, string>;
      language: string;
      modelCount: number;
    };

    expect(parsed.language).toBe("typescript");
    expect(parsed.modelCount).toBeGreaterThan(0);
    expect(Object.keys(parsed.files).length).toBe(parsed.modelCount);
  });
});
