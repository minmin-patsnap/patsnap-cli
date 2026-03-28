import inquirer from "inquirer"
import { readConfig, writeConfig } from "../../lib/client-config-io.js"
import { getClientConfiguration } from "../../config/clients.js"
import { success, info } from "../../utils/output.js"
import { selectClient } from "../../utils/command-prompts.js"
import { BUILTIN_MCP_SERVERS } from "./servers.js"

export async function mcpRemoveCommand() {
  const clientId = await selectClient()
  const clientConfig = getClientConfiguration(clientId)
  const config = readConfig(clientId)
  const existing = config.mcpServers ?? {}

  const installedNames = BUILTIN_MCP_SERVERS.map((s) => s.name).filter((n) => existing[n])

  if (installedNames.length === 0) {
    info(`No Patsnap MCP servers found in ${clientConfig.label}`)
    return
  }

  const { toRemove } = await inquirer.prompt([
    {
      type: "checkbox",
      name: "toRemove",
      message: "Select MCP servers to remove:",
      choices: installedNames.map((n) => {
        const server = BUILTIN_MCP_SERVERS.find((s) => s.name === n)
        return { name: server?.display_name ?? n, value: n, checked: true }
      }),
    },
  ])

  if (toRemove.length === 0) {
    info("Nothing selected")
    return
  }

  for (const name of toRemove) {
    delete config.mcpServers[name]
  }
  writeConfig(config, clientId)

  success(`Removed ${toRemove.length} MCP server(s) from ${clientConfig.label}`)
}
