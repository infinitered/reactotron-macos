import { themed, useThemeName, withTheme } from "../../theme/theme"
import { Animated, ImageStyle, View, ViewStyle } from "react-native-macos"

type AnimatedReactotronLogoProps = {
  progress: Animated.Value // 0 = collapsed, 1 = expanded (animated in the sidebar)
  mounted: boolean // tells us if the text/wordmark is mounted (only while expanded or animating open)
}

export const AnimatedReactotronLogo = ({ progress, mounted }: AnimatedReactotronLogoProps) => {
  const [themeName] = useThemeName()
  const logoScale = progress.interpolate({ inputRange: [0, 1], outputRange: [0.78, 1] })
  const logoTextOpacity = progress // fade out the reactotron text when collapsed

  return (
    <View style={$logoRow()}>
      <Animated.Image
        source={require("../../../assets/images/reactotronLogo.png")}
        style={[$logo, { transform: [{ scale: logoScale }] }]}
        resizeMode="contain"
      />
      {mounted && (
        <Animated.Image
          key={`${themeName}-reactotronText`}
          source={require("../../../assets/images/reactotronText.png")}
          style={[$logoText(), { opacity: logoTextOpacity }]}
          resizeMode="contain"
        />
      )}
    </View>
  )
}

const $logo = {
  width: 36,
  height: 36,
}

const $logoText = themed<ImageStyle>((theme) => ({
  height: 36 * 0.54, // this magic number is the aspect ratio of the logo text compared to the logo
  tintColor: theme.colors.mainText,
}))

const $logoRow = themed<ViewStyle>(({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.xs,
}))
