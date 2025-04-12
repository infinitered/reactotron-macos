import { Pressable, Text, ViewStyle, TextStyle } from "react-native"

const Theme = {
  highlight: "hsl(290, 3.2%, 47.4%)", // Active color
  foregroundLight: "#c3c3c3", // Inactive color
  fontFamily: "Space Grotesk",
}

interface Props {
  icon: string
  text: string
  isActive: boolean
  onClick: () => void
}

export function HeaderTab({ text, isActive, onClick }: Props) {
  const $tc: TextStyle = { color: isActive ? Theme.highlight : Theme.foregroundLight }
  return (
    <Pressable style={$container} onPress={onClick}>
      {/* {icon && <Icon size={32} color={isActive ? Theme.highlight : Theme.foregroundLight} />} */}
      <Text style={[$title, $tc]}>{text}</Text>
    </Pressable>
  )
}

const $container: ViewStyle = {
  alignItems: "center",
  flexDirection: "column", // Stack icon and text vertically
  marginHorizontal: 10,
  paddingVertical: 15,
}

const $title: TextStyle = {
  fontSize: 12,
  paddingTop: 2,
  textAlign: "center",
}
