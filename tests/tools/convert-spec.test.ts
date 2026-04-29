import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import type { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { createTestClient } from "../helpers.js";
import {
  convertAsyncApiSpec,
  parseAsyncApiWireText,
} from "../../src/api/converter/index.js";

const FIXTURE_V3_PATH = resolve(import.meta.dirname!, "../fixtures/asyncapi-v3.yaml");
const FIXTURE_V2_PATH = resolve(
  import.meta.dirname!,
  "../fixtures/asyncapi-v2-min.yaml"
);

describe("convert_spec API", () => {
  it("parseAsyncApiWireText detects YAML vs JSON", () => {
    const yaml = "asyncapi: '3.0.0'\ninfo:\n  title: A\n  version: '1'\n";
    expect(parseAsyncApiWireText(yaml).format).toBe("yaml");
    const json = JSON.stringify({
      asyncapi: "3.0.0",
      info: { title: "A", version: "1" },
    });
    expect(parseAsyncApiWireText(json).format).toBe("json");
  });

  it("same-version YAML → JSON when outputFormat is json", async () => {
    const yaml = await readFile(FIXTURE_V3_PATH, "utf-8");
    const result = await convertAsyncApiSpec({
      source: yaml,
      targetVersion: "3.1.0",
      outputFormat: "json",
    });
    expect(result.inputFormat).toBe("yaml");
    const parsed = JSON.parse(result.document) as { asyncapi: string };
    expect(parsed.asyncapi).toBe("3.1.0");
  });

  it("same version + preserve returns original string when source is a file path", async () => {
    const yaml = await readFile(FIXTURE_V3_PATH, "utf-8");
    const result = await convertAsyncApiSpec({
      source: FIXTURE_V3_PATH,
      targetVersion: "3.1.0",
      outputFormat: "preserve",
    });
    expect(result.document).toBe(yaml);
  });

  it("upgrades v2 YAML to v3 string", async () => {
    const yaml = await readFile(FIXTURE_V2_PATH, "utf-8");
    const result = await convertAsyncApiSpec({
      source: yaml,
      targetVersion: "3.0.0",
      outputFormat: "preserve",
    });
    expect(result.inputFormat).toBe("yaml");
    expect(result.document).toContain("asyncapi: 3.");
    expect(result.document).toContain("operations:");
  });

  it("upgrades v2 JSON input to structured JSON output", async () => {
    const yaml = await readFile(FIXTURE_V2_PATH, "utf-8");
    const { document: parsed } = parseAsyncApiWireText(yaml);
    const jsonSource = JSON.stringify(parsed, null, 2);
    const result = await convertAsyncApiSpec({
      source: jsonSource,
      targetVersion: "3.0.0",
      outputFormat: "json",
    });
    expect(result.inputFormat).toBe("json");
    const out = JSON.parse(result.document) as { asyncapi: string };
    expect(out.asyncapi.startsWith("3.")).toBe(true);
  });

  it("v2→v3 with forced YAML output from JSON input", async () => {
    const yaml = await readFile(FIXTURE_V2_PATH, "utf-8");
    const { document: parsed } = parseAsyncApiWireText(yaml);
    const jsonSource = JSON.stringify(parsed, null, 2);
    const result = await convertAsyncApiSpec({
      source: jsonSource,
      targetVersion: "3.0.0",
      outputFormat: "yaml",
    });
    expect(result.document.trimStart().startsWith("asyncapi:")).toBe(true);
    expect(result.document).toContain("operations:");
  });
});

describe("convert_spec MCP tool", () => {
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
    const tool = tools.find((t) => t.name === "convert_spec");
    expect(tool).toBeDefined();
    expect(tool!.description).toContain("AsyncAPI");
  });

  it("returns converted v3 document via tool call", async () => {
    const yaml = await readFile(FIXTURE_V2_PATH, "utf-8");
    const result = await client.callTool({
      name: "convert_spec",
      arguments: {
        source: yaml,
        targetVersion: "3.0.0",
        outputFormat: "preserve",
      },
    });

    expect(result.isError).toBeFalsy();
    const content = result.content as Array<{ type: string; text: string }>;
    const payload = JSON.parse(content[0].text) as {
      document: string;
      inputFormat: string;
    };
    expect(payload.inputFormat).toBe("yaml");
    expect(payload.document).toContain("asyncapi: 3.");
  });

  it("returns error on downgrade", async () => {
    const yaml = await readFile(FIXTURE_V3_PATH, "utf-8");
    const result = await client.callTool({
      name: "convert_spec",
      arguments: {
        source: yaml,
        targetVersion: "2.6.0",
        outputFormat: "preserve",
      },
    });

    expect(result.isError).toBe(true);
    const content = result.content as Array<{ type: string; text: string }>;
    expect(content[0].text).toMatch(/downgrade|Cannot downgrade/i);
  });
});
