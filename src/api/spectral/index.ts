import { promises as fsPromises } from "node:fs";
import { resolve } from "node:path";
import { DiagnosticSeverity } from "@stoplight/types";
import { asyncapi as asyncapiRuleset } from "@stoplight/spectral-rulesets";
import type { ISpectralDiagnostic } from "@stoplight/spectral-core";
import { Spectral as SpectralCtor } from "@stoplight/spectral-core";
import { bundleAndLoadRuleset } from "@stoplight/spectral-ruleset-bundler/with-loader";
import { fetch as spectralFetch } from "@stoplight/spectral-runtime";
import { resolveInput } from "../helpers.js";
import type { LintDiagnostic, LintResult } from "./types.js";

const spectralIo = {
  fs: { promises: fsPromises },
  fetch: spectralFetch as (
    input: RequestInfo,
    init?: RequestInit
  ) => Promise<Response>,
};

function severityString(
  sev: DiagnosticSeverity
): LintDiagnostic["severity"] {
  switch (sev) {
    case DiagnosticSeverity.Error:
      return "error";
    case DiagnosticSeverity.Warning:
      return "warning";
    case DiagnosticSeverity.Information:
      return "info";
    case DiagnosticSeverity.Hint:
      return "hint";
    default:
      return "error";
  }
}

function toLintDiagnostic(d: ISpectralDiagnostic): LintDiagnostic {
  return {
    rule: String(d.code ?? "unknown"),
    severity: severityString(d.severity),
    message: d.message,
    path: Array.isArray(d.path) ? d.path : [],
    line: d.range.start.line + 1,
  };
}

async function loadRulesetFromFile(rulesetPath: string) {
  const absolute = resolve(rulesetPath.trim());
  try {
    return await bundleAndLoadRuleset(absolute, spectralIo);
  } catch (err: unknown) {
    if (err instanceof Error && "code" in err && err.code === "ENOENT") {
      throw new Error(`Ruleset file not found: ${absolute}`);
    }
    throw err;
  }
}

/**
 * Lint an AsyncAPI document with Spectral's built-in `spectral:asyncapi` ruleset,
 * or an optional ruleset loaded from a file (absolute or relative path).
 */
export async function lintSpec(
  source: string,
  options?: { ruleset?: string }
): Promise<LintResult> {
  const content = await resolveInput(source);
  const spectral = new SpectralCtor();

  if (options?.ruleset !== undefined && options.ruleset.trim() !== "") {
    const rules = await loadRulesetFromFile(options.ruleset);
    spectral.setRuleset(rules);
  } else {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    spectral.setRuleset(asyncapiRuleset as any);
  }

  const raw = await spectral.run(content);
  return { diagnostics: raw.map(toLintDiagnostic) };
}
