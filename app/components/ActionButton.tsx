import { GestureResponderEvent, Pressable, ViewStyle } from "react-native"
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
}))

const $pressed = (pressed: boolean) => ({
  opacity: pressed ? 0.5 : 1,
})

export default ActionButton
