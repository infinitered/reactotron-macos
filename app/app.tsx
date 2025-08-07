/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { StatusBar, View, ViewStyle } from "react-native"

import { connectToServer } from "./state/connectToServer"
import { useTheme, useThemeName, withTheme } from "./theme/theme"
import { useEffect } from "react"
import { TimelineScreen } from "./screens/TimelineScreen"
import { AppHeader } from "./components/AppHeader"

if (__DEV__) {
  // This is for debugging Reactotron with ... Reactotron!
  // Load Reactotron client in development only.
  require("./devtools/ReactotronConfig.ts")
}

function App(): React.JSX.Element {
  const [theme] = useThemeName()
  const { colors } = useTheme(theme)

  setTimeout(() => {
    fetch("https://www.google.com")
      .then((res) => res.text())
      .then((text) => {
        console.tron.log("text", text)
      })
  }, 1000)

  // // Test array literal with method chaining
  // const result2 = invokeObjC(
  //   `[[@[@"Apple", @"Banana", @"Cherry"] componentsJoinedByString:@", "] uppercaseString]`,
  // )
  // console.log({ result2 })

  // // Test nested method calls with array manipulation
  // const result3 = invokeObjC(
  //   `[[[@[@"One", @"Two", @"Three"] mutableCopy] addObject:@"Four"] componentsJoinedByString:@" | "]`,
  // )
  // console.log({ result3 })

  // Connect to the server when the app mounts.
  // This will update global state with the server's state
  // and handle all websocket events.
  useEffect(() => connectToServer(), [])

  return (
    <View style={$container(theme)}>
      <StatusBar barStyle={"dark-content"} backgroundColor={colors.background} />
      <AppHeader />
      <View style={$contentContainer(theme)}>
        <TimelineScreen />
      </View>
    </View>
  )
}

const $container = withTheme<ViewStyle>(({ colors }) => ({
  flex: 1,
  backgroundColor: colors.background,
}))

const $contentContainer = withTheme<ViewStyle>(({ spacing }) => ({
  flex: 1,
  padding: spacing.md,
}))

export default App
