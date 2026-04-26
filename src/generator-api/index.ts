import { createRequire } from "node:module";
import type { TemplateFilter, TemplateInfo } from "./types.js";

const require = createRequire(import.meta.url);
const generator = require("@asyncapi/generator");

export const listBakedInTemplates = (
  filter?: TemplateFilter
): TemplateInfo[] => generator.listBakedInTemplates(filter);

export type { TemplateFilter, TemplateInfo } from "./types.js";
