import type {
  AsyncAPIDocumentInterface,
  ChannelInterface,
  MessageInterface,
  OperationInterface,
  ServerInterface,
} from "@asyncapi/parser";
import {
  bindingsToCompact,
  extensionsToLines,
  schemaToOneLiner,
  schemaToPropertyList,
  schemaTypeLabel,
} from "./schema-utils.js";

function trimOrUndefined(value: string | undefined | null): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function joinLines(lines: Array<string | undefined>): string {
  return lines.filter((l): l is string => Boolean(l)).join("\n");
}

/**
 * Picks the best short text from an object that has both summary() and
 * description(). For full mode: returns "summary. description" when both exist.
 * For normal mode: returns summary if available, else description (truncated
 * to first sentence to keep TOC compact).
 */
function bestText(
  obj: { hasSummary?: () => boolean; summary?: () => string | undefined; hasDescription?: () => boolean; description?: () => string | undefined },
  full: boolean
): string | undefined {
  const summary = trimOrUndefined(obj.summary?.());
  const description = trimOrUndefined(obj.description?.());

  if (full) {
    if (summary && description) return `${summary}. ${description}`;
    return summary ?? description;
  }

  return summary ?? description;
}

function channelForMessage(
  doc: AsyncAPIDocumentInterface,
  messageId: string
): ChannelInterface | undefined {
  for (const ch of doc.allChannels().all()) {
    for (const m of ch.messages().all()) {
      if (m.id() === messageId) return ch;
    }
  }
  return undefined;
}

// ---------------------------------------------------------------------------
// Title & Summary (same for both modes)
// ---------------------------------------------------------------------------

export function renderTitleAndSummary(
  doc: AsyncAPIDocumentInterface
): string {
  const info = doc.info();
  const title = info.title();
  const version = info.version();
  const description = trimOrUndefined(info.description());
  const asyncapiVersion = doc.version();

  const h1 = version ? `# ${title} (v${version})` : `# ${title}`;
  const summary = description
    ? `> AsyncAPI ${asyncapiVersion} — ${description}`
    : `> AsyncAPI ${asyncapiVersion}`;

  return `${h1}\n\n${summary}`;
}

// ---------------------------------------------------------------------------
// Spec Info (same for both modes — key-value facts)
// ---------------------------------------------------------------------------

export function renderSpecInfo(doc: AsyncAPIDocumentInterface): string {
  const info = doc.info();
  const protocols = Array.from(
    new Set(
      doc
        .allServers()
        .all()
        .map((s: ServerInterface) => s.protocol())
        .filter((p): p is string => Boolean(p))
    )
  ).sort();

  const lines: Array<string | undefined> = [
    `- **AsyncAPI**: ${doc.version()}`,
    info.version() ? `- **API Version**: ${info.version()}` : undefined,
    protocols.length > 0
      ? `- **Protocols**: ${protocols.join(", ")}`
      : undefined,
    doc.hasDefaultContentType()
      ? `- **Default Content-Type**: ${doc.defaultContentType()}`
      : undefined,
    info.hasExternalDocs()
      ? `- **External Docs**: [${info.externalDocs()!.description() ?? info.externalDocs()!.url()}](${info.externalDocs()!.url()})`
      : undefined,
  ];

  return `## Spec Info\n\n${joinLines(lines)}`;
}

// ---------------------------------------------------------------------------
// Servers
// ---------------------------------------------------------------------------

export function renderServers(
  doc: AsyncAPIDocumentInterface,
  full: boolean
): string {
  const servers = doc.allServers().all();
  if (servers.length === 0) return "";

  const lines = servers.map((s: ServerInterface) => {
    const host = s.host() ?? "";
    const pathname = s.hasPathname() ? (s.pathname() ?? "") : "";
    const address = `${host}${pathname}`;
    const text = bestText(s, full);

    if (full) {
      const textSuffix = text ? ` — ${text}` : "";
      return `- **${s.id()}** (${s.protocol()}): \`${address}\`${textSuffix}`;
    }
    const parts = [
      `[${s.id()}](#/servers/${s.id()})`,
      s.protocol(),
      `\`${address}\``,
    ];
    if (text) parts.push(text);
    return `- ${parts.join(" - ")}`;
  });

  return `## Servers\n\n${lines.join("\n")}`;
}

// ---------------------------------------------------------------------------
// Channels
// ---------------------------------------------------------------------------

