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
  TextInput,
} from "react-native"

import { Colors } from "react-native/Libraries/NewAppScreen"

import { Header } from "./components/Header"
import { HeaderTab } from "./components/HeaderTab"
import { HeaderTitle } from "./components/HeaderTitle"

// import IRFontList from "../specs/NativeIRFontList"
import { useEffect, useState } from "react"

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

  const [fonts, setFonts] = useState<string[]>([])

  useEffect(() => {
    //  console.log("NatveIRFontList", IRFontList)
    // IRFontList.getFontList().then((fonts: string[]) => {
    //   setFonts(fonts)
    // })
  }, [])

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
        <HeaderTitle title="Title" />
      </Header>
      <ScrollView style={backgroundStyle}>
        <Text style={{ textAlign: "center", fontSize: 32 }}>Default</Text>
        <Text
          style={{
            textAlign: "center",
            fontSize: 32,
            fontFamily: "Assets/SpaceGrotesk.ttf#Space Grotesk",
          }}
        >
          Default
        </Text>
        <Text style={{ textAlign: "center", fontSize: 32, fontFamily: "Impact#Impact" }}>
          Baskerville (system)
        </Text>
        {fonts.map((font) => (
          <Text style={{ textAlign: "center", fontSize: 32, fontFamily: font }}>{font}</Text>
        ))}
        <TextInput
          placeholder="Default"
          style={{
            textAlign: "center",
            fontSize: 32,
            fontFamily: "Assets/SpaceGrotesk.ttf#Space Grotesk",
          }}
        />
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
