import { outputTable, isJsonMode, info, error } from "../../utils/output.js"
import { fetchMcpServers } from "./servers.js"

export async function mcpSearchCommand(term?: string) {
  let servers
  try {
    servers = await fetchMcpServers()
  } catch (e: any) {
    error(e.message)
    process.exit(1)
  }

  const results = term
    ? servers.filter(
        (s) =>
          s.display_name.toLowerCase().includes(term.toLowerCase()) ||
          s.description_en.toLowerCase().includes(term.toLowerCase()) ||
          s.category.toLowerCase().includes(term.toLowerCase()) ||
          s.name.toLowerCase().includes(term.toLowerCase()),
      )
    : servers

  if (results.length === 0) {
    info(`No servers found matching "${term}"`)
    return
  }

  outputTable({
    data: results.map((s) => ({
      name: s.name,
      category: s.category,
      display_name: s.display_name,
      description: s.description_en,
    })),
    columns: [
      { key: "name", header: "NAME" },
      { key: "category", header: "CATEGORY" },
      { key: "display_name", header: "DISPLAY NAME" },
      { key: "description", header: "DESCRIPTION" },
    ],
    json: isJsonMode(),
  })
}
