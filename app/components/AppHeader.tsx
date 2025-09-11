/**
 * AppHeader
 *
 * The main header for Reactotron, containing the connected device tabs and status bar.
 */

import { View, TextInput, Text, TextStyle, ViewStyle } from "react-native"
import ActionButton from "./ActionButton"
import { ClearLogsButton } from "./ClearLogsButton"
import { ClientTab } from "./ClientTab"
import Header from "./Header"
import { HeaderTitle } from "./HeaderTitle"
import { useThemeName, themed } from "../theme/theme"
import { useGlobal } from "../state/useGlobal"
import { getReactotronAppId } from "../state/connectToServer"

export function AppHeader() {
  const reactotronAppId = getReactotronAppId()
  const [theme, setTheme] = useThemeName()
  const [isConnected] = useGlobal("isConnected", false)
  const [error] = useGlobal("error", null)
  const [clientIds] = useGlobal("clientIds", [])
  const [search, setSearch] = useGlobal("search", "")
  const arch = (global as any)?.nativeFabricUIManager ? "Fabric" : "Paper"

  return (
    <Header>
      <View style={$tabContainer()}>
        {clientIds.map((id) => (
          <ClientTab key={id} clientId={id} />
        ))}
      </View>
      <HeaderTitle title={`Reactotron ${reactotronAppId}`} />
      <View style={$statusRow()}>
        <View style={$searchContainer()}>
          <TextInput
            value={search}
            placeholder="Search"
            style={$searchInput()}
            placeholderTextColor={theme === "dark" ? "white" : "black"}
            onChangeText={setSearch}
          />
        </View>
        <View style={$statusItem()}>
          <View style={[$dot(), error ? $dotRed() : isConnected ? $dotGreen() : $dotGray()]} />
          <Text style={$statusText()}>Server</Text>
          <ClearLogsButton />
        </View>
        <View style={$divider()} />
        <View style={$statusItem()}>
          <View style={[$dot(), arch === "Fabric" ? $dotGreen() : $dotOrange()]} />
          <Text style={$statusText()}>{arch}</Text>
        </View>
      </View>
      <ActionButton
        icon={({ size }) => (
          <Text style={{ fontSize: size }}>{theme === "dark" ? "🌙" : "☀️"}</Text>
        )}
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      />
    </Header>
  )
}

const $tabContainer = themed<ViewStyle>(({ spacing }) => ({
  flexDirection: "row",
  paddingHorizontal: spacing.xl,
  paddingVertical: spacing.md,
  gap: spacing.md,
}))

const $statusRow = themed<ViewStyle>(({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  padding: spacing.sm,
  justifyContent: "center",
}))

const $statusItem = themed<ViewStyle>(() => ({
  flexDirection: "row",
  alignItems: "center",
  minWidth: 80,
}))

const $divider = themed<ViewStyle>(({ colors, spacing }) => ({
  width: 1,
  height: 24,
  backgroundColor: colors.border,
  marginHorizontal: spacing.md,
  borderRadius: 1,
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
}))

const $searchInput = themed<TextStyle>(({ colors, typography, spacing }) => ({
  width: 140,
  fontSize: typography.body,
  backgroundColor: colors.background,
  borderWidth: 1,
  borderRadius: 4,
  padding: spacing.xxs,
  zIndex: 1,
}))

const $searchContainer = themed<ViewStyle>(({ spacing }) => ({
  marginRight: spacing.md,
}))
