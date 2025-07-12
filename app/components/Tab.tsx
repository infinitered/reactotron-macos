import { Pressable, Text, TextStyle, type ViewStyle } from "react-native"
import { useThemeName, withTheme } from "../theme/theme"
import { useGlobal } from "../state/useGlobal"

/**
 * Tabgroup is a string that persists the active tab for a given tab group.
 * For example, if you have a tab group for "activeClient", you can use it
 * with useGlobal/withGlobal to retrieve which tab is currently active.
 */
export function Tab({ id, label, tabgroup }: { id: string; label: string; tabgroup: string }) {
  const [theme] = useThemeName()
  const [activeTab, setActiveTab] = useGlobal(tabgroup, label, { persist: true })
  const active = activeTab === label

  return (
    <Pressable key={id} onPress={() => setActiveTab(label)}>
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
