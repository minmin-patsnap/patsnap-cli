import { existsSync } from "node:fs"
import { execSync } from "node:child_process"

// If dist already exists (GitHub install), skip build
if (existsSync("dist/index.js")) {
  console.log("dist/ already exists, skipping build")
} else {
  execSync("node build.mjs", { stdio: "inherit" })
}
