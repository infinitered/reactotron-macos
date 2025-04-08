import { useEffect, useRef } from "react"
import { Pressable, Animated, ViewStyle, TextStyle } from "react-native"

// Define theme colors directly or import from a theme file
// TODO: Replace with theme variables if available
const Theme = {
  highlight: "hsl(290, 3.2%, 47.4%)", // Active color
  foregroundLight: "#c3c3c3", // Inactive color
}

interface Props {
  icon: React.ElementType<{ color: string | Animated.AnimatedInterpolation<string>; size: number }>
  text: string
  isActive: boolean
  onClick: () => void
}

// Define styles as constant objects
const $container: ViewStyle = {
  alignItems: "center",
  flexDirection: "column", // Stack icon and text vertically
  marginHorizontal: 10, // Replaces 'margin: 0 10px'
  paddingVertical: 15, // Replaces 'padding: 15px 0'
}

const $title: TextStyle = {
  // TODO: Add fontFamily from theme if needed
  fontSize: 12,
  paddingTop: 2,
  textAlign: "center",
}

function HeaderTabButton({ icon: Icon, text, isActive, onClick }: Props) {
  // Use Animated.Value for the animation state (0 for inactive, 1 for active)
  const animation = useRef(new Animated.Value(isActive ? 1 : 0)).current

  // Animate the value when isActive changes
  useEffect(() => {
    Animated.spring(animation, {
      toValue: isActive ? 1 : 0,
      useNativeDriver: false, // Color animation often requires useNativeDriver: false
      // TODO: Adjust spring parameters if needed (stiffness, damping)
    }).start()
  }, [isActive, animation])

  // Interpolate color based on the animation value
  const animatedColor = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [Theme.foregroundLight, Theme.highlight], // Inactive to Active color
  })

  return (
    <Pressable style={$container} onPress={onClick}>
      {/* Pass the animated color to the Icon component */}
      {Icon && <Icon color={animatedColor} size={32} />}
      {/* Apply animated color to the Text */}
      <Animated.Text style={[$title, { color: animatedColor }]}>{text}</Animated.Text>
    </Pressable>
  )
}

export default HeaderTabButton
