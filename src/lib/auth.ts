/**
 * @author min.min
 * @date 2026/3/27
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from "node:fs"
import { homedir } from "node:os"
import { join } from "node:path"

// keytar is a native CJS module — load lazily to avoid bundler conflicts
async function getKeytar() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return (await import("keytar")).default as typeof import("keytar")
}

const KEYCHAIN_SERVICE = "patsnap-cli"
const KEYCHAIN_ACCOUNT = "token"
const CONFIG_DIR = join(homedir(), ".patsnap")
const CONFIG_FILE = join(CONFIG_DIR, "config.json")

export interface UserConfig {
  userId: string
  email: string
  tenantId?: string
}

export async function saveToken(token: string): Promise<void> {
  const keytar = await getKeytar()
  await keytar.setPassword(KEYCHAIN_SERVICE, KEYCHAIN_ACCOUNT, token)
}

export async function getToken(): Promise<string | null> {
  const keytar = await getKeytar()
  return keytar.getPassword(KEYCHAIN_SERVICE, KEYCHAIN_ACCOUNT)
}

export async function deleteToken(): Promise<void> {
  const keytar = await getKeytar()
  await keytar.deletePassword(KEYCHAIN_SERVICE, KEYCHAIN_ACCOUNT)
}

export function saveConfig(config: UserConfig): void {
  if (!existsSync(CONFIG_DIR)) mkdirSync(CONFIG_DIR, { recursive: true })
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
