/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { ScrollView, StatusBar, Text, View, ViewStyle, TextStyle } from "react-native"

import { useData } from "./state/useData"
import { useTheme, useThemeName, withTheme } from "./theme/theme"
import { Tab } from "./components/Tab"
import { useGlobalState } from "./state/useGlobalState"

if (__DEV__) {
  // This is for debugging Reactotron with ... Reactotron!
  // Load Reactotron client in development only.
  // Note that you must be using metro's `inlineRequires` for this to work.
  // If you turn it off in metro.config.js, you'll have to manually import it.
  require("./devtools/ReactotronConfig.ts")
}

function App(): React.JSX.Element {
  const [theme] = useThemeName()
  const { colors } = useTheme(theme)
  const arch = (global as any)?.nativeFabricUIManager ? "Fabric" : "Paper"
  const [activeTab, setActiveTab] = useGlobalState("activeTab", "Example1")

  // TODO: replace with Zustand or other global state management
  const { isConnected, error } = useData()

  return (
    <View style={$container(theme)}>
      <StatusBar barStyle={"dark-content"} backgroundColor={colors.background} />
      <View style={$tabContainer(theme)}>
        <Tab activeTab={activeTab} label="Example1" onPress={() => setActiveTab("Example1")} />
        <Tab activeTab={activeTab} label="Example2" onPress={() => setActiveTab("Example2")} />
      </View>
      <View style={$contentContainer(theme)}>
        <ScrollView style={$scrollView(theme)}>
          <View style={$dashboard(theme)}>
            {/* Status Row */}
            <View style={$statusRow(theme)}>
              <View style={$statusItem(theme)}>
                <View
                  style={[
                    $dot(theme),
                    error ? $dotRed(theme) : isConnected ? $dotGreen(theme) : $dotGray(theme),
                  ]}
                />
                <Text style={$statusText(theme)}>App Connected</Text>
              </View>
              <View style={$divider(theme)} />
              <View style={$statusItem(theme)}>
                <View style={[$dot(theme), false ? $dotGreen(theme) : $dotGray(theme)]} />
                <Text style={$statusText(theme)}>Client Connected</Text>
              </View>
              <View style={$divider(theme)} />
              <View style={$statusItem(theme)}>
                <View
                  style={[$dot(theme), arch === "Fabric" ? $dotGreen(theme) : $dotOrange(theme)]}
                />
                <Text style={$statusText(theme)}>{arch}</Text>
              </View>
            </View>

            {/* Title */}
            <Text style={$title(theme)}>IRRunShellCommand Tests</Text>
          </View>
        </ScrollView>
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
  marginBottom: spacing.xl,
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

const $title = withTheme<TextStyle>(({ colors }) => ({
  fontSize: 22,
  fontWeight: "bold",
  marginBottom: 28,
  textAlign: "center",
  color: colors.mainText,
  letterSpacing: 0.2,
}))

export default App