export function renderChannels(
  doc: AsyncAPIDocumentInterface,
  full: boolean
): string {
  const channels = doc.allChannels().all();
  if (channels.length === 0) return "";

  const blocks = channels.map((c: ChannelInterface) => {
    const address = c.address();
    const text = bestText(c, full);

    if (full) {
      const addressSuffix = address ? ` [\`${address}\`]` : "";
      const textSuffix = text ? `: ${text}` : "";
      const head = `- **${c.id()}**${addressSuffix}${textSuffix}`;
      const messageIds = c
        .messages()
        .all()
        .map((m: MessageInterface) => m.id());
      const messagesLine =
        messageIds.length > 0
          ? `  - Messages: ${messageIds.join(", ")}`
          : "";
      return messagesLine ? `${head}\n${messagesLine}` : head;
    }

    const parts = [`[${c.id()}](#/channels/${c.id()})`];
    if (address) parts.push(`\`${address}\``);
    if (text) parts.push(text);
    return `- ${parts.join(" - ")}`;
  });

  return `## Channels\n\n${blocks.join("\n")}`;
}

// ---------------------------------------------------------------------------
// Operations
// ---------------------------------------------------------------------------

function renderOperationLine(
  op: OperationInterface,
  direction: "send" | "receive",
  full: boolean
): string {
  const channel = op.channels().all()[0];
  const channelId = channel?.id() ?? "";
  const messageIds = op
    .messages()
    .all()
    .map((m: MessageInterface) => m.id());
  const text = bestText(op, full);
  const arrowChar = direction === "send" ? "→" : "←";

  if (full) {
    const messagesSuffix =
      messageIds.length > 0 ? ` (${messageIds.join(", ")})` : "";
    const textSuffix = text ? `: ${text}` : "";
    return `- **${op.id()}** ${arrowChar} \`${channelId}\`${messagesSuffix}${textSuffix}`;
  }

  const parts = [`[${op.id()}](#/operations/${op.id()})`, `${arrowChar} ${channelId}`];
  if (text) parts.push(text);
  return `- ${parts.join(" - ")}`;
}

export function renderOperations(
  doc: AsyncAPIDocumentInterface,
  full: boolean
): string {
  const operations = doc.allOperations().all();
  if (operations.length === 0) return "";

  const sends = operations.filter((o: OperationInterface) => o.isSend());
  const receives = operations.filter((o: OperationInterface) => o.isReceive());

  const sections: string[] = [];
  if (sends.length > 0) {
    const lines = sends.map((o) => renderOperationLine(o, "send", full));
    sections.push(`### Sends\n\n${lines.join("\n")}`);
  }
  if (receives.length > 0) {
    const lines = receives.map((o) =>
      renderOperationLine(o, "receive", full)
    );
    sections.push(`### Receives\n\n${lines.join("\n")}`);
  }

  if (sections.length === 0) return "";
  return `## Operations\n\n${sections.join("\n\n")}`;
}

// ---------------------------------------------------------------------------
// Messages
// ---------------------------------------------------------------------------

function messageMetaLines(m: MessageInterface): string[] {
  const lines: string[] = [];
  if (m.hasSchemaFormat()) {
    const sf = m.schemaFormat();
    if (sf) lines.push(`  - Schema format: \`${sf}\``);
  }
  if (m.hasCorrelationId()) {
    const c = m.correlationId();
    if (c) {
      const loc = c.location();
      const desc = trimOrUndefined(c.description());
      const mid = [loc, desc].filter(Boolean).join(" — ");
      if (mid) lines.push(`  - Correlation ID: ${mid}`);
    }
  }
  if (m.hasHeaders()) {
    const h = m.headers();
    if (h) lines.push(`  - Headers: \`${schemaToOneLiner(h)}\``);
  }
  if (m.hasExternalDocs()) {
    const ed = m.externalDocs();
    if (ed) {
      const label = trimOrUndefined(ed.description()) ?? ed.url();
      lines.push(`  - External docs: [${label}](${ed.url()})`);
    }
  }
  const tags = m.tags().all();
  if (tags.length > 0) {
    lines.push(`  - Tags: ${tags.map((t) => t.name()).join(", ")}`);
  }
  return lines;
}

