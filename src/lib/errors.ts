import type { AxiosError } from "axios"

export function fatal(message: string): never {
  console.error(message)
  process.exit(1)
}

export function createError(error: unknown, context: string): Error {
  if (isAxiosError(error)) {
    const status = error.response?.status
    const data = error.response?.data as Record<string, unknown> | undefined
    const msg = (data?.message as string) ?? error.message
    if (status === 401) {
      return new Error(`Authentication failed: ${msg}\nRun "patsnap login" to re-authenticate.`)
    }
    if (status === 403) {
      return new Error(`Permission denied: ${msg}`)
    }
    return new Error(`${context}: ${msg}`)
  }
  if (error instanceof Error) return error
  return new Error(String(error))
}

function isAxiosError(error: unknown): error is AxiosError {
  return (
    typeof error === "object" &&
    error !== null &&
    (error as AxiosError).isAxiosError === true
  )
}
