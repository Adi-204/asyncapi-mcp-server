import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import params, { type QueryParams } from "./params.js";
import { buildToolDescription } from "../_meta.js";

export const name = "build_spec_txt";

export const title = "Build spec.txt (LLM-optimized AsyncAPI summary)";

export const description = buildToolDescription({
  name,
  title,
  summary:
    "Build an LLM-optimized markdown summary (spec.txt) of an AsyncAPI document. Two modes: normal (default) produces a compact TOC with JSON Pointer links per item following the llms.txt convention; full mode inlines everything — payload schemas, property lists, binding configs, extension values, and example payloads — following the llms-full.txt convention. Sections: Spec Info, Servers, Channels, Operations (Sends/Receives), Messages, Schemas, Security Schemes, Bindings, Extensions, and Optional (message examples). Empty sections are omitted.",
  inputs: [
    "`source`: raw YAML/JSON text OR an absolute path to a `.yaml`, `.yml`, or `.json` file",
    "`full` (optional, default false): false = compact TOC with JSON Pointer links; true = everything inline.",
  ],
  returns: [
    "Markdown text. Normal mode: ~90% smaller than raw YAML. Full mode: ~75% smaller while preserving payload shapes, bindings, extensions, and examples.",
  ],
  notes: [
    "Uses `isSend()`/`isReceive()` from the parser, so AsyncAPI 2.x `publish`/`subscribe` operations are normalized to the 3.x `Sends`/`Receives` headings automatically.",
    "Normal mode uses JSON Pointer paths (`#/channels/orderCreated`) as link targets — the native AsyncAPI $ref format.",
    "When `source` is a file path, relative `$ref` (e.g. `./commons/servers.yml`) resolves from that file's directory; inline YAML/JSON has no base path, so split specs should be loaded via an absolute path to the root AsyncAPI file.",
    "If the input is invalid, this tool returns an error message (and no output).",
  ],
  examples: [
    {
      description: "Compact TOC (default)",
      args: {
        source: "C:\\\\specs\\\\asyncapi.yaml",
      },
    },
    {
      description: "Full inline mode",
      args: {
        source: "C:\\\\specs\\\\asyncapi.yaml",
        full: true,
      },
    },
  ],
});

export const execute = async ({ source, full }: QueryParams) => {
  try {
    const { buildSpecTxt } = await import("../../api/spec-txt/index.js");
    const text = await buildSpecTxt(source, { full });
    return {
      content: [
        {
          type: "text" as const,
          text,
        },
      ],
    };
  } catch (err) {
    return {
      isError: true,
      content: [
        {
          type: "text" as const,
          text: err instanceof Error ? err.message : String(err),
        },
      ],
    };
  }
};

export const register = (server: McpServer) => {
  server.registerTool(
    name,
    {
      title,
      description,
      inputSchema: params.shape,
    },
    execute
  );
};

export default { name, title, description, inputSchema: params.shape, execute, register };
