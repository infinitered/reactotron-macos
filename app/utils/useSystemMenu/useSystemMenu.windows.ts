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

import { useEffect, useRef, useCallback, useState } from "react"
import { useGlobal } from "../../state/useGlobal"
import {
  SEPARATOR,
  type SystemMenuItem,
  type SystemMenuConfig,
  type SystemMenuListEntry,
  type SystemMenuItemPressedEvent,
  type SystemMenuStructure,
} from "./types"
import { parsePathKey, joinPath, isSeparator } from "./utils"

export function useSystemMenu(config?: SystemMenuConfig) {
  const actionsRef = useRef<Map<string, () => void>>(new Map())

  // Global state for Windows menu persistence across component unmounts
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
    const key = joinPath(event.menuPath)
    const action = actionsRef.current.get(key)
    if (action) action()
  }, [])

  const discoverMenus = useCallback(async () => {
    const configToUse = config || globalMenuConfig
    if (!configToUse?.items || !config || config === globalMenuConfig) return []

    // Create a simple structure from config items for Windows titlebar rendering
    const winStructure: SystemMenuStructure = Object.keys(configToUse.items).map((title) => ({
      title,
      enabled: true,
      path: [title],
      items: [],
      children: [],
    }))

    // Update global state if we have a new config
    setGlobalMenuConfig(config)
    setGlobalMenuStructure(winStructure)
    setGlobalMenuItems(config.items as Record<string, SystemMenuItem[]>)

    return [] // Windows doesn't have native menu discovery
  }, [config, globalMenuConfig, setGlobalMenuConfig, setGlobalMenuStructure, setGlobalMenuItems])

  const addMenuItem = useCallback(
    async (parentKey: string, item: SystemMenuItem) => {
      const leafPath = [parentKey, item.label]
      const actionKey = joinPath(leafPath)

      // Store action in memory for execution when menu item is pressed
      if (item.action) {
        actionsRef.current.set(actionKey, item.action)
      }

      // Add item to global state for UI rendering
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
      const key = joinPath(path)
      // Remove action from memory
      actionsRef.current.delete(key)

      // Remove from global state based on path depth
      if (path.length === 1) {
        // Remove entire top-level menu
        setGlobalMenuItems((prev) => {
          const updated = { ...prev }
          delete updated[path[0]]
          return updated
        })
      } else if (path.length === 2) {
        // Remove specific menu item
        const [parentKey, itemLabel] = path
        setGlobalMenuItems((prev) => ({
          ...prev,
          [parentKey]: (prev[parentKey] || []).filter((item) => item.label !== itemLabel),
        }))
      }
    },
    [setGlobalMenuItems],
  )

  const setMenuItemEnabled = useCallback(
    async (pathOrKey: string | string[], enabled: boolean) => {
      const path = Array.isArray(pathOrKey) ? pathOrKey : parsePathKey(pathOrKey)

      // Update enabled state in global state (Windows only supports in-memory state updates)
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
    const paths: string[] = []
    for (const [parentKey, entries] of Object.entries(globalMenuItems)) {
      for (const entry of entries) {
        if (!isSeparator(entry)) {
          paths.push(joinPath([parentKey, entry.label]))
        }
      }
    }
    return paths
  }, [globalMenuItems])

  // Update menus when config changes
  useEffect(() => {
    const updateMenus = async () => {
      if (!config) return

      if (config.items) {
        // Store actions in memory for execution
        for (const [parentKey, entries] of Object.entries(config.items)) {
          for (const entry of entries) {
            if (!isSeparator(entry)) {
              const item = entry as SystemMenuItem
              const leafPath = [parentKey, item.label]
              if (item.action) {
                actionsRef.current.set(joinPath(leafPath), item.action)
              }
            }
          }
        }
        // Update global state for UI persistence
        setGlobalMenuConfig(config)
        setGlobalMenuItems(config.items as Record<string, SystemMenuItem[]>)
      }
      await discoverMenus()
    }

    updateMenus()
  }, [config, setGlobalMenuConfig, setGlobalMenuItems, discoverMenus])

  // Restore actions from global state when no config is provided (component remount)
  useEffect(() => {
    if (!config && globalMenuConfig?.items) {
      // Restore actions from persisted global config
      for (const [parentKey, entries] of Object.entries(globalMenuConfig.items)) {
        for (const entry of entries) {
          if (!isSeparator(entry)) {
            const item = entry as SystemMenuItem
            const leafPath = [parentKey, item.label]
            if (item.action) {
              actionsRef.current.set(joinPath(leafPath), item.action)
            }
          }
        }
      }
    }
  }, [config, globalMenuConfig])

  useEffect(() => {
    discoverMenus()
  }, [discoverMenus])

  return {
    availableMenus: [], // Windows doesn't have native menu discovery
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