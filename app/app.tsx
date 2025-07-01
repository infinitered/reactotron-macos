/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import {
  ScrollView,
  StatusBar,
  Text,
  useColorScheme,
  View,
  ViewStyle,
  TextStyle,
} from "react-native"

import { Colors } from "react-native/Libraries/NewAppScreen"

import { Header } from "./components/Header"
import { HeaderTab } from "./components/HeaderTab"
import { HeaderTitle } from "./components/HeaderTitle"

import IRFontList from "../specs/NativeIRFontList"
import IRRunShellCommand from "../specs/NativeIRRunShellCommand"

if (__DEV__) {
  // This is for debugging Reactotron with ... Reactotron!
  // Load Reactotron client in development only.
  // Note that you must be using metro's `inlineRequires` for this to work.
  // If you turn it off in metro.config.js, you'll have to manually import it.
  require("./devtools/ReactotronConfig.ts")
}

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === "dark"

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  }

  // const fonts = IRFontList.getFontListSync()

  const fonts = [IRRunShellCommand.runSync("Chalkboard")]

  return (
    <View style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? "light-content" : "dark-content"}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <Header>
        <HeaderTab
          text="Example1"
          icon="example"
          onClick={() => {}}
          isActive={true}
          key="example-1"
        />
        <HeaderTab
          text="Example2"
          icon="example"
          onClick={() => {}}
          isActive={true}
          key="example-2"
        />
        <HeaderTitle title={"Arch: " + (global?.nativeFabricUIManager ? "Fabric" : "Paper")} />
      </Header>
      <ScrollView style={backgroundStyle}>
        {fonts.map((font) => (
          <Text style={{ textAlign: "center", fontSize: 32, fontFamily: font }} key={font}>
            {font}
          </Text>
        ))}
      </ScrollView>
    </View>
  )
}

// const $highlight: TextStyle = {
//   fontWeight: "700",
// }

const $sectionContainer: ViewStyle = {
  marginTop: 32,
  paddingHorizontal: 24,
}

const $sectionDescription: TextStyle = {
  fontSize: 18,
  fontWeight: "400",
  marginTop: 8,
}

const $sectionTitle: TextStyle = {
  fontSize: 24,
  fontWeight: "600",
}

export default App
