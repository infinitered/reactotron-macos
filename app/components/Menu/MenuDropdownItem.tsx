import { Pressable, Text, View, type ViewStyle, type TextStyle } from "react-native"
import { useState, useRef, memo, useCallback } from "react"
import { themed } from "../../theme/theme"
import { menuSettings } from "./menuSettings"
import type { MenuItem } from "../../utils/useMenuItem"

interface MenuDropdownItemProps {
  item: MenuItem
  index: number
  onItemPress: (item: MenuItem) => void
  onItemHover: (itemLabel: string, index: number, hasSubmenu: boolean) => void
}

const MenuDropdownItemComponent = ({
  item,
  index,
  onItemPress,
  onItemHover,
}: MenuDropdownItemProps) => {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const enabled = item.enabled !== false

  const handleHoverIn = useCallback(() => {
    // Clear any pending hover clear
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
      hoverTimeoutRef.current = null
    }
    setHoveredItem(item.label)
    const hasSubmenu = !!item.submenu
    onItemHover(item.label, index, hasSubmenu)
  }, [item.label, item.submenu, index, onItemHover])

  const handleHoverOut = useCallback(() => {
    // Use a small timeout to prevent flickering between items
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredItem((current) => current === item.label ? null : current)
    }, 10)
  }, [item.label])

  const handlePress = useCallback(() => {
    if (!item.action || !enabled) return
    item.action()
    onItemPress(item)
  }, [item, onItemPress])

  return (
    <Pressable
      onHoverIn={handleHoverIn}
      onHoverOut={handleHoverOut}
      onPress={handlePress}
      disabled={!enabled}
      style={({ pressed }) => [
        $dropdownItem(),
        ((pressed || hoveredItem === item.label) && enabled) && $dropdownItemHovered(),
        !enabled && $dropdownItemDisabled,
      ]}
    >
      <Text
        style={[
          $dropdownItemText(),
          !enabled && $dropdownItemTextDisabled(),
        ]}
      >
        {item.label}
      </Text>
      <View style={$rightContent}>
        {item.shortcut && (
          <Text
            style={[$shortcut(), !enabled && $dropdownItemTextDisabled()]}
          >
            {formatShortcut(item.shortcut)}
          </Text>
        )}
        {item.submenu && (
          <Text
            style={[
              $submenuArrow(),
              !enabled && $dropdownItemTextDisabled(),
            ]}
          >
            ▶
          </Text>
        )}
      </View>
    </Pressable>
  )
}

export const MenuDropdownItem = memo(MenuDropdownItemComponent)

function formatShortcut(shortcut: string): string {
  return shortcut
    .replace(/cmd/gi, "Ctrl")
    .replace(/shift/gi, "Shift")
    .replace(/\+/g, "+")
    .split("+")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("+")
}

const $dropdownItem = themed<ViewStyle>(({ spacing }) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.xs,
  borderRadius: 4,
  minHeight: menuSettings.itemMinHeight,
}))

const $dropdownItemHovered = themed<ViewStyle>(({ colors }) => ({
  backgroundColor: colors.neutralVery,
}))

const $dropdownItemDisabled = {
  opacity: 0.5,
}

const $dropdownItemText = themed<TextStyle>(({ colors, typography }) => ({
  color: colors.mainText,
  fontSize: typography.caption,
}))

const $dropdownItemTextDisabled = themed<TextStyle>((theme) => ({
  color: theme.colors.neutral,
}))

const $shortcut = themed<TextStyle>(({ colors, typography, spacing }) => ({
  color: colors.neutral,
  fontSize: typography.small,
  marginLeft: spacing.md,
}))

const $submenuArrow = themed<TextStyle>(({ colors, typography, spacing }) => ({
  color: colors.neutral,
  fontSize: typography.small,
  marginLeft: spacing.sm,
}))

const $rightContent: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
}