import inquirer from "inquirer"
import { VALID_CLIENTS, getClientConfiguration } from "../config/clients.js"
import { authedRequest } from "../lib/api.js"

/**
 * Interactive prompt to select an AI client.
 * Returns the client ID (e.g. "claude", "cursor").
 */
export async function selectClient(): Promise<string> {
  const { clientId } = await inquirer.prompt([
    {
      type: "list",
      name: "clientId",
      message: "Select AI client:",
      choices: VALID_CLIENTS.map((id) => ({
        name: getClientConfiguration(id).label,
        value: id,
      })),
    },
  ])
  return clientId
}

/**
 * Fetch API keys from backend and let user pick one.
 * Returns the selected API key string, or null if user wants to enter manually
 * or if the request fails.
 */
export async function pickApiKey(): Promise<string | null> {
  try {
    const api = await authedRequest()
    const res = await api.get("/manager/person-center/api-keys")
    const keys: Array<{ name: string; api_key: string }> = res.data?.data ?? []

    if (keys.length === 0) return null

    const { choice } = await inquirer.prompt([
      {
        type: "list",
        name: "choice",
        message: "Select an API key to use:",
        choices: [
          ...keys.map((k) => ({
            name: `${k.name} (${k.api_key.slice(0, 10)}...)`,
            value: k.api_key,
          })),
          { name: "Enter API key manually", value: "__manual__" },
        ],
      },
    ])

    return choice === "__manual__" ? null : choice
  } catch {
    return null
  }
}
