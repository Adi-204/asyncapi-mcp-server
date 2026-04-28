export interface TemplateFilter {
  type?: string;
  stack?: string;
  protocol?: string;
  target?: string;
}

export interface TemplateInfo {
  name: string;
  type: string;
  protocol: string;
  target: string;
  stack?: string;
}

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
