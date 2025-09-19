import { View } from "react-native"
import { themed } from "../theme/theme"
import { ViewStyle, StyleProp } from "react-native"

export function Divider({ extraStyles }: { extraStyles?: StyleProp<ViewStyle> }) {
  return <View style={[$divider(), extraStyles]} />
}

const $divider = themed<ViewStyle>(({ colors }) => ({
  height: 1,
  backgroundColor: colors.border,
  width: "100%",
}))
