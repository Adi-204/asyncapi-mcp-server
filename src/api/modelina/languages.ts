/**
 * Pure-data leaf module: lists Modelina target languages without importing
 * any heavy `@asyncapi/modelina` runtime. Imported by `params.ts` so tool
 * registration doesn't transitively load all 12 generator classes at boot.
 */
export const MODEL_LANGUAGE = [
  "java",
  "typescript",
  "csharp",
  "go",
  "javascript",
  "dart",
  "rust",
  "python",
  "kotlin",
  "cpp",
  "php",
  "scala",
] as const;

export type ModelLanguage = (typeof MODEL_LANGUAGE)[number];
