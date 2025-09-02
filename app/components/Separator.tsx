import { themed } from "../theme/theme"
import { View, ViewStyle } from "react-native-macos"

/**
 * A simple separator component that is used to separate items in a list.
 */
export const Separator = () => {
  return <View style={$separator()} />
}

const $separator = themed<ViewStyle>(({ spacing, colors }) => ({
  height: 1,
  marginHorizontal: spacing.md,
  backgroundColor: colors.neutralVery,
}))
