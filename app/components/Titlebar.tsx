import { themed } from "../theme/theme"
import { Platform, View, ViewStyle } from "react-native"

export const Titlebar = () => {
  return (
    <View style={$container()}>
      <TrafficLightSpacer />
    </View>
  )
}

const TrafficLightSpacer = () => {
  return Platform.select({
    // 🚥 Keep the content off the traffic lights in macos
    macos: <View style={$macOSTrafficSpacer} />,
    default: null, // TODO: Figure out how to handle this for Windows
  })
}

const $container = themed<ViewStyle>(({ colors, spacing }) => ({
  backgroundColor: colors.cardBackground,
  paddingHorizontal: spacing.sm,
  flexDirection: "row",
  alignItems: "center",
  height: 36,
}))

const $macOSTrafficSpacer = {
  width: 52,
}
