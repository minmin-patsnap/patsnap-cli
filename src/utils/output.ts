/**
 * @author min.min
 * @date 2026/3/27
 */
import pc from "picocolors"

export function success(msg: string) {
  console.log(pc.green("✓") + " " + msg)
}

export function error(msg: string) {
  console.error(pc.red("✗") + " " + msg)
}

export function info(msg: string) {
  console.log(pc.cyan("ℹ") + " " + msg)
}

export function warn(msg: string) {
  console.log(pc.yellow("⚠") + " " + msg)
}
