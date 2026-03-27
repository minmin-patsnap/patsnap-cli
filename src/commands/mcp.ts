/**
 * @author min.min
 * @date 2026/3/27
 */
import inquirer from "inquirer"
import { getToken } from "../lib/auth.js"
import { authedRequest } from "../lib/api.js"
import { CLIENTS, addMcpServer, removeMcpServer } from "../lib/client-config.js"
import { success, error, info, warn } from "../utils/output.js"

const MCP_SERVER_NAME = "patsnap"
const MCP_PACKAGE = "@patsnap/mcp-server"

async function pickApiKey(): Promise<string | null> {
  try {
    const api = await authedRequest()
    const res = await api.get("/openapi/apikey/list")
    const keys: Array<{ id: string; name: string; prefix: string }> = res.data?.data ?? []

    if (keys.length > 0) {
      const { choice } = await inquirer.prompt([
        {
          type: "list",
          name: "choice",
          message: "Select an API key to use:",
          choices: [
            ...keys.map((k) => ({ name: `${k.name} (${k.prefix}...)`, value: k.prefix })),
            { name: "Create a new API key", value: "__new__" },
          ],
        },
      ])
      if (choice !== "__new__") return choice
    }

    const { name } = await inquirer.prompt([
      { type: "input", name: "name", message: "New API key name:", default: "patsnap-cli" },
    ])
    const createRes = await api.post("/openapi/apikey/create", { name })
    const key: string = createRes.data?.data?.key
    if (!key) throw new Error("Failed to create API key")
    success(`Created API key: ${key}`)
    return key
  } catch {
    return null
  }
}

export async function mcpAddCommand() {
  const token = await getToken()
  if (!token) {
    error("Not logged in. Run: patsnap login")
    process.exit(1)
  }

  const { clientIndex } = await inquirer.prompt([
    {
      type: "list",
      name: "clientIndex",
      message: "Add Patsnap MCP Server to which client?",
      choices: CLIENTS.map((c, i) => ({ name: c.name, value: i })),
    },
  ])

  const client = CLIENTS[clientIndex]

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

  addMcpServer(client.configPath, client.configKey, MCP_SERVER_NAME, {
    command: "npx",
    args: ["-y", MCP_PACKAGE],
    env: { PATSNAP_API_KEY: apiKey as string },
  })

  success(`Added Patsnap MCP Server to ${client.name}`)
  info(`Config written to: ${client.configPath}`)
  if (client.name === "Claude Desktop") {
    warn("Restart Claude Desktop to apply changes")
  }
}

export async function mcpRemoveCommand() {
  const { clientIndex } = await inquirer.prompt([
    {
      type: "list",
      name: "clientIndex",
      message: "Remove Patsnap MCP Server from which client?",
      choices: CLIENTS.map((c, i) => ({ name: c.name, value: i })),
    },
  ])

  const client = CLIENTS[clientIndex]
  const removed = removeMcpServer(client.configPath, client.configKey, MCP_SERVER_NAME)

  if (removed) {
    success(`Removed Patsnap MCP Server from ${client.name}`)
  } else {
    info(`Patsnap MCP Server was not configured in ${client.name}`)
  }
}
