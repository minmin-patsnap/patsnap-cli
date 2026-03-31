import inquirer from "inquirer"
import { getToken } from "../../lib/auth.js"
import { readConfig, writeConfig } from "../../lib/client-config-io.js"
import { getClientConfiguration } from "../../config/clients.js"
import { success, error, info, warn } from "../../utils/output.js"
import { selectClient, pickApiKey } from "../../utils/command-prompts.js"
import { fetchMcpServers } from "./servers.js"

export async function mcpAddCommand() {
  const token = await getToken()
  if (!token) {
    error("Not logged in. Run: patsnap login")
    process.exit(1)
  }

  let servers
  try {
    servers = await fetchMcpServers()
  } catch (e: any) {
    error(e.message)
    process.exit(1)
  }

  const clientId = await selectClient()
  const clientConfig = getClientConfiguration(clientId)

  let apiKey = await pickApiKey()
  if (!apiKey) {
    const { manualKey } = await inquirer.prompt([
      {
        type: "input",
        name: "manualKey",
        message: "Enter your Patsnap API key (sk-...):",
        validate: (v: string) => v.startsWith("sk-") || "Must start with sk-",
      },
    ])
    apiKey = manualKey
  }

  const { selectedNames } = await inquirer.prompt([
    {
      type: "checkbox",
      name: "selectedNames",
      message: "Select MCP servers to add (space to select, enter to confirm):",
      choices: servers.map((s) => ({
        name: `[${s.category}] ${s.display_name}`,
        value: s.name,
        checked: false,
      })),
      validate: (v: string[]) => v.length > 0 || "Select at least one server",
    },
  ])

  const selected = servers.filter((s) => selectedNames.includes(s.name))
  const config = readConfig(clientId)
  if (!config.mcpServers) config.mcpServers = {}

  for (const server of selected) {
    const deployUrl = server.connections[0]?.deployment_url
    if (!deployUrl) continue
    config.mcpServers[server.name] = {
      type: "http",
      url: `${deployUrl}?apikey=${apiKey}`,
    }
  }

  writeConfig(config, clientId)

  success(`Added ${selected.length} MCP server(s) to ${clientConfig.label}`)
  info(`Config written to: ${clientConfig.install.path}`)
  if (clientId === "claude") {
    warn("Restart Claude Desktop to apply changes")
  }
}
