/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { ScrollView, StatusBar, Text, View, ViewStyle, TextStyle, Button } from "react-native"

import { connectToServer, sendToClient } from "./state/connectToServer"
import { useTheme, useThemeName, withTheme } from "./theme/theme"
import { Tab } from "./components/Tab"
import Header from "./components/Header"
import { HeaderTitle } from "./components/HeaderTitle"
import ActionButton from "./components/ActionButton"
import { useGlobal } from "./state/useGlobal"
import { SystemInfo } from "./components/SystemInfo"
import { LogViewer } from "./components/LogViewer"
import { useEffect } from "react"
import { ClientTab } from "./components/ClientTab"

if (__DEV__) {
  // This is for debugging Reactotron with ... Reactotron!
  // Load Reactotron client in development only.
  require("./devtools/ReactotronConfig.ts")
}

function ReactotronHeader() {
  const [activeTab] = useGlobal("activeTab", "Example1", { persist: true })
  return <HeaderTitle title={"Reactotron " + activeTab} />
}

function App(): React.JSX.Element {
  const [theme, setTheme] = useThemeName()
  const { colors } = useTheme(theme)

  // TODO: Move into discrete components to minimize full app rerenders
  const [isConnected] = useGlobal("isConnected", false)
  const [error] = useGlobal("error", null)
  const [clientIds] = useGlobal("clientIds", [])
  const [_logs] = useGlobal("logs", [])
  const arch = (global as any)?.nativeFabricUIManager ? "Fabric" : "Paper"

  // Connect to the server when the app mounts.
  // This will update global state with the server's state
  // and handle all websocket events.
  useEffect(() => connectToServer(), [])

  return (
    <View style={$container(theme)}>
      <StatusBar barStyle={"dark-content"} backgroundColor={colors.background} />
      <Header>
        <View style={$tabContainer(theme)}>
          {clientIds.map((id) => (
            <ClientTab key={id} clientId={id} />
          ))}
        </View>
        <ReactotronHeader />

        {/* Status Row */}
        <View style={$statusRow(theme)}>
          <View style={$statusItem(theme)}>
            <View
              style={[
                $dot(theme),
                error ? $dotRed(theme) : isConnected ? $dotGreen(theme) : $dotGray(theme),
              ]}
            />
            <Text style={$statusText(theme)}>Server</Text>
            <Button onPress={() => sendToClient("showDevMenu", {}, clientIds[0])} title="Send" />
          </View>
          {clientIds.map((id) => (
            <View key={id} style={$statusItem(theme)}>
              <Text style={$statusText(theme)}>{id}</Text>
            </View>
          ))}
          <View style={$divider(theme)} />
          <View style={$statusItem(theme)}>
            <View style={[$dot(theme), arch === "Fabric" ? $dotGreen(theme) : $dotOrange(theme)]} />
            <Text style={$statusText(theme)}>{arch}</Text>
          </View>
        </View>
        <ActionButton
          icon={({ size }) => (
            <Text style={{ fontSize: size }}>{theme === "dark" ? "🌙" : "☀️"}</Text>
          )}
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        />
      </Header>
      <View style={$contentContainer(theme)}>
        {/* <ScrollView style={$scrollView(theme)}>
          <View style={$dashboard(theme)}>
            <SystemInfo />
          </View>
        </ScrollView> */}
        <LogViewer />
      </View>
    </View>
  )
}

// const $highlight: TextStyle = {
//   fontWeight: "700",
// }

const $container = withTheme<ViewStyle>(({ colors }) => ({
  flex: 1,
  backgroundColor: colors.background,
}))

const $tabContainer = withTheme<ViewStyle>(({ spacing }) => ({
  flexDirection: "row",
  paddingHorizontal: spacing.xl,
  paddingVertical: spacing.md,
  gap: spacing.md,
}))

const $contentContainer = withTheme<ViewStyle>(() => ({
  flex: 1,
}))

const $scrollView = withTheme<ViewStyle>(() => ({
  flex: 1,
}))

const $dashboard = withTheme<ViewStyle>(({ colors, spacing }) => ({
  margin: spacing.lg,
  padding: spacing.xl,
  backgroundColor: colors.cardBackground,
  borderRadius: 20,
  borderWidth: 1,
  borderColor: colors.border,
  shadowColor: "#000",
  shadowOpacity: 0.06,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 4 },
  gap: spacing.xl,
}))

const $statusRow = withTheme<ViewStyle>(({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  padding: spacing.sm,
  justifyContent: "center",
}))

const $statusItem = withTheme<ViewStyle>(() => ({
  flexDirection: "row",
  alignItems: "center",
  minWidth: 80,
}))

const $divider = withTheme<ViewStyle>(({ colors, spacing }) => ({
  width: 1,
  height: 24,
  backgroundColor: colors.border,
  marginHorizontal: spacing.md,
  borderRadius: 1,
}))

const $dot = withTheme<ViewStyle>(({ colors }) => ({
  width: 12,
  height: 12,
  borderRadius: 6,
  marginRight: 8,
  borderWidth: 1,
  borderColor: colors.border,
}))
const $dotGray = withTheme<ViewStyle>(({ colors }) => ({ backgroundColor: colors.neutral }))
const $dotGreen = withTheme<ViewStyle>(({ colors }) => ({ backgroundColor: colors.success }))
const $dotRed = withTheme<ViewStyle>(({ colors }) => ({ backgroundColor: colors.danger }))
const $dotOrange = withTheme<ViewStyle>(({ colors }) => ({ backgroundColor: colors.primary }))

const $statusText = withTheme<TextStyle>(({ colors }) => ({
  fontSize: 16,
  color: colors.mainText,
  fontWeight: "600",
}))

export default App
