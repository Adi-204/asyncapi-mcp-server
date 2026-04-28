import GenerateTool from "./generate/index.js";
import LintSpecTool from "./lint-spec/index.js";
import ParseDocumentTool from "./parse-document/index.js";
import ValidateDocumentTool from "./validate-document/index.js";

const tools = [
  GenerateTool,
  LintSpecTool,
  ParseDocumentTool,
  ValidateDocumentTool,
];

export default tools;
