import os from "node:os"
import path from "node:path"

// ============================================================================
// Types
// ============================================================================

export interface StdioTransportConfig {
  typeValue?: string
  commandFormat?: "string" | "array"
}

export interface HttpTransportConfig {
  typeValue?: string
  supportsOAuth: boolean
}

export interface FormatConfig {
  topLevelKey?: string
  fieldMappings?: {
    command?: string
    env?: string
    url?: string
  }
}

export interface FileInstallConfig {
  method: "file"
  format: "json" | "jsonc" | "yaml"
  path: string
}

export interface ClientDefinition {
  label: string
  install: FileInstallConfig
  transports: {
    stdio?: StdioTransportConfig
    http?: HttpTransportConfig
  }
  format?: FormatConfig
}

// ============================================================================
// Platform-specific paths
// ============================================================================

const homeDir = os.homedir()

const platformPaths = {
  win32: {
    baseDir: process.env.APPDATA || path.join(homeDir, "AppData", "Roaming"),
    vscodePath: path.join("Code", "User", "globalStorage"),
  },
  darwin: {
    baseDir: path.join(homeDir, "Library", "Application Support"),
    vscodePath: path.join("Code", "User", "globalStorage"),
  },
  linux: {
    baseDir: process.env.XDG_CONFIG_HOME || path.join(homeDir, ".config"),
    vscodePath: path.join("Code/User/globalStorage"),
  },
}

const platform = process.platform as keyof typeof platformPaths
const { baseDir } = platformPaths[platform] ?? platformPaths.linux
const defaultClaudePath = path.join(baseDir, "Claude", "claude_desktop_config.json")

// ============================================================================
// Client Definitions (主流客户端)
// ============================================================================

const CLIENTS: Record<string, ClientDefinition> = {
  claude: {
    label: "Claude Desktop",
    install: {
      method: "file",
      format: "json",
      path: defaultClaudePath,
    },
    transports: {
      http: { supportsOAuth: false },
    },
  },
  "claude-code": {
    label: "Claude Code",
    install: {
      method: "file",
      format: "json",
      path: path.join(homeDir, ".claude", "settings.json"),
    },
    transports: {
      http: { supportsOAuth: false },
    },
  },
  cursor: {
    label: "Cursor",
    install: {
      method: "file",
      format: "json",
      path: path.join(homeDir, ".cursor", "mcp.json"),
    },
    transports: {
      http: { supportsOAuth: false },
    },
  },
  windsurf: {
    label: "Windsurf",
    install: {
      method: "file",
      format: "json",
      path: path.join(homeDir, ".codeium", "windsurf", "mcp_config.json"),
    },
    transports: {
      http: { supportsOAuth: false },
    },
    format: {
      fieldMappings: { url: "serverUrl" },
    },
  },
  cline: {
    label: "Cline",
    install: {
      method: "file",
      format: "json",
      path: path.join(
        baseDir,
        "Code",
        "User",
        "globalStorage",
        "saoudrizwan.claude-dev",
        "settings",
        "cline_mcp_settings.json",
      ),
    },
    transports: {
      http: { typeValue: "streamableHttp", supportsOAuth: false },
    },
  },
}

// ============================================================================
// Helper functions
// ============================================================================

export function getClientConfiguration(clientName: string): ClientDefinition {
  const normalized = clientName.toLowerCase()
  const config = CLIENTS[normalized]
  if (!config) {
    const available = Object.keys(CLIENTS).join(", ")
    throw new Error(`Unknown client: ${clientName}. Available: ${available}`)
  }
  return config
}

export const VALID_CLIENTS = Object.keys(CLIENTS)
export type ValidClient = keyof typeof CLIENTS
