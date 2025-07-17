import { Button, Text, View, ViewStyle } from "react-native"
import { useThemeName, withTheme } from "../theme/theme"
import IRTabComponentView from "../../specs/IRTabNativeComponent"
import { useState } from "react"

/**
 * Experimental; probably will change.
 */
export function Tabs() {
  const [theme] = useThemeName()
  const [tabs, setTabs] = useState([
    { id: "home", title: "Home" },
    { id: "settings", title: "Settings" },
  ])

  return (
    <IRTabComponentView
      style={$tabs(theme)}
      tabs={tabs}
      onTabSelected={(event) => {
        console.log("selectedTabId", event.nativeEvent.selectedTabId)
      }}
    >
      <View style={$tab(theme)} key="home" id="home">
        <Text>Home</Text>
        <Button
          title="Add Tab"
          onPress={() => {
            console.log("add tab")
            const tabNum = tabs.length + 1
            setTabs([...tabs, { id: `my-tab${tabNum}`, title: `Tab ${tabNum}` }])
          }}
          style={$addTabButton(theme)}
        />
      </View>
      {tabs.slice(1).map((tab) => (
        <View style={$tab(theme)} key={tab.id} id={tab.id}>
          <Text>
            {tab.title} {tab.id}
          </Text>
        </View>
      ))}
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

const $addTabButton = withTheme<ViewStyle>(({}) => ({
  marginTop: 10,
  backgroundColor: "red",
  width: 100,
  height: 100,
}))
