import { View, type ViewStyle, type TextStyle } from "react-native"
import { useRef, useMemo, memo } from "react"
import { themed } from "../../theme/theme"
import { Portal } from "../Portal"
import { MenuDropdownItem } from "./MenuDropdownItem"
import { useSubmenuState } from "./useSubmenuState"
import { menuSettings } from "./menuSettings"
import { type Position, type DropdownMenuItem, type MenuItem, MENU_SEPARATOR } from "./types"
import { getUUID } from "../../utils/random/getUUID"
import { Separator } from "../Separator"

interface MenuDropdownProps {
  items: (DropdownMenuItem | typeof MENU_SEPARATOR)[]
  position: Position
  onItemPress: (item: MenuItem) => void
  isSubmenu?: boolean
}

const MenuDropdownComponent = ({
  items,
  position,
  onItemPress,
  isSubmenu,
}: MenuDropdownProps) => {
  const portalName = useRef(
    `${isSubmenu ? 'submenu' : 'dropdown'}-${getUUID()}`
  ).current
  const { openSubmenu, submenuPosition, handleItemHover } = useSubmenuState(position)

  const isSeparator = (item: MenuItem | typeof MENU_SEPARATOR): item is typeof MENU_SEPARATOR => {
    return item === MENU_SEPARATOR
  }

  // Find the submenu item if one is open
  const submenuItem = openSubmenu
    ? items.find(item => !isSeparator(item) && item.label === openSubmenu) as DropdownMenuItem | undefined
    : undefined

  const dropdownContent = useMemo(() => (
    <View
      style={[
        isSubmenu ? $submenuDropdown() : $dropdown(),
        { left: position.x, top: position.y, zIndex: isSubmenu ? 10001 : 10000 }
      ]}
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
  ), [items, isSubmenu, position.x, position.y, onItemPress, handleItemHover])

  return (
    <>
      <Portal name={portalName}>
        {dropdownContent}
      </Portal>
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


