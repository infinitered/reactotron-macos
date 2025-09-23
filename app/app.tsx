/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */
import { DevSettings, NativeModules, StatusBar, View, type ViewStyle } from "react-native"
import { connectToServer } from "./state/connectToServer"
import { useTheme, themed } from "./theme/theme"
import { useEffect, useMemo } from "react"
import { TimelineScreen } from "./screens/TimelineScreen"
import { useMenuItem } from "./utils/useMenuItem"
import { Titlebar } from "./components/Titlebar/Titlebar"
import { Sidebar } from "./components/Sidebar/Sidebar"
import { useSidebar } from "./state/useSidebar"
import { AppHeader } from "./components/AppHeader"
import { useGlobal, withGlobal } from "./state/useGlobal"
import { MenuItemId } from "./components/Sidebar/SidebarMenu"
import { HelpScreen } from "./screens/HelpScreen"
import { TimelineItem } from "./types"
import { PortalHost } from "./components/Portal"

if (__DEV__) {
  // This is for debugging Reactotron with ... Reactotron!
  // Load Reactotron client in development only.
  require("./devtools/ReactotronConfig.ts")
}

function App(): React.JSX.Element {
  const { colors } = useTheme()
  const { toggleSidebar } = useSidebar()
  const [activeItem, setActiveItem] = useGlobal<MenuItemId>("sidebar-active-item", "logs", {
    persist: true,
  })
  const [, setTimelineItems] = withGlobal<TimelineItem[]>("timelineItems", [], {
    persist: true,
  })

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
          {
            label: "Logs Tab",
            shortcut: "cmd+1",
            action: () => setActiveItem("logs"),
          },
          {
            label: "Network Tab",
            shortcut: "cmd+2",
            action: () => setActiveItem("network"),
          },
          {
            label: "Performance Tab",
            shortcut: "cmd+3",
            action: () => setActiveItem("performance"),
          },
          {
            label: "Plugins Tab",
            shortcut: "cmd+4",
            action: () => setActiveItem("plugins"),
          },
          {
            label: "Help Tab",
            shortcut: "cmd+5",
            action: () => setActiveItem("help"),
          },
          ...(__DEV__
            ? [
                {
                  label: "Toggle Dev Menu",
                  shortcut: "cmd+shift+d",
                  action: () => NativeModules.DevMenu.show(),
                },
              ]
            : []),
        ],
        Window: [
          {
            label: "Reload",
            shortcut: "cmd+shift+r",
            action: () => DevSettings.reload(),
          },
        ],
        Tools: [
          {
            label: "Clear Timeline Items",
            shortcut: "cmd+k",
            action: () => setTimelineItems([]),
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
    <View style={$container()}>
      <Titlebar />
      <StatusBar barStyle={"dark-content"} backgroundColor={colors.background} />
      <View style={$mainContent}>
        <Sidebar />
        <View style={$contentContainer}>
          <AppHeader />
          {activeItem === "help" ? <HelpScreen /> : <TimelineScreen />}
        </View>
      </View>
      <PortalHost />
    </View>
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
