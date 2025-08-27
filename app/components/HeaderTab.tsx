import { Pressable, Text, ViewStyle, TextStyle } from "react-native"
import { useTheme, themed } from "../theme/theme"

interface Props {
  icon: string
  text: string
  isActive: boolean
  onClick: () => void
}

export function HeaderTab({ text, isActive, onClick }: Props) {
  const { colors } = useTheme()

  const $tc: TextStyle = { color: isActive ? colors.primary : colors.neutral }
  return (
    <Pressable style={$container} onPress={onClick}>
      {/* {icon && <Icon size={32} color={isActive ? Theme.highlight : Theme.foregroundLight} />} */}
      <Text style={[$title(), $tc]}>{text}</Text>
    </Pressable>
  )
}

const $container: ViewStyle = {
  alignItems: "center",
  flexDirection: "column", // Stack icon and text vertically
  marginHorizontal: 10,
  paddingVertical: 15,
}

const $title = themed<TextStyle>(({ typography }) => ({
  fontSize: typography.small,
  paddingTop: 2,
  textAlign: "center",
}))
