/**
 * @author min.min
 * @date 2026/3/27
 */
import { Command } from "commander"
import { loginCommand, logoutCommand, whoamiCommand } from "./commands/login.js"
import { apikeyListCommand, apikeyCreateCommand } from "./commands/apikey.js"
import { mcpAddCommand, mcpRemoveCommand } from "./commands/mcp.js"

declare const __VERSION__: string

const program = new Command()

program
  .name("patsnap")
  .description("Patsnap CLI")
  .version(__VERSION__)

program.command("login").description("Log in to Patsnap").action(loginCommand)
program.command("logout").description("Log out").action(logoutCommand)
program.command("whoami").description("Show current logged-in user").action(whoamiCommand)

const apikey = program.command("apikey").description("Manage API keys")
apikey.command("list").description("List your API keys").action(apikeyListCommand)
apikey.command("create").description("Create a new API key").action(apikeyCreateCommand)

const mcp = program.command("mcp").description("Manage MCP server configuration")
mcp.command("add").description("Add Patsnap MCP Server to an AI client").action(mcpAddCommand)
mcp.command("remove").description("Remove Patsnap MCP Server from an AI client").action(mcpRemoveCommand)

program.parse()
