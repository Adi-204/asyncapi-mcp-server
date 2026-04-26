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
