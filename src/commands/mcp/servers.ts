import { connectAuthedRequest } from "../../lib/api.js"

export interface McpServer {
  id: number
  name: string
  display_name: string
  description_en: string
  category: string
  connections: Array<{ type: string; deployment_url: string }>
}

export async function fetchMcpServers(): Promise<McpServer[]> {
  const api = await connectAuthedRequest()
  const res = await api.get("/manager/mcp/server/my")
  return res.data.data as McpServer[]
}
