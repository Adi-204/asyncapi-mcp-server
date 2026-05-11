import ConvertSpecTool from "./convert-spec/index.js";
import GenerateTool from "./generate/index.js";
import GenerateModelsTool from "./generate-models/index.js";
import GetAsyncApiInfoTool from "./get-asyncapi-info/index.js";
import LintSpecTool from "./lint-spec/index.js";
import ListAsyncApiChannelsTool from "./list-asyncapi-channels/index.js";
import ListAsyncApiMessagesTool from "./list-asyncapi-messages/index.js";
import ListAsyncApiOperationsTool from "./list-asyncapi-operations/index.js";
import ListAsyncApiServersTool from "./list-asyncapi-servers/index.js";
import ValidateDocumentTool from "./validate-document/index.js";

const tools = [
  ConvertSpecTool,
  GenerateTool,
  GenerateModelsTool,
  GetAsyncApiInfoTool,
  LintSpecTool,
  ListAsyncApiChannelsTool,
  ListAsyncApiMessagesTool,
  ListAsyncApiOperationsTool,
  ListAsyncApiServersTool,
  ValidateDocumentTool,
];

export default tools;
