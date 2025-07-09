import { GestureResponderEvent, TouchableOpacity, ViewStyle } from "react-native"
import { useThemeName, withTheme } from "../theme/theme"

interface ActionButtonProps {
  icon: React.ElementType<{ size: number }>
  onClick: (event: GestureResponderEvent) => void
  style?: ViewStyle
}

function ActionButton({ icon: Icon, onClick, style }: ActionButtonProps) {
  const [theme] = useThemeName()

  return (
    <TouchableOpacity style={[$container(theme), style]} onPress={onClick} activeOpacity={0.7}>
      <Icon size={24} />
    </TouchableOpacity>
  )
}

const $container = withTheme<ViewStyle>(({ spacing }) => ({
  marginHorizontal: spacing.sm,
  padding: spacing.sm,
  justifyContent: "center",
  alignItems: "center",
}))

export default ActionButton
