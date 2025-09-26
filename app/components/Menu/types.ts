export interface Position {
  x: number
  y: number
}

// Generic menu item interface for UI components
export interface MenuItem {
  label: string
  shortcut?: string
  enabled?: boolean
  action?: () => void
  submenu?: (MenuItem | typeof MENU_SEPARATOR)[]
}

// Type alias for dropdown menu items (same as MenuItem)
export type DropdownMenuItem = MenuItem

// Menu separator constant
export const MENU_SEPARATOR = 'menu-item-separator' as const