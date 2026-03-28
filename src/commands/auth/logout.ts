import { deleteToken, deleteConfig } from "../../lib/auth.js"
import { success } from "../../utils/output.js"

export async function logoutCommand() {
  await deleteToken()
  deleteConfig()
  success("Logged out")
}