export function renderMessages(
  doc: AsyncAPIDocumentInterface,
  full: boolean
): string {
  const messages = doc.allMessages().all();
  if (messages.length === 0) return "";

  const blocks = messages.map((m: MessageInterface) => {
    const contentType = m.hasContentType() ? m.contentType() : undefined;
    const text = bestText(m, full);

    if (full) {
      const contentTypeSuffix = contentType ? ` (${contentType})` : "";
      const textSuffix = text ? `: ${text}` : "";
      const head = `- **${m.id()}**${contentTypeSuffix}${textSuffix}`;
      const meta = messageMetaLines(m);
      return meta.length > 0 ? `${head}\n${meta.join("\n")}` : head;
    }

    const ch = channelForMessage(doc, m.id());
    const pointer = ch
      ? `#/channels/${ch.id()}/messages/${m.id()}`
      : `#/components/messages/${m.id()}`;
    const parts = [`[${m.id()}](${pointer})`];
    if (contentType) parts.push(`(${contentType})`);
    if (text) parts.push(text);
    return `- ${parts.join(" - ")}`;
  });

  return `## Messages\n\n${blocks.join("\n")}`;
}

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

export function renderSchemas(
  doc: AsyncAPIDocumentInterface,
  full: boolean
): string {
  const messages = doc.allMessages().all();
  const blocks: string[] = [];

  for (const m of messages) {
    if (!m.hasPayload()) continue;
    const payload = m.payload();
    if (!payload) continue;

    const typeLabel = schemaTypeLabel(payload);

    if (full) {
      const head = `- **${m.id()}.payload** (${typeLabel})`;
      const propertyLines = schemaToPropertyList(payload);
      blocks.push(
        propertyLines.length === 0
          ? head
          : `${head}\n${propertyLines.join("\n")}`
      );
    } else {
      const ch = channelForMessage(doc, m.id());
      const pointer = ch
        ? `#/channels/${ch.id()}/messages/${m.id()}/payload`
        : `#/components/messages/${m.id()}/payload`;
      blocks.push(`- [${m.id()}.payload](${pointer}) - ${typeLabel}`);
    }
  }

  if (blocks.length === 0) return "";
  return `## Schemas\n\n${blocks.join("\n")}`;
}

// ---------------------------------------------------------------------------
// Security Schemes (tier-2)
// ---------------------------------------------------------------------------

function renderSecurityScheme(
  s: { id: () => string; type: () => string; description?: () => string | undefined; hasIn?: () => boolean; in?: () => string | undefined; hasScheme?: () => boolean; scheme?: () => string | undefined; hasBearerFormat?: () => boolean; bearerFormat?: () => string | undefined; hasOpenIdConnectUrl?: () => boolean; openIdConnectUrl?: () => string | undefined; hasFlows?: () => boolean; flows?: () => { hasImplicit: () => boolean; hasPassword: () => boolean; hasClientCredentials: () => boolean; hasAuthorizationCode: () => boolean } | undefined },
  full: boolean,
  pointer: string
): string {
  const rawId = s.id();
  const id = rawId || s.type();
  const type = s.type();
  const description = trimOrUndefined(s.description?.());

  if (full) {
    const descSuffix = description ? `: ${description}` : "";
    const head = `- **${id}** (${type})${descSuffix}`;
    const details: string[] = [];
    if (s.hasIn?.()) details.push(`  - In: ${s.in!()}`);
    if (s.hasScheme?.()) details.push(`  - Scheme: ${s.scheme!()}`);
    if (s.hasBearerFormat?.())
      details.push(`  - Bearer format: ${s.bearerFormat!()}`);
    if (s.hasOpenIdConnectUrl?.())
      details.push(`  - OpenID Connect URL: ${s.openIdConnectUrl!()}`);
    if (s.hasFlows?.()) {
      const flows = s.flows!()!;
      const names: string[] = [];
      if (flows.hasImplicit()) names.push("implicit");
      if (flows.hasPassword()) names.push("password");
      if (flows.hasClientCredentials()) names.push("clientCredentials");
      if (flows.hasAuthorizationCode()) names.push("authorizationCode");
      if (names.length > 0)
        details.push(`  - Flows: ${names.join(", ")}`);
    }
    return details.length > 0
      ? `${head}\n${details.join("\n")}`
      : head;
  }

  const parts = [`[${id}](${pointer})`, type];
  if (description) parts.push(description);
  return `- ${parts.join(" - ")}`;
}

