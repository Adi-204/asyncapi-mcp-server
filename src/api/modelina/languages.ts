/**
 * Single source of truth for Modelina target languages:
 * each key is a supported language; each value is the file extension for emitted models.
 *
 * Imported by `params.ts` without pulling `@asyncapi/modelina` runtime at tool registration.
 */
export const EXTENSION_BY_LANG = {
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
} as const;

export type ModelLanguage = keyof typeof EXTENSION_BY_LANG;

const _langs = Object.keys(EXTENSION_BY_LANG) as ModelLanguage[];

/** Tuple for `z.enum(...)` (requires at least one element). */
export const MODEL_LANGUAGE = [
  _langs[0],
  ..._langs.slice(1),
] as [ModelLanguage, ...ModelLanguage[]];
