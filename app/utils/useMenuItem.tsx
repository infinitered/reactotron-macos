import { useEffect, useRef, useCallback, useState } from "react"
import NativeIRMenuItemManager, {
  type MenuItemPressedEvent,
  type MenuStructure,
} from "../../specs/NativeIRMenuItemManager"

export interface MenuItem {
  label: string
  shortcut?: string
  enabled?: boolean
  position?: number
  addSeparatorBefore?: boolean
  action: () => void
}

export interface MenuItemConfig {
  items: Record<string, MenuItem[]>
}

const parsePathKey = (key: string): string[] =>
  key
    .split(">")
    .map((s) => s.trim())
    .filter(Boolean)

const joinPath = (p: string[]) => p.join(" > ")

export function useMenuItem(config: MenuItemConfig) {
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

  const addMenuItems = useCallback(async (parentKey: string, items: MenuItem[]) => {
    const parentPath = parsePathKey(parentKey)

    for (const item of items) {
      const leafPath = [...parentPath, item.label]
      const actionKey = joinPath(leafPath)
      actionsRef.current.set(actionKey, item.action)

      try {
        if (typeof item.position === "number") {
          await NativeIRMenuItemManager.insertMenuItemAtPath(
            parentPath,
            item.label,
            item.position,
            item.shortcut,
            !!item.addSeparatorBefore,
          )
        } else {
          await NativeIRMenuItemManager.addMenuItemAtPath(
            parentPath,
            item.label,
            item.shortcut,
            !!item.addSeparatorBefore,
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

  const addMenuItem = useCallback(
    async (parentKey: string, item: MenuItem) => {
      await addMenuItems(parentKey, [item])
    },
    [addMenuItems],
  )

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

  const getItemDifference = useCallback((oldItems: MenuItem[] = [], newItems: MenuItem[] = []) => {
    const byLabel = (xs: MenuItem[]) => new Map(xs.map((x) => [x.label, x]))
    const oldMap = byLabel(oldItems)
    const newMap = byLabel(newItems)

    const toAdd: MenuItem[] = []
    const toRemove: MenuItem[] = []
    const toUpdate: MenuItem[] = []

    for (const [label, item] of newMap) {
      if (!oldMap.has(label)) toAdd.push(item)
      else {
        const prev = oldMap.get(label)!
        if (
          prev.enabled !== item.enabled ||
          prev.shortcut !== item.shortcut ||
          prev.position !== item.position ||
          prev.addSeparatorBefore !== item.addSeparatorBefore
        ) {
          toUpdate.push(item)
        }
      }
    }
    for (const [label, item] of oldMap) {
      if (!newMap.has(label)) toRemove.push(item)
    }
    return { toAdd, toRemove, toUpdate }
  }, [])

  useEffect(() => {
    const updateMenus = async () => {
      const previousConfig = previousConfigRef.current

      for (const [parentKey, items] of Object.entries(config.items)) {
        const previousItems = previousConfig?.items[parentKey] || []
        const currentItems = items || []

        const { toAdd, toRemove, toUpdate } = getItemDifference(previousItems, currentItems)

        if (toAdd.length) await addMenuItems(parentKey, toAdd)
        if (toRemove.length) await removeMenuItems(parentKey, toRemove)

        for (const item of toUpdate) {
          const leafKey = joinPath([...parsePathKey(parentKey), item.label])
          actionsRef.current.set(leafKey, item.action)
          if (item.enabled !== undefined) {
            try {
              await NativeIRMenuItemManager.setMenuItemEnabledAtPath(
                parsePathKey(leafKey),
                item.enabled,
              )
            } catch (error) {
              console.error(`Failed to update ${leafKey}:`, error)
            }
          }
        }
      }

      previousConfigRef.current = config
      await discoverMenus()
    }

    updateMenus()
  }, [config, addMenuItems, removeMenuItems, getItemDifference])

  useEffect(() => {
    const subscription = NativeIRMenuItemManager.onMenuItemPressed(handleMenuItemPressed)
    discoverMenus()

    return () => {
      subscription.remove()
    }
  }, [handleMenuItemPressed, discoverMenus])

  useEffect(() => {
    return () => {
      const pairs = Object.entries(previousConfigRef.current?.items ?? config.items)
      const removeAllItems = async () => {
        for (const [parentKey, items] of pairs) {
          await removeMenuItems(parentKey, items)
        }
      }
      removeAllItems()
    }
  }, [])

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
