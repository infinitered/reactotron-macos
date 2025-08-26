import { GestureResponderEvent, ViewStyle } from "react-native"
import { Pressable } from "react-native-macos"
import { useThemeName, withTheme } from "../theme/theme"

interface ActionButtonProps {
  icon: React.ElementType<{ size: number }>
  onClick: (event: GestureResponderEvent) => void
  style?: ViewStyle
}

function ActionButton({ icon: Icon, onClick, style }: ActionButtonProps) {
  const [theme] = useThemeName()

  return (
    <Pressable
      style={({ pressed }) => [$container(theme), style, $pressed(pressed)]}
      onPress={onClick}
      // TODO: Add hover support https://github.com/microsoft/react-native-macos/issues/2313
      // onHoverIn={() => setHovered(true)}
      // onHoverOut={() => setHovered(false)}
    >
      <Icon size={24} />
    </Pressable>
  )
}

const $container = withTheme<ViewStyle>(({ spacing }) => ({
  marginHorizontal: spacing.sm,
  padding: spacing.sm,
  justifyContent: "center",
  alignItems: "center",
  cursor: "pointer",
}))

const $pressed = (pressed: boolean) => ({
  opacity: pressed ? 0.5 : 1,
})

export default ActionButton
