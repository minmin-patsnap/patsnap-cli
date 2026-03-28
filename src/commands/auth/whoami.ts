import { getToken, getConfig } from "../../lib/auth.js"
import { info, outputDetail } from "../../utils/output.js"

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
  outputDetail({
    data: {
      email: config.email,
      userId: config.userId,
      ...(config.tenantId ? { tenantId: config.tenantId } : {}),
    },
  })
}