export function renderSecuritySchemes(
  doc: AsyncAPIDocumentInterface,
  full: boolean
): string {
  const lines: string[] = [];

  const components = doc.components();
  if (components && !components.securitySchemes().isEmpty()) {
    for (const s of components.securitySchemes().all()) {
      lines.push(
        renderSecurityScheme(
          s,
          full,
          `#/components/securitySchemes/${s.id()}`
        )
      );
    }
  }

  const seenIds = new Set<string>();
  for (const l of lines) seenIds.add(l);
  for (const server of doc.allServers().all()) {
    const reqCollections = server.security();
    if (!reqCollections || reqCollections.length === 0) continue;
    for (const collection of reqCollections) {
      for (const req of collection.all()) {
        const scheme = req.scheme();
        const key = scheme.id();
        if (seenIds.has(key)) continue;
        seenIds.add(key);
        lines.push(
          renderSecurityScheme(
            scheme,
            full,
            `#/servers/${server.id()}/security`
          )
        );
      }
    }
  }

  if (lines.length === 0) return "";
  return `## Security Schemes\n\n${lines.join("\n")}`;
}

// ---------------------------------------------------------------------------
// Bindings (tier-2)
// ---------------------------------------------------------------------------

export function renderBindings(
  doc: AsyncAPIDocumentInterface,
  full: boolean
): string {
  const lines: string[] = [];

  const renderBinding = (
    scopeLabel: string,
    pointer: string,
    entries: ReturnType<typeof bindingsToCompact>
  ) => {
    for (const e of entries) {
      if (full) {
        lines.push(`- **${scopeLabel} / ${e.protocol}**: ${e.summary}`);
      } else {
        const linkId = `${scopeLabel.replace(/[`*]/g, "")}/${e.protocol}`;
        lines.push(
          `- [${linkId}](${pointer}/bindings/${e.protocol}) - ${e.description ?? `${e.protocol} binding`}`
        );
      }
    }
  };

  for (const s of doc.allServers().all()) {
    renderBinding(
      `Server \`${s.id()}\``,
      `#/servers/${s.id()}`,
      bindingsToCompact(s.bindings())
    );
  }

  for (const c of doc.allChannels().all()) {
    renderBinding(
      `Channel \`${c.id()}\``,
      `#/channels/${c.id()}`,
      bindingsToCompact(c.bindings())
    );
  }

  for (const o of doc.allOperations().all()) {
    renderBinding(
      `Operation \`${o.id()}\``,
      `#/operations/${o.id()}`,
      bindingsToCompact(o.bindings())
    );
  }

  for (const m of doc.allMessages().all()) {
    const ch = channelForMessage(doc, m.id());
    const base = ch
      ? `#/channels/${ch.id()}/messages/${m.id()}`
      : `#/components/messages/${m.id()}`;
    renderBinding(
      `Message \`${m.id()}\``,
      base,
      bindingsToCompact(m.bindings())
    );
  }

  if (lines.length === 0) return "";
  return `## Bindings\n\n${lines.join("\n")}`;
}

// ---------------------------------------------------------------------------
// Extensions (tier-2)
// ---------------------------------------------------------------------------

export function renderExtensions(
  doc: AsyncAPIDocumentInterface,
  full: boolean
): string {
  const allLines: string[] = [];

  const rootExts = extensionsToLines(doc.extensions(), "Root");
  allLines.push(...rootExts);

  const infoExts = extensionsToLines(doc.info().extensions(), "Info");
  allLines.push(...infoExts);

  for (const s of doc.allServers().all()) {
    allLines.push(...extensionsToLines(s.extensions(), `Server \`${s.id()}\``));
  }

  for (const c of doc.allChannels().all()) {
    allLines.push(
      ...extensionsToLines(c.extensions(), `Channel \`${c.id()}\``)
    );
  }

  for (const o of doc.allOperations().all()) {
    allLines.push(
      ...extensionsToLines(o.extensions(), `Operation \`${o.id()}\``)
    );
  }

  for (const m of doc.allMessages().all()) {
    allLines.push(
      ...extensionsToLines(m.extensions(), `Message \`${m.id()}\``)
    );
  }

  if (allLines.length === 0) return "";

  if (full) {
    return `## Extensions\n\n${allLines.join("\n")}`;
  }

  const counts = new Map<string, number>();
  for (const line of allLines) {
    const match = line.match(/`(x-[^`]+)`/);
    if (match) {
      const key = match[1];
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }

  const summaryLines = Array.from(counts.entries()).map(
    ([key, count]) =>
      `- \`${key}\` (${count} occurrence${count > 1 ? "s" : ""})`
  );

  return `## Extensions\n\n${summaryLines.join("\n")}`;
}
