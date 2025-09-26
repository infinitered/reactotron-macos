import { useState, useCallback } from "react"
import { menuSettings } from "./menuSettings"
import { type Position } from "./types"

export const useSubmenuState = (basePosition: Position) => {
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null)
  const [submenuPosition, setSubmenuPosition] = useState<Position>({ x: 0, y: 0 })

  const openSubmenuAt = useCallback((itemLabel: string, index: number) => {
    setOpenSubmenu(itemLabel)
    setSubmenuPosition({
      x: basePosition.x + menuSettings.submenuOffsetX,
      y: basePosition.y + index * menuSettings.itemHeight + menuSettings.submenuOffsetY,
    })
  }, [basePosition.x, basePosition.y])

  const closeSubmenu = useCallback(() => {
    setOpenSubmenu(null)
  }, [])

  const handleItemHover = useCallback((itemLabel: string, index: number, hasSubmenu: boolean) => {
    if (hasSubmenu) {
      openSubmenuAt(itemLabel, index)
    } else {
      if (openSubmenu) {
        closeSubmenu()
      }
    }
  }, [openSubmenu, openSubmenuAt, closeSubmenu])

  return {
    openSubmenu,
    submenuPosition,
    handleItemHover,
    closeSubmenu,
  }
}