import { Pressable, Text, TextStyle, type ViewStyle } from "react-native"
import { themed } from "../theme/theme"
import { useGlobal } from "../state/useGlobal"

/**
 * A tab component for the <Tabs> component.
 *
 * FYI: tabgroup is a string that persists the active tab for a given tab group.
 * For example, if you have a tab group for "activeClient", you can use it
 * with useGlobal/withGlobal to retrieve which tab is currently active.
 */
export function Tab({ id, label, tabgroup }: { id: string; label: string; tabgroup: string }) {
  const [activeTab, setActiveTab] = useGlobal(tabgroup, label, { persist: true })
  const active = activeTab === label

  return (
    <Pressable key={id} onPress={() => setActiveTab(label)}>
      <Text style={[$tab(), active ? $tabActive() : {}]}>{label}</Text>
    </Pressable>
  )
}

const $tab = themed<ViewStyle>(({ spacing, colors }) => ({
  fontSize: spacing.md,
  color: colors.mainText,
  borderWidth: 3,
  borderColor: colors.border,
  borderStyle: "solid",
  paddingBottom: spacing.xxs,
  marginRight: spacing.md,
  cursor: "pointer",
}))

const $tabActive = themed<TextStyle>(({ colors }) => ({
  borderBottomColor: colors.primary,
  color: colors.mainText,
  textDecorationLine: "underline",
}))
