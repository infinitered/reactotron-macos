import { Text, View, type ViewStyle } from "react-native"
// import IRTabComponentView from "../native/IRTabComponentView/NativeIRTabNativeComponent"
import { themed } from "../theme/theme"
import { $flex } from "../theme/basics"


export function Tabs() {
  return null
  // return (
  //   <IRTabComponentView
  //     style={$flex}
  //     tabs={[
  //       { id: "home", title: "Home" },
  //       { id: "settings", title: "Settings" },
  //     ]}
  //     onTabSelected={(event) => {
  //       console.log("selectedTabId", event.nativeEvent.selectedTabId)
  //     }}
  //   >
  //     <View style={$panel()} key="home" id="home">
  //       <Text>Home</Text>
  //     </View>
  //     <View style={$panel()} key="settings" id="settings">
  //       <Text>Settings</Text>
  //     </View>
  //   </IRTabComponentView>
  // )
}

const $panel = themed<ViewStyle>(({ }) => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
}))
