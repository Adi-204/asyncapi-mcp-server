import type { Diagnostic } from "@asyncapi/parser";
import { Parser as ParserClass } from "@asyncapi/parser";
import {
  CplusplusGenerator,
  CSharpGenerator,
  DartGenerator,
  GoGenerator,
  IndentationTypes,
  JavaGenerator,
  JavaScriptGenerator,
  KotlinGenerator,
  PhpGenerator,
  PythonGenerator,
  RustGenerator,
  ScalaGenerator,
  TypeScriptGenerator,
} from "@asyncapi/modelina";
import type { OutputModel, ProcessorOptions } from "@asyncapi/modelina";
import { parseOptionsForInput, resolveInput } from "../helpers.js";
import type { ModelLanguage } from "./languages.js";

/** Re-exported from the leaf `./languages.js` module so callers that only need the
 * language list can import without paying the full Modelina runtime cost. */
export { MODEL_LANGUAGE } from "./languages.js";
export type { ModelLanguage } from "./languages.js";

const EXTENSION_BY_LANG: Record<ModelLanguage, string> = {
  java: "java",
  typescript: "ts",
  csharp: "cs",
  go: "go",
  javascript: "js",
  dart: "dart",
  rust: "rs",
  python: "py",
  kotlin: "kt",
  cpp: "hpp",
  php: "php",
  scala: "scala",
};

type UnsafeKeys = "presets" | "defaultPreset" | "dependencyManager";

function omitUnsafe<O extends Record<string, unknown>>(obj: O): Omit<O, UnsafeKeys> {
  const copy = { ...obj };
  delete copy.presets;
  delete copy.defaultPreset;
  delete copy.dependencyManager;
  return copy;
}

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

function buildGeneratorConstructorOptions(
  language: ModelLanguage,
  input?: ModelinaGenerationOptionsInput
): Record<string, unknown> {
  const fromGen = input?.generator ? omitUnsafe(input.generator) : {};
  const merged: Record<string, unknown> = { ...fromGen };

  if (input?.indentation) {
    merged.indentation = {
      type:
        input.indentation.type === "tabs"
          ? IndentationTypes.TABS
          : IndentationTypes.SPACES,
      size: input.indentation.size,
    };
  }
  if (input?.processorOptions !== undefined) {
    merged.processorOptions = input.processorOptions;
  }

  return merged;
}

function createGenerator(
  language: ModelLanguage,
  input?: ModelinaGenerationOptionsInput
) {
  const opts = buildGeneratorConstructorOptions(language, input);
  switch (language) {
    case "java":
      return new JavaGenerator(opts);
    case "typescript":
      return new TypeScriptGenerator(opts);
    case "csharp":
      return new CSharpGenerator(opts);
    case "go":
      return new GoGenerator(opts);
    case "javascript":
      return new JavaScriptGenerator(opts);
    case "dart":
      return new DartGenerator(opts);
    case "rust":
      return new RustGenerator(opts);
    case "python":
      return new PythonGenerator(opts);
    case "kotlin":
      return new KotlinGenerator(opts);
    case "cpp":
      return new CplusplusGenerator(opts);
    case "php":
      return new PhpGenerator(opts);
    case "scala":
      return new ScalaGenerator(opts);
    default: {
      const _exhaust: never = language;
      throw new Error(`Unsupported language: ${_exhaust}`);
    }
  }
}

export interface GenerateModelsResult {
  /** Logical filename → generated source text */
  files: Record<string, string>;
  language: ModelLanguage;
  modelCount: number;
}

function safeFileStem(modelName: string): string {
  const cleaned = modelName.replace(/[^a-zA-Z0-9_.-]/g, "_").replace(/_+/g, "_");
  return cleaned.length > 0 ? cleaned.slice(0, 200) : "Model";
}

/**
 * Accumulate output models into a filename → contents map with collision suffixes.
 */
function outputModelsToFiles(
  models: OutputModel[],
  language: ModelLanguage
): Record<string, string> {
  const files: Record<string, string> = {};
  const ext = EXTENSION_BY_LANG[language];
  const occurrences = new Map<string, number>();

  for (const m of models) {
    const stem = safeFileStem(m.modelName);
    const index = occurrences.get(stem) ?? 0;
    occurrences.set(stem, index + 1);

    const filename =
      index === 0 ? `${stem}.${ext}` : `${stem}-${index}.${ext}`;
    files[filename] = m.result;
  }

  return files;
}

/**
 * Resolve `source`, parse with @asyncapi/parser (fail on invalid doc), generate models with Modelina.
 */
export async function generateModelsFromSource(
  source: string,
  language: ModelLanguage,
  options?: ModelinaGenerationOptionsInput
): Promise<GenerateModelsResult> {
  const content = await resolveInput(source);
  const parser = new ParserClass();
  const { document, diagnostics } = await parser.parse(
    content,
    parseOptionsForInput(source)
  );

  const errors = diagnostics.filter(
    (d: { severity: number }) => d.severity === 0
  );
  if (!document) {
    const msgs = errors.map((d: Diagnostic) => d.message);
    throw new Error(`Invalid AsyncAPI document:\n${msgs.join("\n")}`);
  }

  const generator = createGenerator(language, options);
  const models = await generator.generate(document);
  const files = outputModelsToFiles(models as OutputModel[], language);

  return {
    files,
    language,
    modelCount: models.length,
  };
}
