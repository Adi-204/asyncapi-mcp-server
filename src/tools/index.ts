import BuildSpecTxtTool from "./build-spec-txt/index.js";
import ConvertSpecTool from "./convert-spec/index.js";
import GenerateTool from "./generate/index.js";
import GenerateModelsTool from "./generate-models/index.js";
import LintSpecTool from "./lint-spec/index.js";
import ParseDocumentTool from "./parse-document/index.js";
import ValidateDocumentTool from "./validate-document/index.js";

const tools = [
  BuildSpecTxtTool,
  ConvertSpecTool,
  GenerateTool,
  GenerateModelsTool,
  LintSpecTool,
  ParseDocumentTool,
  ValidateDocumentTool,
];

export default tools;
