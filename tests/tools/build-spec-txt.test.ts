import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import type { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { createTestClient } from "../helpers.js";

const FIXTURES_DIR = resolve(import.meta.dirname!, "../fixtures");
const ASYNCAPI_V3_FIXTURE = resolve(FIXTURES_DIR, "asyncapi-v3.yaml");
const ASYNCAPI_V2_MIN_FIXTURE = resolve(FIXTURES_DIR, "asyncapi-v2-min.yaml");

async function callBuildSpecTxt(
  client: Client,
  args: Record<string, unknown>
): Promise<{ isError: boolean; text: string }> {
  const result = await client.callTool({
    name: "build_spec_txt",
    arguments: args,
  });
  const content = result.content as Array<{ type: string; text: string }>;
  return {
    isError: Boolean(result.isError),
    text: content[0]?.text ?? "",
  };
}

describe("build_spec_txt", () => {
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
    const tool = tools.find((t) => t.name === "build_spec_txt");
    expect(tool).toBeDefined();
    expect(tool!.description?.toLowerCase()).toContain("spec.txt");
  });

  describe("normal mode (default)", () => {
    it("renders the fixture spec with JSON Pointer links", async () => {
      const yaml = await readFile(ASYNCAPI_V3_FIXTURE, "utf-8");
      const { isError, text } = await callBuildSpecTxt(client, {
        source: yaml,
      });

      expect(isError).toBe(false);
      expect(text).toContain("# Test WebSocket Chat API (v1.0.0)");
      expect(text).toContain("> AsyncAPI 3.1.0");
      expect(text).toContain("## Spec Info");
      expect(text).toContain("## Servers");
      expect(text).toContain("## Channels");
      expect(text).toContain("## Operations");
      expect(text).toContain("## Messages");
      expect(text).toContain("## Schemas");

      expect(text).toContain("[production](#/servers/production)");
      expect(text).toContain("[chat](#/channels/chat)");
      expect(text).toContain("[sendMessage](#/operations/sendMessage)");
      expect(text).toContain("[receiveMessage](#/operations/receiveMessage)");
      expect(text).toContain(
        "[chatMessage](#/channels/chat/messages/chatMessage)"
      );
      expect(text).toContain(
        "[chatMessage.payload](#/channels/chat/messages/chatMessage/payload)"
      );
    });

    it("omits sections absent in the minimal AsyncAPI v2 fixture", async () => {
      const yaml = await readFile(ASYNCAPI_V2_MIN_FIXTURE, "utf-8");
      const { isError, text } = await callBuildSpecTxt(client, {
        source: yaml,
      });

      expect(isError).toBe(false);
      expect(text).toContain("# Minimal V2 fixture (v1.0.0)");
      expect(text).toContain("## Spec Info");
      expect(text).toContain("## Channels");
      expect(text).toContain("## Operations");
      expect(text).toContain("## Messages");
      expect(text).toContain("## Schemas");
      expect(text).not.toContain("## Servers");
      expect(text).not.toContain("## Security Schemes");
      expect(text).not.toContain("## Bindings");
      expect(text).not.toContain("## Extensions");
    });

    it("normalizes AsyncAPI 2.x channel operations (no Publishes/Subscribes headings)", async () => {
      const yaml = await readFile(ASYNCAPI_V2_MIN_FIXTURE, "utf-8");
      const { isError, text } = await callBuildSpecTxt(client, {
        source: yaml,
      });

      expect(isError).toBe(false);
      expect(text).toContain("### Sends");
      expect(text).not.toContain("### Publishes");
      expect(text).not.toContain("### Subscribes");
    });
  });

  describe("full mode (full: true)", () => {
    it("renders everything inline for the fixture spec", async () => {
      const yaml = await readFile(ASYNCAPI_V3_FIXTURE, "utf-8");
      const { isError, text } = await callBuildSpecTxt(client, {
        source: yaml,
        full: true,
      });

      expect(isError).toBe(false);
      expect(text).toContain("# Test WebSocket Chat API (v1.0.0)");
      expect(text).toContain("**production** (ws):");
      expect(text).toContain("**chat** [`/chat`]");
      expect(text).toContain("Messages: chatMessage");
      expect(text).toContain("**sendMessage** →");
      expect(text).toContain("**receiveMessage** ←");
      expect(text).toContain("**chatMessage.payload** (object)");
      expect(text).toContain("`text` (string, optional)");
      expect(text).toContain("`sender` (string, optional)");

      expect(text).not.toContain("[production](#/servers/production)");
      expect(text).not.toContain("[chat](#/channels/chat)");
    });
  });

  it("reads from an absolute file path", async () => {
    const { isError, text } = await callBuildSpecTxt(client, {
      source: ASYNCAPI_V3_FIXTURE,
    });

    expect(isError).toBe(false);
    expect(text).toContain("# Test WebSocket Chat API");
  });

  it("returns an error for invalid YAML", async () => {
    const { isError, text } = await callBuildSpecTxt(client, {
      source: "not: valid: asyncapi: doc",
    });

    expect(isError).toBe(true);
    expect(text.length).toBeGreaterThan(0);
  });

  it("returns an error for a nonexistent file path", async () => {
    const { isError, text } = await callBuildSpecTxt(client, {
      source: "/tmp/does-not-exist-spec-txt-12345.yaml",
    });

    expect(isError).toBe(true);
    expect(text).toContain("File not found");
  });
});
