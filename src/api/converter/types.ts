import type { AsyncAPIDocument, ConvertOptions } from "@asyncapi/converter";

/** Serialization of the AsyncAPI document on the wire (input / effective output). */
export type WireFormat = "yaml" | "json";

export type OutputFormat = "preserve" | WireFormat;

export type ConvertSpecRequest = {
  source: string;
  targetVersion: string;
  options?: ConvertOptions;
  outputFormat?: OutputFormat;
};

export type ConvertSpecResult = {
  document: string;
  inputFormat: WireFormat;
};

export type ParsedAsyncApiWireText = {
  format: WireFormat;
  document: AsyncAPIDocument;
};
