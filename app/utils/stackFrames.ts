import type { ErrorStackFrame } from "../types"

/**
 * Type guard to check if stack is an array of ErrorStackFrame objects
 */
export function isErrorStackFrameArray(stack: any): stack is ErrorStackFrame[] {
  if (!Array.isArray(stack)) return false
  if (stack.length === 0) return false

  const firstItem = stack[0]
  return (
    typeof firstItem === "object" &&
    firstItem !== null &&
    "fileName" in firstItem &&
    "lineNumber" in firstItem
  )
}

/**
 * Formats a file name to show just the file name or the last few path segments
 */
export function formatFileName(fileName: string, segmentCount: number = 3): string {
  if (!fileName) return ""

  // Remove webpack:// prefix if present
  const cleanedFileName = fileName.replace("webpack://", "")

  const segments = cleanedFileName.split("/")
  const lastSlashIndex = cleanedFileName.lastIndexOf("/")

  // If it's just a filename with no path, return as-is
  if (lastSlashIndex === -1) return cleanedFileName

  // Return the last N segments
  const shortPath = segments.slice(-segmentCount).join("/")
  return shortPath
}

/**
 * Checks if a file path is from node_modules
 */
export function isNodeModule(fileName: string): boolean {
  if (!fileName) return false
  return fileName.includes("/node_modules/")
}

/**
 * Gets just the filename from a full path
 */
export function getJustFileName(fileName: string): string {
  if (!fileName) return ""
  const lastSlashIndex = fileName.lastIndexOf("/")
  return lastSlashIndex > -1 ? fileName.substr(lastSlashIndex + 1) : fileName
}
