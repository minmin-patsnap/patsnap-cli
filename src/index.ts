/**
 * @author min.min
 * @date 2026/3/27
 */
import { Command } from "commander"

declare const __VERSION__: string

const program = new Command()

program
  .name("patsnap")
  .description("Patsnap CLI")
  .version(__VERSION__)

program.parse()
