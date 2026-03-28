import { VALID_CLIENTS, getClientConfiguration } from "../../config/clients.js"
import { readConfig } from "../../lib/client-config-io.js"
import { outputTable, isJsonMode, info } from "../../utils/output.js"
import { BUILTIN_MCP_SERVERS } from "./servers.js"

export async function mcpListCommand(options: { client?: string }) {
  const clientsToCheck = options.client ? [options.client] : VALID_CLIENTS
  const rows: Record<string, unknown>[] = []

  for (const clientId of clientsToCheck) {
    try {
      const clientConfig = getClientConfiguration(clientId)
      const config = readConfig(clientId)
      const servers = config.mcpServers ?? {}
      for (const [name, entry] of Object.entries(servers)) {
        if (BUILTIN_MCP_SERVERS.some((s) => s.name === name)) {
          const server = BUILTIN_MCP_SERVERS.find((s) => s.name === name)
          // Strip apikey from URL for display
          let displayUrl = (entry as Record<string, unknown>).url as string ?? ""
          displayUrl = displayUrl.replace(/[?&]apikey=[^&]*/g, "?apikey=***")
          rows.push({
            client: clientConfig.label,
            name,
            category: server?.category ?? "",
            url: displayUrl,
          })
        }
      }
    } catch {
      // skip unavailable clients
    }
  }

  if (rows.length === 0) {
    info("No Patsnap MCP servers installed. Run: patsnap mcp add")
    return
  }

  outputTable({
    data: rows,
    columns: [
      { key: "client", header: "CLIENT" },
      { key: "name", header: "SERVER" },
      { key: "category", header: "CATEGORY" },
      { key: "url", header: "URL" },
    ],
    json: isJsonMode(),
  })
}
