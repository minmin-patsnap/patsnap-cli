/**
 * @author min.min
 * @date 2026/3/27
 */
import { Command } from "commander"
import { loginCommand, logoutCommand, whoamiCommand } from "./commands/login.js"
import { apikeyListCommand, apikeyCreateCommand } from "./commands/apikey.js"

declare const __VERSION__: string

const program = new Command()

program
  .name("patsnap")
  .description("Patsnap CLI")
  .version(__VERSION__)

program
  .command("login")
  .description("Log in to Patsnap")
  .action(loginCommand)

program
  .command("logout")
  .description("Log out")
  .action(logoutCommand)

program
  .command("whoami")
  .description("Show current logged-in user")
  .action(whoamiCommand)

const apikey = program.command("apikey").description("Manage API keys")

apikey
  .command("list")
  .description("List your API keys")
  .action(apikeyListCommand)

apikey
  .command("create")
  .description("Create a new API key")
  .action(apikeyCreateCommand)

program.parse()
