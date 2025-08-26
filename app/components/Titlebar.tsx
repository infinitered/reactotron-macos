import { useTheme, useThemeName, withTheme } from "../theme/theme"
import { Platform, View, ViewStyle } from "react-native"
import { Icon } from "./Icon"
import ActionButton from "./ActionButton"

export const Titlebar = () => {
  const [themeName] = useThemeName()
  const theme = useTheme(themeName)

  return (
    <View style={$container(themeName)}>
      <TrafficLightSpacer />
      <ActionButton
        icon={() => <Icon icon="panelLeftClose" size={16} color={theme.colors.neutral} />}
        onClick={() => {}}
      />
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

const $container = withTheme<ViewStyle>((theme) => ({
  backgroundColor: theme.colors.cardBackground,
  paddingHorizontal: theme.spacing.sm,
  flexDirection: "row",
  alignItems: "center",
  height: 36,
}))

const $macOSTrafficSpacer = {
  width: 52,
}
