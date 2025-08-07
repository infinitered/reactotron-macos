import { useEffect, useRef, useCallback, useState } from "react"
import NativeIRMenuItemManager, {
  type MenuItemPressedEvent,
  type MenuStructure,
} from "../../specs/NativeIRMenuItemManager"

export interface MenuItem {
  id: string
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

export function useMenuItem(config: MenuItemConfig) {
  const actionsRef = useRef<Map<string, () => void>>(new Map())
  const previousConfigRef = useRef<MenuItemConfig | null>(null)
  const [availableMenus, setAvailableMenus] = useState<string[]>([])
  const [menuStructure, setMenuStructure] = useState<MenuStructure[]>([])

  const handleMenuItemPressed = useCallback((event: MenuItemPressedEvent) => {
    const action = actionsRef.current.get(event.menuItemId)
    if (action) {
      action()
    }
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

  const createMenu = useCallback(
    async (menuName: string) => {
      try {
        const result = await NativeIRMenuItemManager.createMenu(menuName)
        if (result.success) {
          await discoverMenus()
        }
        return result
      } catch (error) {
        console.error(`Failed to create menu ${menuName}:`, error)
        return { success: false, existed: false, menuName }
      }
    },
    [discoverMenus],
  )

  const addMenuItems = useCallback(async (menuName: string, items: MenuItem[]) => {
    for (const item of items) {
      actionsRef.current.set(item.id, item.action)

      try {
        let result
        if (item.position !== undefined) {
          result = await NativeIRMenuItemManager.insertMenuItem(
            item.id,
            item.label,
            menuName,
            item.position,
          )
        } else if (item.shortcut || item.addSeparatorBefore) {
          result = await NativeIRMenuItemManager.addMenuItemWithOptions(
            item.id,
            item.label,
            menuName,
            item.shortcut,
            item.addSeparatorBefore,
          )
        } else {
          result = await NativeIRMenuItemManager.addMenuItem(item.id, item.label, menuName)
        }

        if (!result.success) {
          console.error(`Failed to add menu item ${item.id} to ${menuName}:`, result.error)
        }

        if (item.enabled !== undefined) {
          await NativeIRMenuItemManager.setMenuItemEnabled(item.id, item.enabled)
        }
      } catch (error) {
        console.error(`Failed to add menu item ${item.id} to ${menuName}:`, error)
      }
    }
  }, [])

  const addMenuItem = useCallback(
    async (menuName: string, item: MenuItem) => {
      actionsRef.current.set(item.id, item.action)
      await addMenuItems(menuName, [item])
    },
    [addMenuItems],
  )

  const removeMenuItems = useCallback(async (items: MenuItem[]) => {
    for (const item of items) {
      try {
        await NativeIRMenuItemManager.removeMenuItemById(item.id)
        actionsRef.current.delete(item.id)
      } catch (error) {
        console.error(`Failed to remove menu item ${item.id}:`, error)
      }
    }
  }, [])

  const removeMenuItemById = useCallback(async (itemId: string) => {
    try {
      await NativeIRMenuItemManager.removeMenuItemById(itemId)
      actionsRef.current.delete(itemId)
    } catch (error) {
      console.error(`Failed to remove menu item ${itemId}:`, error)
    }
  }, [])

  const removeMenuItemByName = useCallback(async (itemName: string) => {
    try {
      await NativeIRMenuItemManager.removeMenuItemByName(itemName)
    } catch (error) {
      console.error(`Failed to remove menu item ${itemName}:`, error)
    }
  }, [])

  const setMenuItemEnabled = useCallback(async (itemId: string, enabled: boolean) => {
    try {
      await NativeIRMenuItemManager.setMenuItemEnabled(itemId, enabled)
    } catch (error) {
      console.error(`Failed to set menu item enabled state for ${itemId}:`, error)
    }
  }, [])

  const getMenuItems = useCallback(async () => {
    try {
      return await NativeIRMenuItemManager.getAllMenuItems()
    } catch (error) {
      console.error("Failed to get menu items:", error)
      return []
    }
  }, [])

  const getItemDifference = useCallback((oldItems: MenuItem[] = [], newItems: MenuItem[] = []) => {
    const oldIds = new Set(oldItems.map((item) => item.id))
    const newIds = new Set(newItems.map((item) => item.id))

    const toAdd = newItems.filter((item) => !oldIds.has(item.id))
    const toRemove = oldItems.filter((item) => !newIds.has(item.id))
    const toUpdate = newItems.filter((item) => {
      if (!oldIds.has(item.id)) return false
      const oldItem = oldItems.find((old) => old.id === item.id)
      return (
        oldItem &&
        (oldItem.label !== item.label ||
          oldItem.enabled !== item.enabled ||
          oldItem.shortcut !== item.shortcut ||
          oldItem.position !== item.position ||
          oldItem.addSeparatorBefore !== item.addSeparatorBefore)
      )
    })

    return { toAdd, toRemove, toUpdate }
  }, [])

  useEffect(() => {
    const updateMenus = async () => {
      const previousConfig = previousConfigRef.current

      for (const [menuName, items] of Object.entries(config.items)) {
        const previousItems = previousConfig?.items[menuName] || []
        const currentItems = items || []

        const { toAdd, toRemove, toUpdate } = getItemDifference(previousItems, currentItems)

        if (!availableMenus.includes(menuName)) {
          await createMenu(menuName)
        }

        if (toAdd.length) {
          await addMenuItems(menuName, toAdd)
        }

        if (toRemove.length) {
          await removeMenuItems(toRemove)
        }

        for (const item of toUpdate) {
          actionsRef.current.set(item.id, item.action)

          if (item.enabled !== undefined) {
            try {
              await NativeIRMenuItemManager.setMenuItemEnabled(item.id, item.enabled)
            } catch (error) {
              console.error(`Failed to update menu item ${item.id}:`, error)
            }
          }
        }
      }
      previousConfigRef.current = config
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
      const allItems = Object.values(config.items).flat()
      removeMenuItems(allItems)
    }
  }, [])

  return {
    availableMenus,
    menuStructure,
    discoverMenus,
    createMenu,
    addMenuItem,
    removeMenuItemByName,
    removeMenuItemById,
    setMenuItemEnabled,
    getMenuItems,
  }
}
