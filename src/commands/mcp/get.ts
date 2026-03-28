import { outputDetail } from "../../utils/output.js"
import { fatal } from "../../lib/errors.js"
import { BUILTIN_MCP_SERVERS } from "./servers.js"

export async function mcpGetCommand(name: string) {
  const server = BUILTIN_MCP_SERVERS.find((s) => s.name === name)
  if (!server) {
    fatal(`Server not found: "${name}". Run "patsnap mcp search" to see available servers.`)
  }

  outputDetail({
    data: {
      name: server.name,
      display_name: server.display_name,
      category: server.category,
      description: server.description_en,
      url: server.connections[0]?.deployment_url ?? "",
    },
  })
}
