import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import type { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { createTestClient } from "../helpers.js";

const FIXTURE_PATH = resolve(import.meta.dirname!, "../fixtures/asyncapi-v3.yaml");

type LintBody = {
  diagnostics: {
    rule: string;
    severity: string;
    message: string;
    path: (string | number)[];
    line: number;
  }[];
};

describe("lint_spec", () => {
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
    const tool = tools.find((t) => t.name === "lint_spec");
    expect(tool).toBeDefined();
    expect(tool!.description).toContain("Spectral");
  });

  it("returns diagnostics for a valid spec using the default asyncapi ruleset", async () => {
    const yaml = await readFile(FIXTURE_PATH, "utf-8");
    const result = await client.callTool({
      name: "lint_spec",
      arguments: { source: yaml },
    });

    expect(result.isError).toBeFalsy();
    const content = result.content as Array<{ type: string; text: string }>;
    const body = JSON.parse(content[0].text) as LintBody;

    expect(Array.isArray(body.diagnostics)).toBe(true);
    expect(body.diagnostics.length).toBeGreaterThan(0);
    for (const d of body.diagnostics) {
      expect(d.rule).toBeTruthy();
      expect(["error", "warning", "info", "hint"]).toContain(d.severity);
      expect(d.message).toBeTruthy();
      expect(typeof d.line).toBe("number");
      expect(Array.isArray(d.path)).toBe(true);
    }
  });

  it("resolves source from an absolute file path", async () => {
    const result = await client.callTool({
      name: "lint_spec",
      arguments: { source: FIXTURE_PATH },
    });

    expect(result.isError).toBeFalsy();
    const content = result.content as Array<{ type: string; text: string }>;
    const body = JSON.parse(content[0].text) as LintBody;
    expect(body.diagnostics.length).toBeGreaterThan(0);
  });

  it("accepts an optional custom ruleset file path (extends built-in asyncapi ruleset)", async () => {
    const rulesetDir = join(tmpdir(), `asyncapi-mcp-ruleset-${Date.now()}`);
    await mkdir(rulesetDir, { recursive: true });
    const rulesetPath = join(rulesetDir, ".spectral.yaml");
    await writeFile(
      rulesetPath,
      "extends:\n  - spectral:asyncapi\n",
      "utf-8"
    );

    try {
      const yaml = await readFile(FIXTURE_PATH, "utf-8");
      const result = await client.callTool({
        name: "lint_spec",
        arguments: { source: yaml, ruleset: rulesetPath },
      });

      expect(result.isError).toBeFalsy();
      const content = result.content as Array<{ type: string; text: string }>;
      const body = JSON.parse(content[0].text) as LintBody;
      expect(body.diagnostics.length).toBeGreaterThan(0);
    } finally {
      await rm(rulesetDir, { recursive: true, force: true }).catch(
        () => undefined
      );
    }
  });

  it("returns isError when source file is missing", async () => {
    const result = await client.callTool({
      name: "lint_spec",
      arguments: { source: "/tmp/does-not-exist-99999.yaml" },
    });
    expect(result.isError).toBe(true);
  });

  it("returns isError when ruleset file is missing", async () => {
    const yaml = await readFile(FIXTURE_PATH, "utf-8");
    const result = await client.callTool({
      name: "lint_spec",
      arguments: {
        source: yaml,
        ruleset: "/tmp/missing-ruleset-99999.spectral.yaml",
      },
    });
    expect(result.isError).toBe(true);
  });
});
