import { GestureResponderEvent, TouchableOpacity, ViewStyle } from "react-native"

interface ActionButtonProps {
  icon: React.ElementType<{ size: number }>
  onClick: (event: GestureResponderEvent) => void
  style?: ViewStyle
}

function ActionButton({ icon: Icon, onClick, style }: ActionButtonProps) {
  return (
    <TouchableOpacity style={[$container, style]} onPress={onClick} activeOpacity={0.7}>
      <Icon size={24} />
    </TouchableOpacity>
  )
}

const $container: ViewStyle = {
  marginHorizontal: 5,
  padding: 5,
  justifyContent: "center",
  alignItems: "center",
}

export default ActionButton
