import { themed, useTheme } from "../../theme/theme"
import { Platform, View, ViewStyle } from "react-native"
import { Icon } from "../Icon"
import ActionButton from "../ActionButton"
import { useSidebar } from "../../state/useSidebar"
import { PassthroughView } from "./PassthroughView"

export const Titlebar = () => {
  const theme = useTheme()
  const { isOpen, toggleSidebar } = useSidebar()

  return (
    <View style={$borderContainer()}>
      <View style={$container()}>
        <TrafficLightSpacer />
        <PassthroughView>
          <ActionButton
            icon={() => (
              <Icon
                icon={isOpen ? "panelLeftClose" : "panelLeftOpen"}
                size={18}
                color={theme.colors.neutral}
              />
            )}
            onClick={toggleSidebar}
          />
        </PassthroughView>
      </View>
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

const $borderContainer = themed<ViewStyle>((theme) => ({
  backgroundColor: theme.colors.keyline,
  padding: 1,
}))

const $container = themed<ViewStyle>((theme) => ({
  backgroundColor: theme.colors.navigation,
  paddingHorizontal: theme.spacing.sm,
  flexDirection: "row",
  alignItems: "center",
  height: 36,
}))

const $macOSTrafficSpacer = {
  width: 52,
}
