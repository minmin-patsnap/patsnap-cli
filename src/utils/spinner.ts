import yoctoSpinner from "yocto-spinner"
import { isJsonMode } from "./output.js"

export interface Spinner {
  start(): Spinner
  stop(): Spinner
  success(text?: string): Spinner
  error(text?: string): Spinner
}

const noopSpinner: Spinner = {
  start: () => noopSpinner,
  stop: () => noopSpinner,
  success: () => noopSpinner,
  error: () => noopSpinner,
}

export function createSpinner(text: string, options?: { color?: string }): Spinner {
  if (isJsonMode()) return noopSpinner
  return yoctoSpinner({
    text,
    ...(options?.color ? { color: options.color } : {}),
  } as Parameters<typeof yoctoSpinner>[0]).start()
}
