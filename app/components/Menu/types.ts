import { PlatformShortcut } from "../../utils/useSystemMenu/types"
import { MENU_SEPARATOR } from "./utils"

export interface Position {
  x: number
  y: number
}

// Generic menu item interface for UI components
export interface MenuItem {
  label: string
  shortcut?: PlatformShortcut
  disabled?: boolean
  action?: () => void
  submenu?: (MenuItem | typeof MENU_SEPARATOR)[]
}

// Type alias for dropdown menu items (same as MenuItem)
export type DropdownMenuItem = MenuItem
