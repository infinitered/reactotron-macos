import type { ClientData } from "../types"
import { useGlobal } from "../state/useGlobal"
import { useThemeName, withTheme } from "../theme/theme"
import { Pressable, Text, TextStyle, ViewStyle } from "react-native"

const tabgroup = "activeClientId"

export function ClientTab({ clientId }: { clientId: string }) {
  const [theme] = useThemeName()
  const [clientData] = useGlobal<ClientData>(`client-${clientId}`, {})

  const label: string = (clientData?.name ?? clientId) + "\n"
  const os: string = clientData?.platform ?? "Unknown"

  const [activeTab, setActiveTab] = useGlobal(tabgroup, label, { persist: true })
  const active = activeTab === label

  return (
    <Pressable key={clientId} onPress={() => setActiveTab(label)} style={$container(theme)}>
      <Text style={[$tab(theme), active ? $tabActive(theme) : {}]}>{label}</Text>
      <Text style={$os(theme)}>{os}</Text>
    </Pressable>
  )
}

const $container = withTheme<ViewStyle>(({ spacing }) => ({
  flexDirection: "column",
  alignItems: "flex-start",
  gap: spacing.xxs,
  cursor: "pointer",
}))

const $tab = withTheme<TextStyle>(({ spacing, colors }) => ({
  fontSize: spacing.md,
  color: colors.mainText,
}))

const $tabActive = withTheme<TextStyle>(({ colors }) => ({
  borderBottomColor: colors.primary,
  color: colors.mainText,
  textDecorationLine: "underline",
}))

const $os = withTheme<TextStyle>(({ colors }) => ({
  fontSize: 12,
  color: colors.mainText,
}))
