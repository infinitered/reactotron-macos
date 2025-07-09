import { Pressable, Text, ViewStyle, TextStyle } from "react-native"
import { useTheme, useThemeName, withTheme } from "../theme/theme"

interface Props {
  icon: string
  text: string
  isActive: boolean
  onClick: () => void
}

export function HeaderTab({ text, isActive, onClick }: Props) {
  const [theme] = useThemeName()
  const { colors } = useTheme(theme)

  const $tc: TextStyle = { color: isActive ? colors.primary : colors.neutral }
  return (
    <Pressable style={$container} onPress={onClick}>
      {/* {icon && <Icon size={32} color={isActive ? Theme.highlight : Theme.foregroundLight} />} */}
      <Text style={[$title(theme), $tc]}>{text}</Text>
    </Pressable>
  )
}

const $container: ViewStyle = {
  alignItems: "center",
  flexDirection: "column", // Stack icon and text vertically
  marginHorizontal: 10,
  paddingVertical: 15,
}

const $title = withTheme<TextStyle>(({ typography }) => ({
  fontSize: typography.small,
  paddingTop: 2,
  textAlign: "center",
}))
