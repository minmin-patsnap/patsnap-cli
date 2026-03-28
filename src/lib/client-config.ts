/**
 * @author min.min
 * @date 2026/3/27
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs"
import { homedir } from "node:os"
import { join, dirname } from "node:path"

export interface McpServerConfig {
  url: string
}

export interface ClientTarget {
  name: string
  configPath: string
  configKey: string
}

export const CLIENTS: ClientTarget[] = [
  {
    name: "Claude Desktop",
    configPath: join(
      homedir(),
      "Library/Application Support/Claude/claude_desktop_config.json"
    ),
    configKey: "mcpServers",
  },
  {
    name: "Claude Code",
    configPath: join(homedir(), ".claude/settings.json"),
    configKey: "mcpServers",
  },
]

export function readConfig(filePath: string): Record<string, any> {
  if (!existsSync(filePath)) return {}
  try {
    return JSON.parse(readFileSync(filePath, "utf-8"))
  } catch {
    return {}
  }
}

export function writeConfig(filePath: string, config: Record<string, any>): void {
  const dir = dirname(filePath)
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  writeFileSync(filePath, JSON.stringify(config, null, 2) + "\n")
}

export function addMcpServer(
  filePath: string,
  configKey: string,
  serverName: string,
  serverConfig: McpServerConfig
): void {
  const config = readConfig(filePath)
  if (!config[configKey]) config[configKey] = {}
  config[configKey][serverName] = serverConfig
  writeConfig(filePath, config)
}

export function removeMcpServer(
  filePath: string,
  configKey: string,
  serverName: string
): boolean {
  const config = readConfig(filePath)
  if (!config[configKey]?.[serverName]) return false
  delete config[configKey][serverName]
  writeConfig(filePath, config)
  return true
}
