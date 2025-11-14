import { MenuItem, MENU_SEPARATOR } from "./types"

export const isSeparator = (
  item: MenuItem | typeof MENU_SEPARATOR,
): item is typeof MENU_SEPARATOR => {
  return item === MENU_SEPARATOR
}
