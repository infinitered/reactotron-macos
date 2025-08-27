/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */
import { DevSettings, StatusBar, View, type ViewStyle } from "react-native"
import { connectToServer } from "./state/connectToServer"
import { useTheme, useThemeName, withTheme } from "./theme/theme"
import { useEffect, useMemo } from "react"
import { TimelineScreen } from "./screens/TimelineScreen"
import { useMenuItem } from "./utils/useMenuItem"
import { Titlebar } from "./components/Titlebar"
import { Sidebar } from "./components/Sidebar"
import { useSidebar } from "./state/useSidebar"

if (__DEV__) {
  // This is for debugging Reactotron with ... Reactotron!
  // Load Reactotron client in development only.
  require("./devtools/ReactotronConfig.ts")
}

function App(): React.JSX.Element {
  const [theme] = useThemeName()
  const { colors } = useTheme(theme)
  const { toggleSidebar } = useSidebar()

  const menuConfig = useMemo(
    () => ({
      remove: ["File", "Edit", "Format"],
      items: {
        View: [
          {
            label: "Toggle Sidebar",
            shortcut: "cmd+b",
            action: toggleSidebar,
          },
        ],
        Window: [
          {
            label: "Reload",
            shortcut: "cmd+shift+r",
            action: () => DevSettings.reload(),
          },
        ],
      },
    }),
    [toggleSidebar],
  )

  useMenuItem(menuConfig)

  setTimeout(() => {
    fetch("https://www.google.com")
      .then((res) => res.text())
      .then((text) => {
        console.tron.log("text", text)
      })
  }, 1000)

  // Connect to the server when the app mounts.
  // This will update global state with the server's state
  // and handle all websocket events.
  useEffect(() => connectToServer(), [])

  return (
    <View style={$container(theme)}>
      <Titlebar />
      <StatusBar barStyle={"dark-content"} backgroundColor={colors.background} />
      <View style={$mainContent}>
        <Sidebar />
        <View style={$contentContainer(theme)}>
          <TimelineScreen />
        </View>
      </View>
    </View>
  )
}

const $container = withTheme<ViewStyle>(({ colors }) => ({
  flex: 1,
  backgroundColor: colors.background,
}))

const $mainContent: ViewStyle = {
  flex: 1,
  flexDirection: "row",
}

const $contentContainer = withTheme<ViewStyle>(() => ({
  flex: 1,
}))

export default App
