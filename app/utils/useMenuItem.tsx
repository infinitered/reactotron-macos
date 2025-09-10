/*
 * macOS Menu Management
 *
 * Add, delete, and update macOS menu items using either a declarative config
 * or imperative hook calls.
 *
 * ──────────────────────────────
 * Declarative Usage (via config)
 * ──────────────────────────────
 *
 * const menuConfig = {
 *   items: {
 *     "Custom Menu": [
 *       {
 *         label: "Menu Item",
 *         action: () => console.log("This is a menu item."),
 *       },
 *       SEPARATOR,
 *       {
 *         label: "Disabled Item",
 *         enabled: false,
 *         action: () => console.log("Disabled item, you shouldn't see this."),
 *       },
 *     ],
 *     "View": [
 *       {
 *         label: "Inserted Menu Item",
 *         shortcut: "cmd+shift+f",
 *         action: () => console.log("This is an inserted menu item."),
 *       },
 *     ],
 *   },
 *   remove: ["Window", "Edit > Find", "Edit > Speech"],
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
 *   getAllMenuPaths
 * } = useMenuItem()
 *
 * useEffect(() => {
 *   removeMenuItemByName("Format")
 *   getAllMenuPaths().then(paths => console.log({ paths }))
 * }, [removeMenuItemByName, getAllMenuPaths])
 */

import { useEffect, useRef, useCallback, useState } from "react"
import NativeIRMenuItemManager, {
  type MenuItemPressedEvent,
  type MenuStructure,
  type MenuListEntry,
  SEPARATOR,
} from "../native/IRMenuItemManager/NativeIRMenuItemManager"
import { Platform } from "react-native"

// Only thing to configure here is the path separator.
const PATH_SEPARATOR = " > "

export { SEPARATOR } // Menu separator

export interface MenuItem {
  label: string
  shortcut?: string
  enabled?: boolean
  position?: number
  action: () => void
}

export interface MenuItemConfig {
  items?: Record<string, MenuListEntry[]>
  remove?: string[]
}

const parsePathKey = (key: string): string[] =>
  key
    .split(PATH_SEPARATOR)
    .map((s) => s.trim())
    .filter(Boolean)

const joinPath = (p: string[]) => p.join(PATH_SEPARATOR)

const isSeparator = (e: MenuListEntry): e is typeof SEPARATOR => e === SEPARATOR

