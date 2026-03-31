import { outputDetail, error } from "../../utils/output.js"
import { fetchMcpServers } from "./servers.js"

export async function mcpGetCommand(name: string) {
  let servers
  try {
    servers = await fetchMcpServers()
  } catch (e: any) {
    error(e.message)
    process.exit(1)
  }

  const server = servers.find((s) => s.name === name)
  if (!server) {
    error(`Server not found: "${name}". Run "patsnap mcp search" to see available servers.`)
    process.exit(1)
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
