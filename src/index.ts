/**
 * @author min.min
 * @date 2026/3/27
 */
import { Command } from "commander"
import { loginCommand, logoutCommand, whoamiCommand } from "./commands/auth/index.js"
import { apikeyListCommand, apikeyCreateCommand } from "./commands/apikey.js"
import {
  mcpAddCommand,
  mcpRemoveCommand,
  mcpListCommand,
  mcpGetCommand,
  mcpUpdateCommand,
  mcpSearchCommand,
} from "./commands/mcp/index.js"
import { setVerbose, setDebug } from "./lib/logger.js"
import { setOutputMode } from "./utils/output.js"

declare const __VERSION__: string

const program = new Command()

program
  .name("patsnap")
  .description("Patsnap CLI")
  .version(__VERSION__)
  .option("--verbose", "Show verbose logs")
  .option("--debug", "Show debug logs")
  .option("--json", "Output as JSON")
  .option("--table", "Output as table")

program.hook("preAction", () => {
  const opts = program.opts()
  setVerbose(opts.verbose ?? false)
  setDebug(opts.debug ?? false)
  setOutputMode({ json: opts.json, table: opts.table })
})

// ─── Auth ────────────────────────────────────────────────────────────────────
program.command("login").description("Log in to Patsnap").action(loginCommand)
program.command("logout").description("Log out").action(logoutCommand)
program.command("whoami").description("Show current logged-in user").action(whoamiCommand)

// ─── API Keys ────────────────────────────────────────────────────────────────
const apikey = program.command("apikey").description("Manage API keys")
apikey.command("list").description("List your API keys").action(apikeyListCommand)
apikey.command("create").description("Create a new API key").action(apikeyCreateCommand)

// ─── MCP ─────────────────────────────────────────────────────────────────────
const mcp = program.command("mcp").description("Manage MCP server configuration")
mcp
  .command("search [term]")
  .description("Search available Patsnap MCP servers")
  .action(mcpSearchCommand)
mcp
  .command("add")
  .description("Add Patsnap MCP servers to an AI client")
  .action(mcpAddCommand)
mcp
  .command("remove")
  .description("Remove Patsnap MCP servers from an AI client")
  .action(mcpRemoveCommand)
mcp
  .command("list")
  .description("List installed Patsnap MCP servers")
  .option("-c, --client <client>", "Filter by client")
  .action((opts) => mcpListCommand(opts))
mcp
  .command("get <name>")
  .description("Show details for a Patsnap MCP server")
  .action(mcpGetCommand)
mcp
  .command("update")
  .description("Update API key for installed servers")
  .action(mcpUpdateCommand)

program.parse()
