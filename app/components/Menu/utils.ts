import { MenuItem } from "./types"

// Menu separator constant
export const MENU_SEPARATOR = "menu-item-separator" as const

export const isSeparator = (
  item: MenuItem | typeof MENU_SEPARATOR,
): item is typeof MENU_SEPARATOR => {
  return item === MENU_SEPARATOR
}
