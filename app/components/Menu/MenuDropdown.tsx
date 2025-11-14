import { View, type ViewStyle } from "react-native"
import { useRef, useMemo, memo } from "react"
import { themed } from "../../theme/theme"
import { Portal } from "../Portal"
import { MenuDropdownItem } from "./MenuDropdownItem"
import { useSubmenuState } from "./useSubmenuState"
import { menuSettings } from "./menuSettings"
import { getUUID } from "../../utils/random/getUUID"
import { Separator } from "../Separator"
import { isSeparator, MENU_SEPARATOR } from "./utils"
import type { Position, DropdownMenuItem, MenuItem } from "./types"

interface MenuDropdownProps {
  items: (DropdownMenuItem | typeof MENU_SEPARATOR)[]
  position: Position
  onItemPress: (item: MenuItem) => void
  isSubmenu?: boolean
}

const MenuDropdownComponent = ({ items, position, onItemPress, isSubmenu }: MenuDropdownProps) => {
  const portalName = useRef(`${isSubmenu ? "submenu" : "dropdown"}-${getUUID()}`).current
  const { openSubmenu, submenuPosition, handleItemHover } = useSubmenuState(position)

  // Find the submenu item if one is open
  const submenuItem = openSubmenu
    ? (items.find((item) => !isSeparator(item) && item.label === openSubmenu) as
        | DropdownMenuItem
        | undefined)
    : undefined

  const dropdownContent = useMemo(
    () => (
      <View
        style={[isSubmenu ? $submenuDropdown() : $dropdown(), $menuPosition(position, isSubmenu)]}
        accessibilityRole="menu"
      >
        {items.map((item, index) => {
          if (isSeparator(item)) return <Separator key={`separator-${index}`} />

          return (
            <MenuDropdownItem
              key={item.label}
              item={item as MenuItem}
              index={index}
              onItemPress={onItemPress}
              onItemHover={handleItemHover}
            />
          )
        })}
      </View>
    ),
    [items, isSubmenu, position.x, position.y, onItemPress, handleItemHover],
  )

  return (
    <>
      <Portal name={portalName}>{dropdownContent}</Portal>
      {/* Render submenu */}
      {submenuItem?.submenu && (
        <MenuDropdown
          items={submenuItem.submenu}
          position={submenuPosition}
          onItemPress={onItemPress}
          isSubmenu={true}
        />
      )}
    </>
  )
}

export const MenuDropdown = memo(MenuDropdownComponent)

const $dropdown = themed<ViewStyle>(({ colors, spacing }) => ({
  position: "absolute",
  backgroundColor: colors.cardBackground,
  borderColor: colors.keyline,
  borderWidth: 1,
  borderRadius: 4,
  minWidth: menuSettings.dropdownMinWidth,
  paddingVertical: spacing.xs,
  zIndex: menuSettings.zIndex.dropdown,
}))

const $submenuDropdown = themed<ViewStyle>(({ colors, spacing }) => ({
  position: "absolute",
  backgroundColor: colors.cardBackground,
  borderColor: colors.keyline,
  borderWidth: 1,
  borderRadius: 4,
  minWidth: menuSettings.submenuMinWidth,
  paddingVertical: spacing.xs,
  zIndex: menuSettings.zIndex.submenu,
}))

const $menuPosition = (position: Position, isSubmenu: boolean | undefined) => ({
  left: position.x,
  top: position.y,
  zIndex: isSubmenu ? 10001 : 10000,
})
