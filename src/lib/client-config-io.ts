import fs from "node:fs"
import path from "node:path"
import { parse as parseJsonc, stringify as stringifyJsonc } from "comment-json"
import * as YAML from "yaml"
import { type ClientDefinition, getClientConfiguration } from "../config/clients.js"
import type { ConfiguredServer, MCPConfig } from "../types/index.js"
import { verbose } from "./logger.js"

export interface ClientMCPConfig extends MCPConfig {
  [key: string]: unknown
}

/**
 * Convert client-specific server config to standard format.
 */
export function fromClientFormat(
  config: Record<string, unknown> | null,
  client: ClientDefinition,
): Record<string, unknown> | null {
  if (!config || typeof config !== "object") return config

  const http = client.transports.http
  const mappings = client.format?.fieldMappings

  const configType = config.type
  const httpTypeValue = http?.typeValue ?? "http"

  let isHTTP = false
  if (
    configType === "http" ||
    configType === "streamableHttp" ||
    configType === "remote" ||
    configType === httpTypeValue
  ) {
    isHTTP = true
  } else {
    const urlKey = mappings?.url ?? "url"
    const cmdKey = mappings?.command ?? "command"
    isHTTP = urlKey in config && !(cmdKey in config)
  }

  const result: Record<string, unknown> = {}

  if (isHTTP) {
    result.type = "http"
    const urlKey = mappings?.url ?? "url"
    if (urlKey in config) result.url = config[urlKey]
    if (config.headers) result.headers = config.headers
  } else {
    const cmdKey = mappings?.command ?? "command"
    const envKey = mappings?.env ?? "env"
    if (cmdKey in config) result.command = config[cmdKey]
    if (!result.args && Array.isArray(config.args)) result.args = config.args
    const envValue = config[envKey]
    if (envValue && typeof envValue === "object" && Object.keys(envValue).length > 0) {
      result.env = envValue
    }
  }

  return result
}

/**
 * Convert standard server config to client-specific format.
 */
export function toClientFormat(
  config: Record<string, unknown> | null,
  client: ClientDefinition,
): Record<string, unknown> | null {
  if (!config || typeof config !== "object") return config

  const http = client.transports.http
  const mappings = client.format?.fieldMappings
  const result: Record<string, unknown> = {}

  const isHTTP =
    "type" in config &&
    (config.type === "http" || config.type === "streamableHttp")

  if (isHTTP) {
    result.type = http?.typeValue ?? "http"
    const urlKey = mappings?.url ?? "url"
    if ("url" in config) result[urlKey] = config.url
    if (config.headers) result.headers = config.headers
  } else {
    const cmdKey = mappings?.command ?? "command"
    const envKey = mappings?.env ?? "env"
    if ("command" in config) result[cmdKey] = config.command
    if (Array.isArray(config.args) && config.args.length > 0) result.args = config.args
    if (config.env && typeof config.env === "object" && Object.keys(config.env).length > 0) {
      result[envKey] = config.env
    }
  }

  return result
}

export function readConfig(clientId: string): ClientMCPConfig {
  verbose(`Reading config for client: ${clientId}`)
  try {
    const clientConfig = getClientConfiguration(clientId)
    const configPath = clientConfig.install.path

    if (!fs.existsSync(configPath)) {
      verbose(`Config file not found: ${configPath}`)
      return { mcpServers: {} }
    }

    const fileContent = fs.readFileSync(configPath, "utf8")
    let rawConfig: Record<string, unknown> = {}

    const format = clientConfig.install.format
    if (format === "jsonc") {
      rawConfig = (parseJsonc(fileContent) as Record<string, unknown>) || {}
    } else if (format === "yaml") {
      const parsed = YAML.parse(fileContent)
      rawConfig = (parsed && typeof parsed === "object" && !Array.isArray(parsed) && parsed as Record<string, unknown>) || {}
    } else {
      rawConfig = JSON.parse(fileContent) as Record<string, unknown>
    }

    const topLevelKey = clientConfig.format?.topLevelKey ?? "mcpServers"
    let mcpServers: Record<string, ConfiguredServer> =
      (rawConfig[topLevelKey] as Record<string, ConfiguredServer>) ||
      (rawConfig.mcpServers as Record<string, ConfiguredServer>) ||
      {}

    const needsTransform =
      topLevelKey !== "mcpServers" ||
      clientConfig.format?.fieldMappings ||
      clientConfig.transports.http?.typeValue !== undefined

    if (needsTransform) {
      const transformed: Record<string, ConfiguredServer> = {}
      for (const [name, cfg] of Object.entries(mcpServers)) {
        if (cfg && typeof cfg === "object" && !Array.isArray(cfg)) {
          const t = fromClientFormat(cfg as Record<string, unknown>, clientConfig)
          if (t !== null) transformed[name] = t as ConfiguredServer
        }
      }
      mcpServers = transformed
    }

    return { ...rawConfig, mcpServers }
  } catch (error) {
    verbose(`Error reading config: ${error instanceof Error ? error.message : String(error)}`)
    return { mcpServers: {} }
  }
}

export function writeConfig(config: ClientMCPConfig, clientId: string): void {
  verbose(`Writing config for client: ${clientId}`)

  const clientConfig = getClientConfiguration(clientId)
  const format = clientConfig.install.format
  const configPath = clientConfig.install.path
  const configDir = path.dirname(configPath)

  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true })
  }

  const topLevelKey = clientConfig.format?.topLevelKey ?? "mcpServers"

  // Transform servers to client format
  const transformedServers: Record<string, Record<string, unknown>> = {}
  for (const [name, cfg] of Object.entries(config.mcpServers)) {
    const t = toClientFormat(cfg as Record<string, unknown>, clientConfig)
    if (t !== null) transformedServers[name] = t
  }

  if (format === "jsonc") {
    let content = "{}"
    if (fs.existsSync(configPath)) content = fs.readFileSync(configPath, "utf8")
    const existing = parseJsonc(content) as Record<string, unknown>
    existing[topLevelKey] = transformedServers
    fs.writeFileSync(configPath, stringifyJsonc(existing, null, 2))
  } else if (format === "yaml") {
    let existingDoc: ReturnType<typeof YAML.parseDocument> | null = null
    if (fs.existsSync(configPath)) {
      existingDoc = YAML.parseDocument(fs.readFileSync(configPath, "utf8"))
    }
    if (existingDoc) {
      existingDoc.set(topLevelKey, transformedServers)
      fs.writeFileSync(configPath, existingDoc.toString())
    } else {
      fs.writeFileSync(configPath, YAML.stringify({ [topLevelKey]: transformedServers }, { indent: 2 }))
    }
  } else {
    // JSON — merge with existing
    let existing: Record<string, unknown> = {}
    if (fs.existsSync(configPath)) {
      try { existing = JSON.parse(fs.readFileSync(configPath, "utf8")) } catch { /* ignore */ }
    }
    const { mcpServers: _, ...otherFields } = config
    const final = { ...existing, ...otherFields, [topLevelKey]: transformedServers }
    fs.writeFileSync(configPath, JSON.stringify(final, null, 2))
  }

  verbose(`Config written to: ${configPath}`)
}
