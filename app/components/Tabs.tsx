import { Text, View, type ViewStyle } from "react-native"
import { useThemeName, withTheme } from "../theme/theme"
import IRTabComponentView from "../../specs/IRTabNativeComponent"

/**
 * Experimental; probably will change.
 */
export function Tabs() {
  const [theme] = useThemeName()

  return (
    <IRTabComponentView
      style={$tabs(theme)}
      tabs={[
        { id: "home", title: "Home" },
        { id: "settings", title: "Settings" },
      ]}
      onTabSelected={(event) => {
        console.log("selectedTabId", event.nativeEvent.selectedTabId)
      }}
    >
      <View style={$tab(theme)} key="home" id="home">
        <Text>Home</Text>
      </View>
      <View style={$tab(theme)} key="settings" id="settings">
        <Text>Settings</Text>
      </View>
    </IRTabComponentView>
  )
}

const $tabs = withTheme<ViewStyle>(({}) => ({
  flex: 1,
}))

const $tab = withTheme<ViewStyle>(({}) => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
}))
