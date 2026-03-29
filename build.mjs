import { readFileSync } from "node:fs"
import * as esbuild from "esbuild"

const pkg = JSON.parse(readFileSync("package.json", "utf-8"))

await esbuild.build({
  entryPoints: ["src/index.ts"],
  bundle: true,
  platform: "node",
  target: "node20",
  format: "esm",
  minify: false,
  outfile: "dist/index.js",
  external: ["inquirer"],
  banner: {
    js: `#!/usr/bin/env node\nimport { createRequire } from 'module'; const require = createRequire(import.meta.url);`,
  },
  define: {
    __VERSION__: JSON.stringify(pkg.version),
  },
})

console.log("✓ Build complete")
