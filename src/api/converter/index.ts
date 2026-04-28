import { convert } from "@asyncapi/converter";
import type {
  AsyncAPIConvertVersion,
  AsyncAPIDocument,
  ConvertOptions,
} from "@asyncapi/converter";
import { dump, load } from "js-yaml";
import { resolveInput } from "../helpers.js";

export type OutputFormat = "preserve" | "yaml" | "json";

export type ConvertSpecRequest = {
  source: string;
  targetVersion: string;
  options?: ConvertOptions;
  outputFormat?: OutputFormat;
};

export type ConvertSpecResult = {
  document: string;
  inputFormat: "yaml" | "json";
};

function normalizeAsyncApiVersion(value: unknown): string {
  return String(value);
}

/**
 * Mirrors {@link https://github.com/asyncapi/converter-js/blob/master/src/utils.ts @asyncapi/converter}'s
 * `serializeInput` behavior for string documents so format detection matches `convert()`.
 */
export function parseAsyncApiWireText(raw: string): {
  format: "yaml" | "json";
  document: AsyncAPIDocument;
} {
  let triedConvertToYaml = false;
  try {
    const maybeJSON: unknown = JSON.parse(raw);
    if (typeof maybeJSON === "object" && maybeJSON !== null) {
      return {
        format: "json",
        document: maybeJSON as AsyncAPIDocument,
      };
    }
    triedConvertToYaml = true;
    return {
      format: "yaml",
      document: load(raw) as AsyncAPIDocument,
    };
  } catch (e) {
    try {
      if (triedConvertToYaml) {
        throw e;
      }
      return {
        format: "yaml",
        document: load(raw) as AsyncAPIDocument,
      };
    } catch {
      throw new Error("AsyncAPI document must be a valid JSON or YAML document.");
    }
  }
}

function effectiveOutputFormat(
  outputFormat: OutputFormat | undefined,
  inputFormat: "yaml" | "json"
): "yaml" | "json" {
  if (!outputFormat || outputFormat === "preserve") {
    return inputFormat;
  }
  return outputFormat;
}

/** `convert()` returns a YAML string for YAML input or a plain object for JSON input. */
function normalizeConvertOutput(
  result: string | AsyncAPIDocument,
  eff: "yaml" | "json"
): string {
  const obj =
    typeof result === "string"
      ? (load(result) as AsyncAPIDocument)
      : result;
  return eff === "yaml"
    ? dump(obj, { skipInvalid: true })
    : JSON.stringify(obj, null, 2);
}

function serializeDocument(
  document: AsyncAPIDocument,
  eff: "yaml" | "json"
): string {
  return eff === "yaml"
    ? dump(document, { skipInvalid: true })
    : JSON.stringify(document, null, 2);
}

/**
 * Converts an AsyncAPI document to a newer `targetVersion`, or between YAML/JSON at the same
 * version when `outputFormat` requests a different serialization than the input.
 */
export async function convertAsyncApiSpec(
  request: ConvertSpecRequest
): Promise<ConvertSpecResult> {
  const raw = await resolveInput(request.source);
  const { format: inputFormat, document: parsed } = parseAsyncApiWireText(raw);

  const current = normalizeAsyncApiVersion(parsed.asyncapi);
  const target = normalizeAsyncApiVersion(request.targetVersion);

  const eff = effectiveOutputFormat(request.outputFormat, inputFormat);

  if (current === target) {
    if (eff === inputFormat) {
      return { document: raw, inputFormat };
    }
    return {
      document: serializeDocument(parsed, eff),
      inputFormat,
    };
  }

  const out = convert(
    raw,
    request.targetVersion as AsyncAPIConvertVersion,
    request.options ?? {}
  );

  return {
    document: normalizeConvertOutput(out, eff),
    inputFormat,
  };
}
