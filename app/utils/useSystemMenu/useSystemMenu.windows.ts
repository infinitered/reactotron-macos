/*
 * Windows Menu Management (Global State Facade)
 *
 * Add, delete, and update Windows menu items using global state persistence.
 * This implementation provides a facade over global state since Windows doesn't
 * have native menu management APIs like macOS.
 *
 * ──────────────────────────────
 * Declarative Usage (via config)
 * ──────────────────────────────
 *
 * const menuConfig = {
 *   items: {
 *     "File": [
 *       {
 *         label: "New Project",
 *         shortcut: "ctrl+n",
 *         action: () => console.log("New project created"),
 *       },
 *       SEPARATOR,
 *       {
 *         label: "Save",
 *         enabled: false,
 *         action: () => console.log("Save action"),
 *       },
 *     ],
 *     "View": [
 *       {
 *         label: "Toggle Sidebar",
 *         shortcut: "ctrl+b",
 *         action: () => console.log("Sidebar toggled"),
 *       },
 *     ],
 *   },
 *   remove: ["Help", "Format"],
 * }
 *
 * ───────────────────────────
 * Imperative Usage (via hook)
 * ───────────────────────────
 *
 * const {
 *   addMenuItem,
 *   removeMenuItemByName,
 *   setMenuItemEnabled,
 *   getAllMenuPaths,
 *   menuItems,
 *   menuStructure
 * } = useSystemMenu()
 *
 * useEffect(() => {
 *   addMenuItem("Tools", {
 *     label: "Clear Cache",
 *     action: () => console.log("Cache cleared")
 *   })
 *   getAllMenuPaths().then(paths => console.log({ paths }))
 * }, [addMenuItem, getAllMenuPaths])
 *
 * // Note: Windows implementation stores menu state globally for persistence
 * // across component unmounts. Actions are stored in actionsRef for execution.
 */

import { useEffect, useRef, useCallback } from "react"
import { useGlobal } from "../../state/useGlobal"
import { useShortcuts } from "../../contexts/ShortcutsContext"
import {
  type SystemMenuItem,
  type SystemMenuConfig,
  type SystemMenuItemPressedEvent,
  type SystemMenuStructure,
} from "./types"
import { parsePathKey, joinPath, isSeparator } from "./utils"

export function useSystemMenu(config?: SystemMenuConfig) {
  const actionsRef = useRef<Map<string, () => void>>(new Map())
  const { registerShortcut, clearAllShortcuts } = useShortcuts()

  const [globalMenuConfig, setGlobalMenuConfig] = useGlobal<SystemMenuConfig | null>(
    "windows-menu-config",
    null,
  )
  const [globalMenuStructure, setGlobalMenuStructure] = useGlobal<SystemMenuStructure>(
    "windows-menu-structure",
    [],
  )
  const [globalMenuItems, setGlobalMenuItems] = useGlobal<Record<string, SystemMenuItem[]>>(
    "windows-menu-items",
    {},
  )

  const handleMenuItemPressed = useCallback((event: SystemMenuItemPressedEvent) => {
    const action = actionsRef.current.get(joinPath(event.menuPath))
    if (action) action()
  }, [])

  const discoverMenus = useCallback(async () => {
    if (!config?.items || config === globalMenuConfig) return []

    const menuStructure: SystemMenuStructure = Object.keys(config.items).map((title) => ({
      title,
      enabled: true,
      path: [title],
      items: [],
      children: [],
    }))

    setGlobalMenuConfig(config)
    setGlobalMenuStructure(menuStructure)
    setGlobalMenuItems(config.items as Record<string, SystemMenuItem[]>)

    return []
  }, [config, globalMenuConfig, setGlobalMenuConfig, setGlobalMenuStructure, setGlobalMenuItems])

  const addMenuItem = useCallback(
    async (parentKey: string, item: SystemMenuItem) => {
      const actionKey = joinPath([parentKey, item.label])

      if (item.action) {
        actionsRef.current.set(actionKey, item.action)
      }

      setGlobalMenuItems((prev) => ({
        ...prev,
        [parentKey]: [...(prev[parentKey] || []), item],
      }))
    },
    [setGlobalMenuItems],
  )

  const removeMenuItemByName = useCallback(
    async (nameOrPath: string) => {
      const path = parsePathKey(nameOrPath)
      actionsRef.current.delete(joinPath(path))

      if (path.length === 1) {
        // Remove entire top-level menu
        setGlobalMenuItems((prev) => {
          const { [path[0]]: _, ...rest } = prev
          return rest
        })
      } else if (path.length === 2) {
        const [parentKey, itemLabel] = path
        setGlobalMenuItems((prev) => ({
          ...prev,
          [parentKey]: (prev[parentKey] || []).filter((item) => item.label !== itemLabel),
        }))
      }
    },
    [setGlobalMenuItems, globalMenuItems],
  )

  const setMenuItemEnabled = useCallback(
    async (pathOrKey: string | string[], enabled: boolean) => {
      const path = Array.isArray(pathOrKey) ? pathOrKey : parsePathKey(pathOrKey)

      if (path.length >= 2) {
        const [parentKey, itemLabel] = path
        setGlobalMenuItems((prev) => ({
          ...prev,
          [parentKey]: (prev[parentKey] || []).map((item) =>
            item.label === itemLabel ? { ...item, enabled } : item,
          ),
        }))
      }
    },
    [setGlobalMenuItems],
  )

  const getAllMenuPaths = useCallback(async (): Promise<string[]> => {
    return Object.entries(globalMenuItems).flatMap(([parentKey, entries]) =>
      entries
        .filter((entry) => !isSeparator(entry))
        .map((entry) => joinPath([parentKey, entry.label])),
    )
  }, [globalMenuItems])

  useEffect(() => {
    if (!config?.items) return

    // Clear all existing actions and shortcuts first (only on initial mount)
    actionsRef.current.clear()
    clearAllShortcuts()

    Object.entries(config.items).forEach(([parentKey, entries]) => {
      entries.forEach((entry) => {
        if (!isSeparator(entry)) {
          const item = entry as SystemMenuItem
          if (item.action) {
            actionsRef.current.set(joinPath([parentKey, item.label]), item.action)
            // Register shortcut if present
            if (item.shortcut) {
              const resolvedShortcut =
                typeof item.shortcut === "object" ? item.shortcut.windows : item.shortcut
              if (resolvedShortcut) {
                registerShortcut(resolvedShortcut, item.action)
              }
            }
          }
        }
      })
    })

    // Update global state directly without calling discoverMenus to avoid redundancy
    const menuStructure: SystemMenuStructure = Object.keys(config.items).map((title) => ({
      title,
      enabled: true,
      path: [title],
      items: [],
      children: [],
    }))

    setGlobalMenuConfig(config)
    setGlobalMenuStructure(menuStructure)
    setGlobalMenuItems(config.items as Record<string, SystemMenuItem[]>)
  }, [])

  return {
    availableMenus: [],
    menuStructure: globalMenuStructure,
    menuItems: globalMenuItems,
    discoverMenus,
    addMenuItem,
    removeMenuItemByName,
    setMenuItemEnabled,
    getAllMenuPaths,
    handleMenuItemPressed,
  }
}
