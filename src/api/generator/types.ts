export interface GenerateOptions {
  document: string;
  template: string;
  targetDir: string;
  templateParams?: Record<string, string>;
}

export interface GeneratedFile {
  path: string;
  sizeBytes: number;
}

export interface GenerateResult {
  targetDir: string;
  files: GeneratedFile[];
  fileCount: number;
}
