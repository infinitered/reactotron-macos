import { Pressable, Text, TextStyle, View, ViewStyle } from "react-native"
import { useThemeName, withTheme } from "../theme/theme"
import { useGlobal } from "../state/useGlobal"

export function Tab({ label }: { label: string }) {
  const [theme] = useThemeName()
  const [activeTab, setActiveTab] = useGlobal("activeTab", label)
  const active = activeTab === label

  return (
    <Pressable onPress={() => setActiveTab(label)}>
      <Text style={[$tab(theme), active ? $tabActive(theme) : {}]}>{label}</Text>
    </Pressable>
  )
}

const $tab = withTheme<ViewStyle>(({ spacing, colors }) => ({
  fontSize: spacing.md,
  color: colors.mainText,
  borderWidth: 3,
  borderColor: colors.border,
  borderStyle: "solid",
  paddingBottom: spacing.xxs,
  marginRight: spacing.md,
  cursor: "pointer",
}))

const $tabActive = withTheme<TextStyle>(({ colors, spacing }) => ({
  borderBottomColor: colors.primary,
  color: colors.mainText,
  textDecorationLine: "underline",
}))
