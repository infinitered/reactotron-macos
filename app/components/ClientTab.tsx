import type { ClientData } from "../types"
import { useGlobal } from "../state/useGlobal"
import { themed } from "../theme/theme"
import { Pressable, Text, TextStyle, ViewStyle } from "react-native"

const tabgroup = "activeClientId"

export function ClientTab({ clientId }: { clientId: string }) {
  const [clientData] = useGlobal<ClientData>(`client-${clientId}`, {} as ClientData)

  const label: string = (clientData?.name ?? clientId) + "\n"
  const os: string = clientData?.platform ?? "Unknown"

  const [activeTab, setActiveTab] = useGlobal(tabgroup, label)
  const active = activeTab === clientId

  return (
    <Pressable key={clientId} onPress={() => setActiveTab(clientId)} style={$container()}>
      <Text style={[$tab(), active ? $tabActive() : {}]}>{label}</Text>
      <Text style={$os()}>{os}</Text>
    </Pressable>
  )
}

const $container = themed<ViewStyle>(({ spacing }) => ({
  flexDirection: "column",
  alignItems: "flex-start",
  gap: spacing.xxs,
  cursor: "pointer",
}))

const $tab = themed<TextStyle>(({ spacing, colors }) => ({
  fontSize: spacing.md,
  color: colors.mainText,
}))

const $tabActive = themed<TextStyle>(({ colors }) => ({
  borderBottomColor: colors.primary,
  color: colors.mainText,
  textDecorationLine: "underline",
}))

const $os = themed<TextStyle>(({ colors }) => ({
  fontSize: 12,
  color: colors.mainText,
}))
