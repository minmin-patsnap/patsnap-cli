/**
 * @author min.min
 * @date 2026/3/27
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from "node:fs"
import { homedir } from "node:os"
import { join } from "node:path"

const CONFIG_DIR = join(homedir(), ".patsnap")
const CONFIG_FILE = join(CONFIG_DIR, "config.json")
const TOKEN_FILE = join(CONFIG_DIR, "token")

export interface UserConfig {
  userId: string
  email: string
  tenantId?: string
}

function ensureDir(): void {
  if (!existsSync(CONFIG_DIR)) mkdirSync(CONFIG_DIR, { recursive: true })
}

export async function saveToken(token: string): Promise<void> {
  ensureDir()
  writeFileSync(TOKEN_FILE, token, { mode: 0o600 })
}

export async function getToken(): Promise<string | null> {
  if (!existsSync(TOKEN_FILE)) return null
  try {
    return readFileSync(TOKEN_FILE, "utf-8").trim()
  } catch {
    return null
  }
}

export async function deleteToken(): Promise<void> {
  if (existsSync(TOKEN_FILE)) rmSync(TOKEN_FILE)
}

export function saveConfig(config: UserConfig): void {
  ensureDir()
  writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2))
}

export function getConfig(): UserConfig | null {
  if (!existsSync(CONFIG_FILE)) return null
  try {
    return JSON.parse(readFileSync(CONFIG_FILE, "utf-8"))
  } catch {
    return null
  }
}

export function deleteConfig(): void {
  if (existsSync(CONFIG_FILE)) rmSync(CONFIG_FILE)
}
