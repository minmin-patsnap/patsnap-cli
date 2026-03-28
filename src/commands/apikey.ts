/**
 * @author min.min
 * @date 2026/3/27
 */
import inquirer from "inquirer"
import { authedRequest } from "../lib/api.js"
import { success, error, info } from "../utils/output.js"

interface ApiKey {
  api_key_id: string
  api_key: string
  name: string
  description: string
  status: string
  created_at: string
  last_used_at?: string
}

export async function apikeyListCommand() {
  try {
    const api = await authedRequest()
    const res = await api.get("/manager/person-center/api-keys")
    const keys: ApiKey[] = res.data?.data ?? []

    if (keys.length === 0) {
      info("No API keys found. Create one with: patsnap apikey create")
      return
    }

    console.log("\n  Name                  API Key                                            Created")
    console.log("  " + "─".repeat(80))
    for (const k of keys) {
      const name = k.name.padEnd(22)
      const key = k.api_key.padEnd(51)
      const created = k.created_at
      console.log(`  ${name}${key}${created}`)
    }
    console.log()
  } catch (err: any) {
    error(err.message)
    process.exit(1)
  }
}

export async function apikeyCreateCommand() {
  const { name } = await inquirer.prompt([
    {
      type: "input",
      name: "name",
      message: "API Key name:",
      validate: (v: string) => v.length > 0 || "Required",
    },
  ])

  try {
    const api = await authedRequest()
    const res = await api.post("/openapi/apikey/create", { name })
    const key: string = res.data?.data?.key

    if (!key) {
      error("Failed to create API key")
      process.exit(1)
    }

    success("API Key created (save it now — it won't be shown again):")
    console.log("\n  " + key + "\n")
  } catch (err: any) {
    error(err.message)
    process.exit(1)
  }
}
