import { execSync } from "node:child_process"

execSync("node build.mjs", { stdio: "inherit" })
