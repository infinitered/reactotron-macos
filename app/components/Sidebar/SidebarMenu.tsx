import { Animated, View, ViewStyle, Pressable, TextStyle, Text } from "react-native"
import { themed, useTheme, useThemeName } from "../../theme/theme"
import { useGlobal } from "../../state/useGlobal"
import { manualReconnect } from "../../state/connectToServer"
import { Icon } from "../Icon"

const MENU_ITEMS = [
  { id: "logs", label: "Logs", icon: "scrollText" },
  { id: "network", label: "Network", icon: "chevronsLeftRightEllipsis" },
  { id: "state", label: "State", icon: "clipboard" },
  { id: "performance", label: "Performance", icon: "circleGauge" },
  { id: "plugins", label: "Plugins", icon: "plug" },
  { id: "help", label: "Help", icon: "questionMark" },
] as const

export type MenuItemId = (typeof MENU_ITEMS)[number]["id"]

interface SidebarMenuProps {
  progress: Animated.Value
  mounted: boolean
  collapsedWidth: number
}

export const SidebarMenu = ({ progress, mounted, collapsedWidth }: SidebarMenuProps) => {
  const theme = useTheme()
  const [themeName, setTheme] = useThemeName()
  const [isConnected] = useGlobal("isConnected", false)
  const [connectionStatus] = useGlobal<string>("connectionStatus", "Disconnected")
  const [clientIds] = useGlobal<string[]>("clientIds", [])
  const [error] = useGlobal("error", null)
  const arch = (global as any)?.nativeFabricUIManager ? "Fabric" : "Paper"

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
  const iconColumnWidth = collapsedWidth - theme.spacing.sm * 2.8

  return (
    <View style={$menu}>
      <View>
        {MENU_ITEMS.map((item) => {
          const active = activeItem === item.id
          return (
            <Pressable
              key={item.id}
              style={({ pressed }) => [
                $menuItem(),
                active && $menuItemActive(),
                pressed && $menuItemPressed,
              ]}
              onPress={() => setActiveItem(item.id)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              accessibilityLabel={item.label}
            >
              {/* Fixed-width icon column (centers icon when collapsed) */}
              <View style={[{ width: iconColumnWidth }, $iconColumn()]}>
                <Icon
                  icon={item.icon}
                  size={18}
                  color={active ? theme.colors.mainTextInverted : theme.colors.neutral}
                  // TODO: don't love this but it's the only thing that works to change the icon color
                  key={`${item.id}-${
                    activeItem === item.id ? "active" : "inactive"
                  }-${themeName}-icon`}
                />
              </View>

              {mounted && (
                <Animated.Text
                  style={[
                    $menuItemText(),
                    active && $menuItemTextActive(),
                    { opacity: labelOpacity },
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
      <View>
        <Pressable
          style={({ pressed }) => [$menuItem(), $statusItemContainer, pressed && $menuItemPressed]}
          onPress={manualReconnect}
          accessibilityRole="button"
          accessibilityLabel={`Connection status: ${connectionStatus}. Tap to retry.`}
        >
          <View style={[{ width: iconColumnWidth }, $iconColumn()]}>
            <View
              style={[
                { width: iconColumnWidth },
                $dot(),
                error ? $dotRed() : isConnected ? $dotGreen() : $dotGray(),
              ]}
            />
          </View>

          {mounted && (
            <Animated.View style={[$connectionContainer, { opacity: labelOpacity }]}>
              <Animated.Text
                style={[$menuItemText(), $connectionStatusText()]}
                numberOfLines={2}
                ellipsizeMode="tail"
                accessibilityElementsHidden={!mounted}
                importantForAccessibility={mounted ? "auto" : "no-hide-descendants"}
              >
                {connectionStatus}
              </Animated.Text>
              {isConnected && clientIds.length === 0 && (
                <Text style={[$menuItemText(), $helpText()]}>Port 9292</Text>
              )}
            </Animated.View>
          )}
        </Pressable>
        <View style={[$menuItem(), $statusItemContainer]}>
          <View style={[{ width: iconColumnWidth }, $iconColumn()]}>
            <View
              style={[
                { width: iconColumnWidth },
                $dot(),
                arch === "Fabric" ? $dotGreen() : $dotOrange(),
              ]}
            />
          </View>

          {mounted && (
            <Animated.Text
              style={[$menuItemText(), { opacity: labelOpacity }]}
              numberOfLines={1}
              ellipsizeMode="clip"
              accessibilityElementsHidden={!mounted}
              importantForAccessibility={mounted ? "auto" : "no-hide-descendants"}
            >
              {arch}
            </Animated.Text>
          )}
        </View>
        <Pressable
          style={({ pressed }) => [$menuItem(), pressed && $menuItemPressed]}
          onPress={() => setTheme(themeName === "dark" ? "light" : "dark")}
          accessibilityRole="button"
          accessibilityLabel={"Switch theme"}
        >
          <View style={[{ width: iconColumnWidth }, $iconColumn()]}>
            <Text style={[{ width: iconColumnWidth }, $statusText()]}>
              {`${themeName === "dark" ? "🌙" : "☀️"}`}
            </Text>
          </View>

          {mounted && (
            <Animated.Text
              style={[$menuItemText(), { opacity: labelOpacity }]}
              numberOfLines={1}
              ellipsizeMode="clip"
              accessibilityElementsHidden={!mounted}
              importantForAccessibility={mounted ? "auto" : "no-hide-descendants"}
            >
              Light / Dark
            </Animated.Text>
          )}
        </Pressable>
      </View>
    </View>
  )
}

const $menu: ViewStyle = { flex: 1, marginTop: 12, width: "100%", justifyContent: "space-between" }

const $menuItem = themed<ViewStyle>(({ spacing }) => ({
  paddingVertical: spacing.xs,
  marginBottom: spacing.xxs,
  borderRadius: 6,
  cursor: "pointer",
  flexDirection: "row",
  alignItems: "center",
  minWidth: 0,
}))

const $menuItemActive = themed<ViewStyle>((theme) => ({
  backgroundColor: theme.colors.primary,
}))

const $menuItemPressed: ViewStyle = { opacity: 0.7 }

const $menuItemText = themed<TextStyle>((theme) => ({
  fontSize: theme.typography.caption,
  color: theme.colors.mainText,
  fontWeight: "700",
  marginLeft: theme.spacing.xs,
}))

const $menuItemTextActive = themed<TextStyle>((theme) => ({
  color: theme.colors.mainTextInverted,
}))

const $iconColumn = themed<ViewStyle>(({ spacing }) => ({
  marginLeft: spacing.xs,
}))

const $dot = themed<ViewStyle>(({ colors }) => ({
  width: 12,
  height: 12,
  borderRadius: 6,
  marginRight: 8,
  borderWidth: 1,
  borderColor: colors.border,
}))
const $dotGray = themed<ViewStyle>(({ colors }) => ({ backgroundColor: colors.neutral }))
const $dotGreen = themed<ViewStyle>(({ colors }) => ({ backgroundColor: colors.success }))
const $dotRed = themed<ViewStyle>(({ colors }) => ({ backgroundColor: colors.danger }))
const $dotOrange = themed<ViewStyle>(({ colors }) => ({ backgroundColor: colors.primary }))
const $statusText = themed<TextStyle>(({ colors }) => ({
  fontSize: 16,
  color: colors.mainText,
  fontWeight: "600",
  marginLeft: -4,
}))
const $connectionStatusText = themed<TextStyle>(() => ({
  fontSize: 11,
  lineHeight: 14,
}))
const $helpText = themed<TextStyle>(({ colors }) => ({
  fontSize: 10,
  lineHeight: 12,
  color: colors.neutral,
  marginTop: 2,
}))
const $connectionContainer: ViewStyle = { flex: 1 }
const $statusItemContainer: ViewStyle = { cursor: "pointer", minHeight: 32 }
