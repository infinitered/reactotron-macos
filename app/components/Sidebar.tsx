import { useEffect, useRef } from "react"
import { Animated, View, ViewStyle } from "react-native"
import { useTheme, useThemeName, withTheme } from "../theme/theme"
import { useSidebar } from "../state/useSidebar"

interface SidebarProps {
  width?: number
}

export const Sidebar = ({ width = 250 }: SidebarProps) => {
  const [themeName] = useThemeName()
  const theme = useTheme(themeName)
  const { isOpen } = useSidebar()

  const animatedWidth = useRef(new Animated.Value(isOpen ? width : 0)).current

  useEffect(() => {
    const duration = isOpen ? 300 : 250

    Animated.timing(animatedWidth, {
      toValue: isOpen ? width : 0,
      duration,
      useNativeDriver: false, // Width animations can't use native driver
    }).start()
  }, [isOpen, width, animatedWidth])

  return (
    <Animated.View
      style={[
        $container(theme),
        {
          width: animatedWidth,
        },
      ]}
    >
      <View style={$content(themeName)}>
        {/* Sidebar content will go here */}
      </View>
    </Animated.View>
  )
}

const $container = (theme: any): ViewStyle => ({
  backgroundColor: theme.colors.cardBackground,
  borderRightWidth: 1,
  borderRightColor: theme.colors.neutral,
  overflow: "hidden",
})

const $content = withTheme<ViewStyle>((theme) => ({
  flex: 1,
  padding: theme.spacing.md,
}))