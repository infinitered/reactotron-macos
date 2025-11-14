import { type SystemMenuListEntry } from "./types"
import { MENU_SEPARATOR } from "../../components/Menu/types"

export const PATH_SEPARATOR = " > "

export const parsePathKey = (key: string): string[] =>
  key
    .split(PATH_SEPARATOR)
    .map((s) => s.trim())
    .filter(Boolean)

export const joinPath = (path: string[]): string => path.join(PATH_SEPARATOR)

export const isSeparator = (entry: SystemMenuListEntry): entry is typeof MENU_SEPARATOR =>
  entry === MENU_SEPARATOR

export interface KeyCombination {
  ctrl: boolean
  alt: boolean
  shift: boolean
  cmd: boolean
  key: string
}

/**
 * Parse a shortcut string like "ctrl+shift+n" into a key combination object
 * @param shortcut - Shortcut string (e.g., "ctrl+n", "ctrl+shift+f", "alt+f4")
 * @returns KeyCombination object for matching against keyboard events
 */
export function parseShortcut(shortcut: string): KeyCombination | null {
  if (!shortcut?.trim()) return null

  const parts = shortcut
    .toLowerCase()
    .split("+")
    .map((s) => s.trim())
    .filter(Boolean)
  if (parts.length === 0) return null

  const combination: KeyCombination = { ctrl: false, alt: false, shift: false, cmd: false, key: "" }

  for (const part of parts) {
    switch (part) {
      case "ctrl":
      case "control":
        combination.ctrl = true
        break
      case "alt":
      case "option":
        combination.alt = true
        break
      case "shift":
        combination.shift = true
        break
      case "cmd":
      case "command":
      case "win":
      case "windows":
        combination.cmd = true
        break
      default:
        if (!combination.key) combination.key = part.toUpperCase()
        break
    }
  }

  return combination.key ? combination : null
}

/**
 * Check if a keyboard event matches a key combination
 * @param event - Keyboard event from native keyboard hook
 * @param combination - Parsed key combination to match against
 * @returns true if the event matches the combination
 */
export function matchesKeyCombo(event: any, combination: KeyCombination): boolean {
  if (!event?.modifiers || !combination) return false

  const { modifiers } = event
  return (
    modifiers.ctrl === combination.ctrl &&
    modifiers.alt === combination.alt &&
    modifiers.shift === combination.shift &&
    modifiers.cmd === combination.cmd &&
    event.key?.toUpperCase() === combination.key.toUpperCase()
  )
}
