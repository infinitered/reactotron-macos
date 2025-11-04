import { createContext, useContext, useCallback } from "react"
import { useGlobal } from "../state/useGlobal"
import { useKeyboardEvents } from "../utils/system"
import { parseShortcut, matchesKeyCombo, type KeyCombination } from "../utils/useSystemMenu/utils"

// Global state for shortcuts - shared across all instances
type ShortcutRegistry = Record<string, () => void>
type ShortcutCombinations = Record<string, KeyCombination>

interface ShortcutsContextType {
  registerShortcut: (shortcut: string, action: () => void) => void
  unregisterShortcut: (shortcut: string) => void
  clearAllShortcuts: () => void
}

const ShortcutsContext = createContext<ShortcutsContextType | null>(null)

export function ShortcutsProvider({ children }: { children: React.ReactNode }) {
  const [shortcuts, setShortcuts] = useGlobal<ShortcutRegistry>("global-shortcuts", {})
  const [combinations, setCombinations] = useGlobal<ShortcutCombinations>(
    "global-shortcut-combinations",
    {},
  )

  const registerShortcut = useCallback(
    (shortcut: string, action: () => void) => {
      if (!shortcut || !action) return

      const combination = parseShortcut(shortcut)
      if (!combination) {
        console.warn(`Invalid shortcut format: ${shortcut}`)
        return
      }

      // Register globally (will overwrite if already exists - automatic deduplication!)
      setShortcuts((prev) => ({ ...prev, [shortcut]: action }))
      setCombinations((prev) => ({ ...prev, [shortcut]: combination }))
    },
    [setShortcuts, setCombinations],
  )

  const unregisterShortcut = useCallback(
    (shortcut: string) => {
      setShortcuts((prev) => {
        const { [shortcut]: _, ...rest } = prev
        return rest
      })
      setCombinations((prev) => {
        const { [shortcut]: _, ...rest } = prev
        return rest
      })
    },
    [setShortcuts, setCombinations],
  )

  const clearAllShortcuts = useCallback(() => {
    setShortcuts({})
    setCombinations({})
  }, [setShortcuts, setCombinations])

  const handleKeyboardEvent = useCallback(
    (event: any) => {
      // Only handle keydown events
      if (event.type !== "keydown") return

      // Check all registered shortcuts for a match
      for (const [shortcut, combination] of Object.entries(combinations)) {
        if (matchesKeyCombo(event, combination)) {
          const action = shortcuts[shortcut]
          if (action) {
            action()
            return // Stop after first match
          }
        }
      }
    },
    [shortcuts, combinations],
  )

  // Set up the global keyboard listener
  useKeyboardEvents(handleKeyboardEvent, [handleKeyboardEvent])

  return (
    <ShortcutsContext.Provider value={{ registerShortcut, unregisterShortcut, clearAllShortcuts }}>
      {children}
    </ShortcutsContext.Provider>
  )
}

export function useShortcuts() {
  const context = useContext(ShortcutsContext)
  if (!context) {
    throw new Error("useShortcuts must be used within a ShortcutsProvider")
  }
  return context
}
