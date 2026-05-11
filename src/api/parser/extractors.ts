import type {
  AsyncAPIDocumentInterface,
  ChannelInterface,
  MessageInterface,
  OperationInterface,
  ServerInterface,
} from "@asyncapi/parser";
import { bindingsToCompact, schemaToOneLiner } from "./schema-utils.js";
import type {
  ChannelWithTags,
  CoreTextFields,
  MaybeCoreText,
  WithTags,
} from "./types.js";

function tagNames(entity: WithTags): string[] {
  return entity.tags().all().map((t) => t.name());
}

function pickCoreText(entity: object): CoreTextFields {
  const out: CoreTextFields = {};
  const e = entity as MaybeCoreText;
  if (e.hasTitle?.()) {
    const t = e.title?.();
    if (t !== undefined) out.title = t;
  }
  if (e.hasSummary?.()) {
    const s = e.summary?.();
    if (s !== undefined) out.summary = s;
  }
  if (e.hasDescription?.()) {
    const d = e.description?.();
    if (d !== undefined) out.description = d;
  }
  return out;
}

export function extractAsyncApiInfo(doc: AsyncAPIDocumentInterface) {
  const info = doc.info();
  const infoFields = { ...(info.json() as Record<string, unknown>) };

  return {
    asyncapi: doc.version(),
    defaultContentType: doc.hasDefaultContentType()
      ? doc.defaultContentType()
      : undefined,
    info: {
      ...infoFields,
      tags: tagNames(info),
    },
  };
}

export function extractServers(doc: AsyncAPIDocumentInterface) {
  return doc.allServers().all().map((s: ServerInterface) => {
    const bindings = s.bindings();
    const variables = s.variables().all();
    return {
      id: s.id(),
      url: s.url(),
      host: s.host(),
      protocol: s.protocol(),
      pathname: s.hasPathname() ? s.pathname() : undefined,
      protocolVersion: s.hasProtocolVersion() ? s.protocolVersion() : undefined,
      ...pickCoreText(s as object),
      tags: tagNames(s),
      variables:
        variables.length > 0
          ? variables.map((v) => ({
              id: v.id(),
              ...(v.json() as Record<string, unknown>),
            }))
          : undefined,
      bindings: bindings.isEmpty()
        ? undefined
        : bindingsToCompact(bindings).map((b) => ({
            protocol: b.protocol,
            summary: b.summary,
          })),
    };
  });
}

export function extractChannels(doc: AsyncAPIDocumentInterface) {
  return doc.allChannels().all().map((c: ChannelInterface) => {
    const bindings = c.bindings();
    return {
      id: c.id(),
      address: c.address() ?? null,
      ...pickCoreText(c as object),
      tags: tagNames(c as ChannelWithTags),
      parameterIds: c
        .parameters()
        .all()
        .map((p) => p.id()),
      messageIds: c.messages().all().map((m: MessageInterface) => m.id()),
      bindings: bindings.isEmpty()
        ? undefined
        : bindingsToCompact(bindings).map((b) => ({
            protocol: b.protocol,
            summary: b.summary,
          })),
    };
  });
}

export function extractOperations(doc: AsyncAPIDocumentInterface) {
  return doc.allOperations().all().map((o: OperationInterface) => {
    return {
      id: o.id() ?? "",
      action: o.action(),
      operationId: o.hasOperationId() ? o.operationId() : undefined,
      ...pickCoreText(o as object),
      tags: tagNames(o),
      channelIds: o.channels().all().map((ch: ChannelInterface) => ch.id()),
      messageIds: o.messages().all().map((m: MessageInterface) => m.id()),
    };
  });
}

export function extractMessages(
  doc: AsyncAPIDocumentInterface,
  includeHeadersSummary: boolean
) {
  return doc.allMessages().all().map((m: MessageInterface) => {
    const payload = m.hasPayload() ? m.payload() : undefined;
    const headers = m.hasHeaders() ? m.headers() : undefined;
    const row: Record<string, unknown> = {
      id: m.id(),
      name: m.hasName() ? m.name() : undefined,
      ...pickCoreText(m as object),
      tags: tagNames(m),
      contentType: m.hasContentType() ? m.contentType() : undefined,
      schemaFormat: m.hasSchemaFormat() ? m.schemaFormat() : undefined,
      hasPayload: m.hasPayload(),
      hasHeaders: m.hasHeaders(),
      payloadSummary: payload ? schemaToOneLiner(payload) : undefined,
    };
    if (includeHeadersSummary && headers) {
      row.headersSummary = schemaToOneLiner(headers);
    }
    return row;
  });
}
