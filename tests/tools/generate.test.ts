import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import { readFile } from "node:fs/promises";
import { rm } from "node:fs/promises";
import { resolve, join } from "node:path";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import type { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { createTestClient } from "../helpers.js";

const FIXTURE_PATH = resolve(import.meta.dirname!, "../fixtures/asyncapi-v3.yaml");

describe("generate", () => {
  let client: Client;
  let cleanup: () => Promise<void>;
  const tempDirs: string[] = [];

  async function makeTempDir(): Promise<string> {
    const dir = await mkdtemp(join(tmpdir(), "asyncapi-gen-test-"));
    tempDirs.push(dir);
    return dir;
  }

  beforeAll(async () => {
    ({ client, cleanup } = await createTestClient());
  });

  afterEach(async () => {
    for (const dir of tempDirs) {
      await rm(dir, { recursive: true, force: true }).catch(() => {});
    }
    tempDirs.length = 0;
  });

  afterAll(async () => {
    await cleanup();
  });

  it("is discoverable via listTools", async () => {
    const { tools } = await client.listTools();
    const tool = tools.find((t) => t.name === "generate");
    expect(tool).toBeDefined();
    expect(tool!.description).toContain("generate");
  });

  it("generates files from raw YAML with a baked-in template", async () => {
    const yaml = await readFile(FIXTURE_PATH, "utf-8");
    const targetDir = await makeTempDir();

    const result = await client.callTool({
      name: "generate",
      arguments: {
        source: yaml,
        template: "core-template-client-websocket-javascript",
        targetDir,
        templateParams: { server: "production" },
      },
    });

    expect(result.isError).toBeFalsy();
    const content = result.content as Array<{ type: string; text: string }>;
    const parsed = JSON.parse(content[0].text);

    expect(parsed.targetDir).toBe(targetDir);
    expect(parsed.fileCount).toBeGreaterThan(0);
    expect(parsed.files.length).toBe(parsed.fileCount);

    for (const file of parsed.files) {
      expect(file).toHaveProperty("path");
      expect(file).toHaveProperty("sizeBytes");
      expect(file.sizeBytes).toBeGreaterThan(0);
    }
  }, 120_000);

  it("generates files from a file path", async () => {
    const targetDir = await makeTempDir();

    const result = await client.callTool({
      name: "generate",
      arguments: {
        source: FIXTURE_PATH,
        template: "core-template-client-websocket-javascript",
        targetDir,
        templateParams: { server: "production" },
      },
    });

    expect(result.isError).toBeFalsy();
    const content = result.content as Array<{ type: string; text: string }>;
    const parsed = JSON.parse(content[0].text);

    expect(parsed.fileCount).toBeGreaterThan(0);
  }, 120_000);

  it("returns error for invalid AsyncAPI document", async () => {
    const targetDir = await makeTempDir();

    const result = await client.callTool({
      name: "generate",
      arguments: {
        source: "not: valid: asyncapi",
        template: "core-template-client-websocket-javascript",
        targetDir,
      },
    });

    expect(result.isError).toBe(true);
    const content = result.content as Array<{ type: string; text: string }>;
    expect(content[0].text.length).toBeGreaterThan(0);
  }, 60_000);

  it("returns error when required template params are missing", async () => {
    const yaml = await readFile(FIXTURE_PATH, "utf-8");
    const targetDir = await makeTempDir();

    const result = await client.callTool({
      name: "generate",
      arguments: {
        source: yaml,
        template: "core-template-client-websocket-javascript",
        targetDir,
      },
    });

    expect(result.isError).toBe(true);
    const content = result.content as Array<{ type: string; text: string }>;
    expect(content[0].text).toContain("missing params");
  }, 60_000);

  it("returns error for nonexistent file path", async () => {
    const targetDir = await makeTempDir();

    const result = await client.callTool({
      name: "generate",
      arguments: {
        source: "/tmp/does-not-exist-12345.yaml",
        template: "core-template-client-websocket-javascript",
        targetDir,
      },
    });

    expect(result.isError).toBe(true);
    const content = result.content as Array<{ type: string; text: string }>;
    expect(content[0].text).toContain("File not found");
  }, 60_000);
});
