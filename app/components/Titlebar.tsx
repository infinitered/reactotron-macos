import { useTheme, useThemeName, withTheme } from "../theme/theme"
import { Platform, View, ViewStyle } from "react-native"
import { Icon } from "./Icon"
import ActionButton from "./ActionButton"
import { useSidebar } from "../state/useSidebar"

export const Titlebar = () => {
  const [themeName] = useThemeName()
  const theme = useTheme(themeName)
  const { isOpen, toggleSidebar } = useSidebar()

  return (
    <View style={$container(themeName)}>
      <TrafficLightSpacer />
      <ActionButton
        icon={() => (
          <Icon
            icon={isOpen ? "panelLeftClose" : "panelLeftOpen"}
            size={18}
            color={theme.colors.neutral}
          />
        )}
        style={$sidebarContainerOverride}
        onClick={toggleSidebar}
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
  backgroundColor: theme.colors.navigation,
  paddingHorizontal: theme.spacing.sm,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  height: 36,
}))

const $sidebarContainerOverride = {
  marginRight: 0,
  paddingHorizontal: 0,
}

const $macOSTrafficSpacer = {
  width: 52,
}
