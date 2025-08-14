import { useTheme, useThemeName } from "../theme/theme"
import { View } from "react-native-macos"

/**
 * A simple separator component that is used to separate items in a list.
 */
export const Separator = () => {
  const [themeName] = useThemeName()
  const theme = useTheme(themeName)
  return (
    <View
      style={{
        height: 1,
        marginHorizontal: theme.spacing.md,
        backgroundColor: theme.colors.neutralVery,
      }}
    />
  )
}
