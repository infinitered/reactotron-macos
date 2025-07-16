import { ViewStyle } from "react-native"
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
        { id: "1", title: "Tab 1" },
        { id: "2", title: "Tab 2" },
      ]}
      onTabSelected={(event) => {
        console.log("selectedTabId", event.nativeEvent.selectedTabId)
      }}
    />
  )
}

const $tabs = withTheme<ViewStyle>(({}) => ({
  flex: 1,
}))
