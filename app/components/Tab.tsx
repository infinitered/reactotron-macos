import { Pressable, Text, TextStyle } from "react-native"
import { useThemeName, withTheme } from "../theme/theme"

export function Tab({
  activeTab,
  label,
  onPress,
}: {
  activeTab: string
  label: string
  onPress: () => void
}) {
  const [theme] = useThemeName()
  return (
    <Pressable onPress={onPress}>
      <Text style={activeTab === "Example1" ? $tabActive(theme) : $tabInactive(theme)}>
        {label}
      </Text>
    </Pressable>
  )
}

const $tabActive = withTheme<TextStyle>(({ colors, spacing }) => ({
  fontSize: spacing.md,
  borderBottomWidth: 3,
  paddingBottom: spacing.xxs,
  marginRight: spacing.md,
  color: colors.mainText,
  borderBottomColor: colors.mainText,
}))

const $tabInactive = withTheme<TextStyle>(({ colors, spacing }) => ({
  fontSize: spacing.md,
  color: colors.mainText,
  borderBottomWidth: 3,
  borderBottomColor: "transparent",
  paddingBottom: spacing.xxs,
  marginRight: spacing.md,
}))