export function useMenuItem(config?: MenuItemConfig) {
  const actionsRef = useRef<Map<string, () => void>>(new Map())
  const previousConfigRef = useRef<MenuItemConfig | null>(null)
  const [availableMenus, setAvailableMenus] = useState<string[]>([])
  const [menuStructure, setMenuStructure] = useState<MenuStructure>([])

  const handleMenuItemPressed = useCallback((event: MenuItemPressedEvent) => {
    const key = joinPath(event.menuPath)
    const action = actionsRef.current.get(key)
    if (action) action()
  }, [])

  const discoverMenus = useCallback(async () => {
    try {
      const menus = NativeIRMenuItemManager.getAvailableMenus()
      const structure = NativeIRMenuItemManager.getMenuStructure()
      setAvailableMenus(menus)
      setMenuStructure(structure)
      return menus
    } catch (error) {
      console.error("Failed to discover menus:", error)
      return []
    }
  }, [])

  const addEntries = useCallback(async (parentKey: string, entries: MenuListEntry[]) => {
    const parentPath = parsePathKey(parentKey)

    try {
      await NativeIRMenuItemManager.removeMenuItemAtPath([...parentPath, SEPARATOR])
    } catch (e) {
      console.warn(`Failed to clear separators for "${parentKey}":`, e)
    }

    for (const entry of entries) {
      if (isSeparator(entry)) {
        try {
          await NativeIRMenuItemManager.addMenuItemAtPath(parentPath, SEPARATOR, "")
        } catch (e) {
          console.error(`Failed to add separator under "${parentKey}":`, e)
        }
        continue
      }

      const item = entry as MenuItem
      const leafPath = [...parentPath, item.label]
      const actionKey = joinPath(leafPath)
      actionsRef.current.set(actionKey, item.action)

      try {
        if (typeof item.position === "number") {
          await NativeIRMenuItemManager.insertMenuItemAtPath(
            parentPath,
            item.label,
            item.position,
            item.shortcut ?? "",
          )
        } else {
          await NativeIRMenuItemManager.addMenuItemAtPath(
            parentPath,
            item.label,
            item.shortcut ?? "",
          )
        }

        if (item.enabled !== undefined) {
          await NativeIRMenuItemManager.setMenuItemEnabledAtPath(leafPath, item.enabled)
        }
      } catch (error) {
        console.error(`Failed to add "${item.label}" under "${parentKey}":`, error)
      }
    }
  }, [])

  const removeMenuItems = useCallback(async (parentKey: string, items: MenuItem[]) => {
    const parentPath = parsePathKey(parentKey)
    for (const item of items) {
      const leafPath = [...parentPath, item.label]
      try {
        await NativeIRMenuItemManager.removeMenuItemAtPath(leafPath)
      } catch (error) {
        console.error(`Failed to remove menu item ${joinPath(leafPath)}:`, error)
      } finally {
        actionsRef.current.delete(joinPath(leafPath))
      }
    }
  }, [])

  const removeMenuItemByName = useCallback(async (nameOrPath: string) => {
    const path = parsePathKey(nameOrPath)
    try {
      await NativeIRMenuItemManager.removeMenuItemAtPath(path)
      actionsRef.current.delete(joinPath(path))
    } catch (error) {
      console.error(`Failed to remove menu item/menu ${nameOrPath}:`, error)
    }
  }, [])

  const setMenuItemEnabled = useCallback(async (pathOrKey: string | string[], enabled: boolean) => {
    const path = Array.isArray(pathOrKey) ? pathOrKey : parsePathKey(pathOrKey)
    try {
      await NativeIRMenuItemManager.setMenuItemEnabledAtPath(path, enabled)
    } catch (error) {
      console.error(`Failed to set enabled for ${joinPath(path)}:`, error)
    }
  }, [])

  const getAllMenuPaths = useCallback(async (): Promise<string[]> => {
    try {
      const structure = NativeIRMenuItemManager.getMenuStructure()
      const out: string[] = []
      const walk = (nodes?: any[]) => {
        if (!nodes) return
        for (const n of nodes) {
          if (Array.isArray(n.path)) out.push(joinPath(n.path))
          if (Array.isArray(n.children)) walk(n.children)
        }
      }
      for (const top of structure) walk(top.items)
      return out
    } catch (error) {
      console.error("Failed to get menu items:", error)
      return []
    }
  }, [])

  const getItemDifference = useCallback(
    (oldEntries: MenuListEntry[] = [], newEntries: MenuListEntry[] = []) => {
      const oldItems = oldEntries.filter((e): e is MenuItem => !isSeparator(e))
      const newItems = newEntries.filter((e): e is MenuItem => !isSeparator(e))

      const byLabel = (xs: MenuItem[]) => new Map(xs.map((x) => [x.label, x]))
      const oldMap = byLabel(oldItems)
      const newMap = byLabel(newItems)

      const toRemove: MenuItem[] = []
      const toUpdate: MenuItem[] = []

      for (const [label, item] of newMap) {
        if (oldMap.has(label)) {
          const prev = oldMap.get(label)!
          if (
            prev.enabled !== item.enabled ||
            prev.shortcut !== item.shortcut ||
            prev.position !== item.position
          ) {
            toUpdate.push(item)
          }
        }
      }
      for (const [label, item] of oldMap) {
        if (!newMap.has(label)) toRemove.push(item)
      }
      return { toRemove, toUpdate }
    },
    [],
  )

  useEffect(() => {
    const updateMenus = async () => {
      if (!config) return

      const previousConfig = previousConfigRef.current

      if (config.remove?.length) {
        for (const entry of config.remove) {
          await removeMenuItemByName(entry)
        }
      }

      if (config.items) {
        for (const [parentKey, entries] of Object.entries(config.items)) {
          const previousEntries = previousConfig?.items?.[parentKey] || []
          const { toRemove, toUpdate } = getItemDifference(previousEntries, entries)

          if (toRemove.length) await removeMenuItems(parentKey, toRemove)

          await addEntries(parentKey, entries)

          for (const item of toUpdate) {
            const leafPath = [...parsePathKey(parentKey), item.label]
            actionsRef.current.set(joinPath(leafPath), item.action)
            if (item.enabled !== undefined) {
              try {
                await NativeIRMenuItemManager.setMenuItemEnabledAtPath(leafPath, item.enabled)
              } catch (e) {
                console.error(`Failed to update ${joinPath(leafPath)}:`, e)
              }
            }
          }
        }
      }

      previousConfigRef.current = config
      await discoverMenus()
    }

    updateMenus()
  }, [config, addEntries, removeMenuItems, getItemDifference])

  useEffect(() => {
    if (Platform.OS === "windows") return
    const subscription = NativeIRMenuItemManager.onMenuItemPressed(handleMenuItemPressed)
    discoverMenus()
    return () => {
      subscription.remove()
    }
  }, [handleMenuItemPressed, discoverMenus])

  // Clean up old menu items
  useEffect(() => {
    return () => {
      if (!previousConfigRef.current || !config || !config.items) {
        return
      }
      const pairs = Object.entries(previousConfigRef.current.items ?? config.items)
      const cleanup = async () => {
        for (const [parentKey, entries] of pairs) {
          const itemsOnly = entries.filter((e): e is MenuItem => !isSeparator(e))
          await removeMenuItems(parentKey, itemsOnly)
          await NativeIRMenuItemManager.removeMenuItemAtPath([
            ...parsePathKey(parentKey),
            SEPARATOR,
          ])
          const parentPath = parsePathKey(parentKey)
          if (parentPath.length === 1) {
            const top = parentPath[0]
            const structure = NativeIRMenuItemManager.getMenuStructure()
            const entry = structure.find(
              (e) => e.title.localeCompare(top, undefined, { sensitivity: "accent" }) === 0,
            )
            if (!entry || !entry.items || entry.items.length === 0) {
              try {
                await NativeIRMenuItemManager.removeMenuItemAtPath([top])
              } catch (e) {
                console.warn(`Couldn't remove top-level menu "${top}":`, e)
              }
            }
          }
        }
      }
      cleanup()
    }
  }, [])

  const addMenuItem = useCallback(
    async (parentKey: string, item: MenuItem) => {
      await addEntries(parentKey, [item])
    },
    [addEntries],
  )

  return {
    availableMenus,
    menuStructure,
    discoverMenus,
    addMenuItem,
    removeMenuItemByName,
    setMenuItemEnabled,
    getAllMenuPaths,
  }
}
