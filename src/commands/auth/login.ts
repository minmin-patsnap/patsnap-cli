import inquirer from "inquirer"
import { passportApi, encryptPassword } from "../../lib/api.js"
import { saveToken, saveConfig } from "../../lib/auth.js"
import { success, error } from "../../utils/output.js"

export async function loginCommand() {
  const { username, password } = await inquirer.prompt([
    {
      type: "input",
      name: "username",
      message: "Email:",
      validate: (v: string) => v.length > 0 || "Required",
    },
    {
      type: "password",
      name: "password",
      message: "Password:",
      mask: "*",
      validate: (v: string) => v.length > 0 || "Required",
    },
  ])

  try {
    const encryptedPassword = encryptPassword(password)
    const res = await passportApi.post("/doLogin", {
      username,
      password: encryptedPassword,
      client_id: "02a6af67d3264a4188b04aac8ba0c496",
      from: "openapi-ai-inside",
      remember_me: "on",
      response_type: "TOKEN",
    })

    const { token, errcode } = res.data
    if (errcode || !token) {
      error(`Login failed: ${errcode ?? "unknown error"}`)
      process.exit(1)
    }

    await saveToken(token)

    const payload = JSON.parse(
      Buffer.from(token.split(".")[1], "base64url").toString()
    )
    saveConfig({
      userId: payload.user_id ?? payload.sub ?? "",
      email: payload.email ?? username,
      tenantId: payload.tenant_id,
    })

    success(`Logged in as ${payload.email ?? username}`)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    error(`Login failed: ${msg}`)
    process.exit(1)
  }
}
