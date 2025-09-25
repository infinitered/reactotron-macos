export interface Position {
  x: number
  y: number
}

export interface MenuItemWithSubmenu {
  label: string
  shortcut?: string
  enabled?: boolean
  position?: number
  action?: () => void
  submenu?: (MenuItemWithSubmenu | 'menu-item-separator')[]
}