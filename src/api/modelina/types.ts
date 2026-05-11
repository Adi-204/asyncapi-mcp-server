import type { ProcessorOptions } from "@asyncapi/modelina";
import type { ModelLanguage } from "./languages.js";

export type { ModelLanguage } from "./languages.js";
export { EXTENSION_BY_LANG, MODEL_LANGUAGE } from "./languages.js";

/** Generator option keys stripped before forwarding user JSON into Modelina */
export type UnsafeKeys = "presets" | "defaultPreset" | "dependencyManager";

/** Safe, JSON-compatible options forwarded into Modelina generators */
export interface ModelinaGenerationOptionsInput {
  indentation?: {
    type: "spaces" | "tabs";
    size: number;
  };
  processorOptions?: ProcessorOptions;
  /** Language-specific options (DeepPartial). `presets` / `dependencyManager` are stripped. */
  generator?: Record<string, unknown>;
}

export interface GenerateModelsResult {
  /** Logical filename → generated source text */
  files: Record<string, string>;
  language: ModelLanguage;
  modelCount: number;
}
