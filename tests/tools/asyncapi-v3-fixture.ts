import { resolve } from "node:path";

/** Absolute path to the shared AsyncAPI 3.1 fixture used by domain tool tests. */
export const ASYNCAPI_V3_FIXTURE_PATH = resolve(
  import.meta.dirname!,
  "../fixtures/asyncapi-v3.yaml"
);
