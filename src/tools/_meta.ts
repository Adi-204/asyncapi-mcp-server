export type ToolExample = {
  description?: string;
  args: Record<string, unknown>;
};

export type ToolMeta = {
  name: string;
  title: string;
  summary: string;
  inputs?: string[];
  returns?: string[];
  notes?: string[];
  examples?: ToolExample[];
};

function formatSection(title: string, lines?: string[]): string | undefined {
  if (!lines || lines.length === 0) return undefined;
  const body = lines.map((l) => `- ${l}`).join("\n");
  return `${title}:\n${body}`;
}

function formatExamples(examples?: ToolExample[]): string | undefined {
  if (!examples || examples.length === 0) return undefined;
  const blocks = examples.map((ex) => {
    const prefix = ex.description ? `${ex.description}\n` : "";
    return `${prefix}${JSON.stringify(ex.args, null, 2)}`;
  });
  return `Examples:\n${blocks.map((b) => `\n${b}`).join("\n")}`.trimEnd();
}

export function buildToolDescription(meta: ToolMeta): string {
  const parts: Array<string | undefined> = [
    meta.summary.trim(),
    formatSection("Inputs", meta.inputs),
    formatSection("Returns", meta.returns),
    formatSection("Notes", meta.notes),
    formatExamples(meta.examples),
  ];

  return parts.filter((p): p is string => Boolean(p && p.trim())).join("\n\n");
}

