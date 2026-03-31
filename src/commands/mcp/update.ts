import inquirer from "inquirer"
import { readConfig, writeConfig } from "../../lib/client-config-io.js"
import { getClientConfiguration } from "../../config/clients.js"
import { success, info } from "../../utils/output.js"
import { selectClient, pickApiKey } from "../../utils/command-prompts.js"

export async function mcpUpdateCommand() {
  const clientId = await selectClient()
  const clientConfig = getClientConfiguration(clientId)
  const config = readConfig(clientId)
  const existing = config.mcpServers ?? {}

  const installedNames = Object.keys(existing)

  if (installedNames.length === 0) {
    info(`No Patsnap MCP servers found in ${clientConfig.label}`)
    return
  }

  const { toUpdate } = await inquirer.prompt([
    {
      type: "checkbox",
      name: "toUpdate",
      message: "Select servers to update API key:",
      choices: installedNames.map((n) => ({ name: n, value: n, checked: true })),
    },
  ])

  if (toUpdate.length === 0) {
    info("Nothing selected")
    return
  }

  let apiKey = await pickApiKey()
  if (!apiKey) {
    const { manualKey } = await inquirer.prompt([
      {
        type: "input",
        name: "manualKey",
        message: "Enter new Patsnap API key (sk-...):",
        validate: (v: string) => v.startsWith("sk-") || "Must start with sk-",
      },
    ])
    apiKey = manualKey
  }

  for (const name of toUpdate) {
    const entry = config.mcpServers[name] as Record<string, unknown>
    if (entry?.url) {
      const baseUrl = (entry.url as string).split("?")[0]
      config.mcpServers[name] = { ...entry, url: `${baseUrl}?apikey=${apiKey}` }
    }
  }

  writeConfig(config, clientId)
  success(`Updated API key for ${toUpdate.length} server(s) in ${clientConfig.label}`)
}
