import ConvertSpecTool from "./convert-spec/index.js";
import GenerateTool from "./generate/index.js";
import LintSpecTool from "./lint-spec/index.js";
import ParseDocumentTool from "./parse-document/index.js";
import ValidateDocumentTool from "./validate-document/index.js";

const tools = [
  ConvertSpecTool,
  GenerateTool,
  LintSpecTool,
  ParseDocumentTool,
  ValidateDocumentTool,
];

export default tools;
