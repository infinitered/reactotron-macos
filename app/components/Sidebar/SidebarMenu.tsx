import React from "react"
import { Animated, View, ViewStyle, Pressable, TextStyle } from "react-native"
import { useTheme, useThemeName, withTheme } from "../../theme/theme"
import { useGlobal } from "../../state/useGlobal"
import { Icon } from "../Icon"

const MENU_ITEMS = [
  { id: "logs", label: "Logs", icon: "scrollText" },
  { id: "network", label: "Network", icon: "chevronsLeftRightEllipsis" },
  { id: "performance", label: "Performance", icon: "circleGauge" },
  { id: "plugins", label: "Plugins", icon: "plug" },
] as const

type MenuItemId = (typeof MENU_ITEMS)[number]["id"]

interface SidebarMenuProps {
  progress: Animated.Value
  mounted: boolean
  collapsedWidth: number
}

export const SidebarMenu = ({ progress, mounted, collapsedWidth }: SidebarMenuProps) => {
  const [themeName] = useThemeName()
  const theme = useTheme(themeName)

  const [activeItem, setActiveItem] = useGlobal<MenuItemId>("sidebar-active-item", "logs", {
    persist: true,
  })

  const labelOpacity = progress // fade out the label when collapsed

  /**
   * Fixed icon column:
   * - equals the collapsed rail's *inner* width (rail - outer padding)
   * - centers the icon when collapsed without animating padding
   * - becomes the left column when expanded (outer padding forms the gutter)
   */
  const iconColumnWidth = collapsedWidth - theme.spacing.sm * 2

  return (
    <View style={$menu}>
      {MENU_ITEMS.map((item) => {
        const active = activeItem === item.id
        return (
          <Pressable
            key={item.id}
            style={({ pressed }) => [
              $menuItem(themeName),
              active && $menuItemActive(themeName),
              pressed && $menuItemPressed,
            ]}
            onPress={() => setActiveItem(item.id)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            accessibilityLabel={item.label}
          >
            {/* Fixed-width icon column (centers icon when collapsed) */}
            <View style={{ width: iconColumnWidth, alignItems: "center" }}>
              <Icon
                icon={item.icon}
                size={18}
                color={active ? theme.colors.background : theme.colors.neutral}
                // TODO: don't love this but it's the only thing that works to change the icon color
                key={`${item.id}-${activeItem === item.id ? "active" : "inactive"}-icon`}
              />
            </View>

            {mounted && (
              <Animated.Text
                style={[
                  $menuItemText(themeName),
                  active && $menuItemTextActive(themeName),
                  { opacity: labelOpacity, marginLeft: 8 },
                ]}
                numberOfLines={1}
                ellipsizeMode="clip"
                accessibilityElementsHidden={!mounted}
                importantForAccessibility={mounted ? "auto" : "no-hide-descendants"}
              >
                {item.label}
              </Animated.Text>
            )}
          </Pressable>
        )
      })}
    </View>
  )
}

const $menu: ViewStyle = { flex: 1, marginTop: 12, width: "100%" }

const $menuItem = withTheme<ViewStyle>(({ spacing }) => ({
  paddingVertical: spacing.xs,
  marginBottom: spacing.xxs,
  borderRadius: 6,
  cursor: "pointer",
  flexDirection: "row",
  alignItems: "center",
  minWidth: 0,
}))

const $menuItemActive = withTheme<ViewStyle>((theme) => ({
  backgroundColor: theme.colors.primary,
}))

const $menuItemPressed: ViewStyle = { opacity: 0.7 }

const $menuItemText = withTheme<TextStyle>((theme) => ({
  fontSize: theme.typography.caption,
  color: theme.colors.mainText,
  fontWeight: "700",
}))

const $menuItemTextActive = withTheme<TextStyle>((theme) => ({
  color: theme.colors.background,
}))
