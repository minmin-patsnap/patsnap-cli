/**
 * @author min.min
 * @date 2026/3/27
 */
import inquirer from "inquirer"
import { passportApi } from "../lib/api.js"
import { saveToken, saveConfig, deleteToken, deleteConfig, getConfig, getToken } from "../lib/auth.js"
import { success, error, info } from "../utils/output.js"

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
    const res = await passportApi.post("/doLogin", {
      username,
      password,
      authcType: "EMAIL_PASSWORD",
    })

    const { token, errcode } = res.data
    if (errcode || !token) {
      error(`Login failed: ${errcode ?? "unknown error"}`)
      process.exit(1)
    }

    await saveToken(token)

    // Decode JWT payload to get user info (no verification needed here)
    const payload = JSON.parse(
      Buffer.from(token.split(".")[1], "base64url").toString()
    )
    saveConfig({
      userId: payload.user_id ?? payload.sub ?? "",
      email: payload.email ?? username,
      tenantId: payload.tenant_id,
    })

    success(`Logged in as ${payload.email ?? username}`)
  } catch (err: any) {
    error(`Login failed: ${err.response?.data?.message ?? err.message}`)
    process.exit(1)
  }
}

export async function logoutCommand() {
  await deleteToken()
  deleteConfig()
  success("Logged out")
}

export async function whoamiCommand() {
  const token = await getToken()
  if (!token) {
    info("Not logged in. Run: patsnap login")
    return
  }
  const config = getConfig()
  if (!config) {
    info("Not logged in. Run: patsnap login")
    return
  }
  console.log(`Logged in as: ${config.email}`)
  if (config.tenantId) console.log(`Tenant ID:    ${config.tenantId}`)
  console.log(`User ID:      ${config.userId}`)
}
