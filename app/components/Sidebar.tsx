import { useEffect, useRef } from "react"
import { Animated, View, ViewStyle, Text, Pressable, TextStyle, StyleSheet } from "react-native"
import { useTheme, useThemeName, withTheme } from "../theme/theme"
import { useSidebar } from "../state/useSidebar"
import { useGlobal } from "../state/useGlobal"
import { Icon } from "./Icon"
import { Titlebar } from "./Titlebar"

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
        <Titlebar />
        <View style={$content(themeName)}>
          <SidebarMenu />
        </View>
      </Animated.View>
    </Animated.View>
  )
}

const $container = (theme: any): ViewStyle => ({
  backgroundColor: "#F9FAFB",
  overflow: "hidden",
  flex: 1,
  borderWidth: StyleSheet.hairlineWidth,
  borderColor: theme.colors.border + 60,
})

const MENU_ITEMS = [
  { id: "logs", label: "Logs", icon: "scrollText" },
  { id: "network", label: "Network", icon: "chevronsLeftRightEllipsis" },
  { id: "performance", label: "Performance", icon: "circleGauge" },
  { id: "plugins", label: "Plugins", icon: "plug" },
] as const

type MenuItemId = (typeof MENU_ITEMS)[number]["id"]

const SidebarMenu = () => {
  const [themeName] = useThemeName()
  const theme = useTheme(themeName)
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
          <Icon
            icon={item.icon}
            size={18}
            key={`${item.id}-${activeItem === item.id ? "active" : "inactive"}-icon`}
            color={activeItem === item.id ? theme.colors.background : theme.colors.neutral}
          />
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
  padding: theme.spacing.sm,
}))

const $menu: ViewStyle = {
  flex: 1,
}

const $menuItem = withTheme<ViewStyle>((theme) => ({
  paddingHorizontal: theme.spacing.sm,
  paddingVertical: theme.spacing.xs,
  marginBottom: theme.spacing.xs / 2,
  borderRadius: 6,
  cursor: "pointer",
  marginRight: 8,
  borderColor: "red",
  flexDirection: "row",
  gap: theme.spacing.sm,
}))

const $menuItemActive = withTheme<ViewStyle>((theme) => ({
  backgroundColor: theme.colors.primary,
}))

const $menuItemPressed: ViewStyle = {
  opacity: 0.7,
}

const $menuItemText = withTheme<TextStyle>((theme) => ({
  fontSize: theme.typography.caption,
  color: theme.colors.mainText + "bb",
  fontWeight: "700",
}))

const $menuItemTextActive = withTheme<TextStyle>((theme) => ({
  color: theme.colors.background,
}))
