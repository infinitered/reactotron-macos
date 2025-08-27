import React from "react"
import { Animated, View, ViewStyle, StyleSheet } from "react-native"
import { useTheme, useThemeName, withTheme } from "../../theme/theme"
import { AnimatedReactotronLogo } from "./AnimatedReactotronLogo"
import { useSidebarAnimationProgress } from "./useSidebarAnimationProgress"
import { SidebarMenu } from "./SidebarMenu"

// Expanded sidebar width in px
const EXPANDED_WIDTH = 250

// Collapsed sidebar width in px
const COLLAPSED_WIDTH = 60

export const Sidebar = () => {
  const [themeName] = useThemeName()
  const theme = useTheme(themeName)
  const { progress, mounted } = useSidebarAnimationProgress()

  const animatedWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [COLLAPSED_WIDTH, EXPANDED_WIDTH],
  })

  return (
    <Animated.View style={{ width: animatedWidth, overflow: "hidden" }}>
      <View style={$container(theme)}>
        <View style={$content(themeName)}>
          <AnimatedReactotronLogo progress={progress} mounted={mounted} />
          <SidebarMenu progress={progress} mounted={mounted} collapsedWidth={COLLAPSED_WIDTH} />
        </View>
      </View>
    </Animated.View>
  )
}

const $container = (theme: any): ViewStyle => ({
  flex: 1,
  overflow: "hidden",
  backgroundColor: theme.colors.navigation,
  borderWidth: StyleSheet.hairlineWidth,
  borderColor: theme.colors.keyline,
  // RN macOS doesn't seem to support borderBottomWidth so it's all or nothing
  // This makes it so we don't get a double border from the Titlebar border
  marginTop: -StyleSheet.hairlineWidth,
})

const $content = withTheme<ViewStyle>((theme) => ({
  flex: 1,
  padding: theme.spacing.sm,
}))
