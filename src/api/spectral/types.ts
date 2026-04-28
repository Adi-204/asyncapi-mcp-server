export interface LintDiagnostic {
  rule: string;
  severity: "error" | "warning" | "info" | "hint";
  message: string;
  path: (string | number)[];
  /** 1-based line in the source document */
  line: number;
}

export interface LintResult {
  /** Spectral rule hits for the AsyncAPI document */
  diagnostics: LintDiagnostic[];
}
