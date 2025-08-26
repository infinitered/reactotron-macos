import { useEffect, useRef } from "react"
import { Animated, View, ViewStyle, Text, Pressable, TextStyle } from "react-native"
import { useTheme, useThemeName, withTheme } from "../theme/theme"
import { useSidebar } from "../state/useSidebar"
import { useGlobal } from "../state/useGlobal"

interface SidebarProps {
  width?: number
}

export const Sidebar = ({ width = 250 }: SidebarProps) => {
  const [themeName] = useThemeName()
  const theme = useTheme(themeName)
  const { isOpen } = useSidebar()

  const animatedPosition = useRef(new Animated.Value(isOpen ? 0 : -width)).current
  const animatedWidth = useRef(new Animated.Value(isOpen ? width : 0)).current

  useEffect(() => {
    const duration = isOpen ? 300 : 250

    Animated.timing(animatedPosition, {
      toValue: isOpen ? 0 : -width,
      duration,
      useNativeDriver: false, // Width animations can't use native driver
    }).start()

    Animated.timing(animatedWidth, {
      toValue: isOpen ? width : 0,
      duration,
      useNativeDriver: false, // Width animations can't use native driver
    }).start()

    return () => {
      animatedPosition.stopAnimation()
    }
  }, [isOpen, width, animatedPosition])

  return (
    <Animated.View style={{ width: animatedWidth }}>
      <Animated.View style={[$container(theme), { transform: [{ translateX: animatedPosition }] }]}>
        <View style={$content(themeName)}>
          <SidebarMenu />
        </View>
      </Animated.View>
    </Animated.View>
  )
}

const $container = (theme: any): ViewStyle => ({
  backgroundColor: theme.colors.cardBackground,
  borderRightWidth: 1,
  borderRightColor: theme.colors.neutral,
  overflow: "hidden",
  flex: 1,
  flexDirection: "row",
})

const MENU_ITEMS = [
  { id: "logs", label: "Logs" },
  { id: "network", label: "Network" },
  { id: "performance", label: "Performance" },
  { id: "plugins", label: "Plugins" },
] as const

type MenuItemId = (typeof MENU_ITEMS)[number]["id"]

const SidebarMenu = () => {
  const [themeName] = useThemeName()
  const [activeItem, setActiveItem] = useGlobal<MenuItemId>("sidebar-active-item", "logs", {
    persist: true,
  })

  const handleItemPress = (itemId: MenuItemId) => {
    setActiveItem(itemId)
  }

  return (
    <View style={$menu}>
      {MENU_ITEMS.map((item) => (
        <Pressable
          key={item.id}
          style={({ pressed }) => [
            $menuItem(themeName),
            activeItem === item.id && $menuItemActive(themeName),
            pressed && $menuItemPressed,
          ]}
          onPress={() => handleItemPress(item.id)}
        >
          <Text
            style={[
              $menuItemText(themeName),
              activeItem === item.id && $menuItemTextActive(themeName),
            ]}
          >
            {item.label}
          </Text>
        </Pressable>
      ))}
    </View>
  )
}

const $content = withTheme<ViewStyle>((theme) => ({
  flex: 1,
  padding: theme.spacing.md,
}))

const $menu: ViewStyle = {
  flex: 1,
}

const $menuItem = withTheme<ViewStyle>((theme) => ({
  paddingHorizontal: theme.spacing.md,
  paddingVertical: theme.spacing.sm,
  marginBottom: theme.spacing.xs,
  borderRadius: 6,
  cursor: "pointer",
}))

const $menuItemActive = withTheme<ViewStyle>((theme) => ({
  backgroundColor: theme.colors.primary,
}))

const $menuItemPressed: ViewStyle = {
  opacity: 0.7,
}

const $menuItemText = withTheme<TextStyle>((theme) => ({
  fontSize: theme.typography.small,
  color: theme.colors.mainText,
}))

const $menuItemTextActive = withTheme<TextStyle>((theme) => ({
  color: theme.colors.background,
}))
