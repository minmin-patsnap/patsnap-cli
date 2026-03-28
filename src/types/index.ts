export interface MCPServerEntry {
  url?: string
  command?: string
  args?: string[]
  env?: Record<string, string>
  type?: string
  headers?: Record<string, string>
}

export type ConfiguredServer = MCPServerEntry

export interface MCPConfig {
  mcpServers: Record<string, ConfiguredServer>
}
