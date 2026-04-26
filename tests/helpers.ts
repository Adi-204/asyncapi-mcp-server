import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import createServer from "../src/server.js";

/**
 * Spins up an in-process McpServer + Client connected via linked
 * InMemoryTransport pair.  Returns the client (for callTool / listTools)
 * and a teardown function the caller should invoke in afterAll / afterEach.
 */
export async function createTestClient(): Promise<{
  client: Client;
  cleanup: () => Promise<void>;
}> {
  const server = createServer();
  const client = new Client({ name: "test-client", version: "0.0.1" });

  const [clientTransport, serverTransport] =
    InMemoryTransport.createLinkedPair();

  await Promise.all([
    server.connect(serverTransport),
    client.connect(clientTransport),
  ]);

  return {
    client,
    cleanup: async () => {
      await client.close();
      await server.close();
    },
  };
}
