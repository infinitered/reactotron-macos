import { StatusBar, View, type ViewStyle } from "react-native"
import { connectToServer } from "./state/connectToServer"
import { useTheme, themed } from "./theme/theme"
import { useEffect } from "react"
import { TimelineScreen } from "./screens/TimelineScreen"
import { Titlebar } from "./components/Titlebar/Titlebar"
import { Sidebar } from "./components/Sidebar/Sidebar"
import { useGlobal } from "./state/useGlobal"
import { MenuItemId } from "./components/Sidebar/SidebarMenu"
import { HelpScreen } from "./screens/HelpScreen"
import { PortalHost } from "./components/Portal"
import { StateScreen } from "./screens/StateScreen"
import { ShortcutsProvider } from "./contexts/ShortcutsContext"
import { SystemMenu } from "./components/SystemMenu"
import { CustomCommandsScreen } from "./screens/CustomCommandsScreen"

if (__DEV__) {
  // This is for debugging Reactotron with ... Reactotron!
  // Load Reactotron client in development only.
  require("./devtools/ReactotronConfig.ts")
}

function App(): React.JSX.Element {
  const { colors } = useTheme()
  const [activeItem] = useGlobal<MenuItemId>("sidebar-active-item", "logs")





  // Connect to the server when the app mounts.
  // This will update global state with the server's state
  // and handle all websocket events.
  useEffect(() => connectToServer(), [])

  const renderActiveItem = () => {
    switch (activeItem) {
      case "help":
        return <HelpScreen />
      case "state":
        return <StateScreen />
      case "customCommands":
        return <CustomCommandsScreen />
      default:
        return <TimelineScreen />
    }
  }

  return (
    <ShortcutsProvider>
      <SystemMenu>
        <View style={$container()}>
          <Titlebar />
          <StatusBar barStyle={"dark-content"} backgroundColor={colors.background} />
          <View style={$mainContent}>
            <Sidebar />
            <View style={$contentContainer}>{renderActiveItem()}</View>
          </View>
          <PortalHost />
        </View>
      </SystemMenu>
    </ShortcutsProvider>
  )
}

const $container = themed<ViewStyle>(({ colors }) => ({
  flex: 1,
  backgroundColor: colors.background,
}))

const $mainContent: ViewStyle = {
  flex: 1,
  flexDirection: "row",
}

const $contentContainer: ViewStyle = {
  flex: 1,
}

export default App
