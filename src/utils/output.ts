import pc from "picocolors"

// ─── Output mode detection ──────────────────────────────────────────────────

let globalJson: boolean | undefined
let globalTable: boolean | undefined

export function setOutputMode(options: { json?: boolean; table?: boolean }): void {
  globalJson = options.json
  globalTable = options.table
}

type OutputFormat = "table" | "json" | "jsonl"

export function getOutputFormat(): OutputFormat {
  if (globalTable) return "table"
  if (globalJson === true) return "json"
  if (globalJson === false) return "table"
  if (!process.stdout.isTTY) return "jsonl"
  return "table"
}

export function isJsonMode(): boolean {
  return getOutputFormat() !== "table"
}

// ─── Table output ───────────────────────────────────────────────────────────

interface OutputColumn {
  key: string
  header: string
  format?: (val: unknown) => string
}

export interface PaginationInfo {
  nextCursor?: string | null
  page?: number
  hasMore?: boolean
  total?: number
}

export function outputTable(options: {
  data: Record<string, unknown>[]
  columns: OutputColumn[]
  json: boolean
  jsonData?: unknown
  tip?: string
  pagination?: PaginationInfo
}): void {
  const { data, columns, json, jsonData, tip, pagination } = options

  if (json) {
    const format = getOutputFormat()
    if (format === "jsonl") {
      const records = extractRecords(jsonData) ?? data
      if (records.length === 0 && jsonData != null && typeof jsonData === "object") {
        console.log(JSON.stringify(jsonData))
      } else {
        for (const record of records) {
          console.log(JSON.stringify(record))
        }
      }
      return
    }
    const payload = jsonData ?? data
    const paginationHint = pagination ? formatPagination(pagination, data.length) : null
    console.log(
      JSON.stringify({
        ...wrapArray(payload),
        ...(tip ? { hint: tip } : {}),
        ...(paginationHint ? { pagination: paginationHint } : {}),
      }),
    )
    return
  }

  if (data.length === 0) {
    if (tip) console.log(pc.dim(tip))
    return
  }

  const widths = columns.map((col) => {
    const vals = data.map((row) => formatCell(row[col.key], col.format).length)
    return Math.max(col.header.length, ...vals)
  })

  if (data.length > 1) {
    const header = columns.map((col, i) => col.header.padEnd(widths[i])).join("  ")
    console.log(pc.dim(header))
  }

  for (const row of data) {
    const line = columns.map((col, i) => formatCell(row[col.key], col.format).padEnd(widths[i])).join("  ")
    console.log(line)
  }

  if (pagination) {
    const msg = formatPagination(pagination, data.length)
    if (msg) console.log(pc.dim(`\n${msg}`))
  }

  if (tip) {
    console.log()
    console.log(pc.dim(`Tip: ${tip}`))
  }
}

// ─── Detail output ───────────────────────────────────────────────────────────

export function outputDetail(options: { data: Record<string, unknown>; tip?: string }): void {
  const { data, tip } = options

  if (isJsonMode()) {
    if (tip) {
      console.log(JSON.stringify({ ...data, hint: tip }))
    } else {
      console.log(JSON.stringify(data))
    }
    return
  }

  const keys = Object.keys(data)
  const maxKeyLen = Math.max(...keys.map((k) => k.length))

  for (const key of keys) {
    const val = data[key]
    if (val === undefined || val === null) continue
    const display = typeof val === "object" ? JSON.stringify(val) : String(val)
    console.log(`${pc.dim(key.padEnd(maxKeyLen))}  ${display}`)
  }

  if (tip) {
    console.log()
    console.log(pc.dim(`Tip: ${tip}`))
  }
}

// ─── Raw JSON output ─────────────────────────────────────────────────────────

export function outputJson(data: unknown): void {
  console.log(JSON.stringify(data))
}

// ─── Simple colored output ───────────────────────────────────────────────────

export function success(msg: string): void {
  console.log(pc.green("✓") + " " + msg)
}

export function error(msg: string): void {
  console.error(pc.red("✗") + " " + msg)
}

export function info(msg: string): void {
  console.log(pc.cyan("ℹ") + " " + msg)
}

export function warn(msg: string): void {
  console.log(pc.yellow("⚠") + " " + msg)
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatCell(val: unknown, format?: (val: unknown) => string): string {
  if (val === undefined || val === null) return ""
  if (format) return format(val)
  return String(val)
}

function extractRecords(data: unknown): unknown[] | null {
  if (Array.isArray(data)) return data
  if (typeof data === "object" && data !== null) {
    const obj = data as Record<string, unknown>
    for (const key of ["results", "servers", "keys"]) {
      if (Array.isArray(obj[key])) return obj[key] as unknown[]
    }
  }
  return null
}

function wrapArray(data: unknown): Record<string, unknown> {
  if (Array.isArray(data)) return { results: data }
  if (typeof data === "object" && data !== null) return data as Record<string, unknown>
  return { result: data }
}

export function truncate(str: string, maxLen = 60): string {
  if (str.length <= maxLen) return str
  return `${str.slice(0, maxLen - 1)}…`
}

function formatPagination(info: PaginationInfo, rowCount: number): string | null {
  if (info.nextCursor) return `Showing ${rowCount} results. More available — use --cursor ${info.nextCursor}`
  if (info.hasMore && info.page != null) {
    const totalLabel = info.total != null ? ` of ${info.total}` : ""
    return `Showing ${rowCount}${totalLabel} results (page ${info.page}). Use --page ${info.page + 1} for next page.`
  }
  if (info.page != null && info.page > 1) return `Page ${info.page} (last page). ${info.total ?? rowCount} results total.`
  if (rowCount > 0) return `${info.total ?? rowCount} results total.`
  return null
}
