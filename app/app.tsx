/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */
import { StatusBar, View, type ViewStyle } from "react-native"
import { connectToServer } from "./state/connectToServer"
import { useTheme, themed } from "./theme/theme"
import { useEffect } from "react"
import { TimelineScreen } from "./screens/TimelineScreen"
import { AppHeader } from "./components/AppHeader"
import { useMenuItem } from "./utils/useMenuItem"

if (__DEV__) {
  // This is for debugging Reactotron with ... Reactotron!
  // Load Reactotron client in development only.
  require("./devtools/ReactotronConfig.ts")
}

const menuConfig = {
  remove: ["File", "Edit", "Format"],
}

function App(): React.JSX.Element {
  const { colors } = useTheme()

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
      <StatusBar barStyle={"dark-content"} backgroundColor={colors.background} />
      <AppHeader />
      <View style={$contentContainer}>
        <TimelineScreen />
      </View>
    </View>
  )
}

const $container = themed<ViewStyle>(({ colors }) => ({
  flex: 1,
  backgroundColor: colors.background,
}))

const $contentContainer: ViewStyle = {
  flex: 1,
}

export default App
