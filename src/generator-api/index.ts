import { createRequire } from "node:module";
import { readdir, stat } from "node:fs/promises";
import { join, relative } from "node:path";
import { resolveInput } from "../parser-api/utils.js";
import type {
  GenerateOptions,
  GenerateResult,
  GeneratedFile,
  TemplateFilter,
  TemplateInfo,
} from "./types.js";

const require = createRequire(import.meta.url);
const generatorPkg = require("@asyncapi/generator");
const GeneratorClass = generatorPkg.default ?? generatorPkg;

export const listBakedInTemplates = (
  filter?: TemplateFilter
): TemplateInfo[] => generatorPkg.listBakedInTemplates(filter);

async function walkDir(dir: string, root: string): Promise<GeneratedFile[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const results: GeneratedFile[] = [];

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...(await walkDir(fullPath, root)));
    } else {
      const fileStat = await stat(fullPath);
      results.push({
        path: relative(root, fullPath).replace(/\\/g, "/"),
        sizeBytes: fileStat.size,
      });
    }
  }

  return results;
}

/**
 * Generate code/docs from an AsyncAPI document using a template.
 * Wraps the @asyncapi/generator `Generator` class — always uses filesystem
 * output, walks the resulting directory, and returns the file listing.
 */
export async function generateCode(
  options: GenerateOptions
): Promise<GenerateResult> {
  const { document, template, targetDir, templateParams } = options;

  const content = await resolveInput(document);

  const generator = new GeneratorClass(template, targetDir, {
    forceWrite: true,
    templateParams,
  });

  await generator.generate(content);

  const files = await walkDir(targetDir, targetDir);
  files.sort((a, b) => a.path.localeCompare(b.path));

  return {
    targetDir,
    files,
    fileCount: files.length,
  };
}

export type {
  GenerateOptions,
  GenerateResult,
  GeneratedFile,
  TemplateFilter,
  TemplateInfo,
} from "./types.js";
