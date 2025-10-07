import type { ClientData } from "../types"
import { useGlobal } from "../state/useGlobal"
import { themed } from "../theme/theme"
import { Pressable, Text, TextStyle, View, ViewStyle } from "react-native"

const tabgroup = "activeClientId"

export function ClientTab({ clientId }: { clientId: string }) {
  const [clientData] = useGlobal<ClientData>(`client-${clientId}`, {} as ClientData)
  const label: string = clientData?.name ?? clientId
  const platformVersion: string = clientData?.platformVersion ?? ""

  const [activeTab, setActiveTab] = useGlobal(tabgroup, label)
  const active = activeTab === clientId

  const getOsLabel = (os: string) => {
    switch (os) {
      case "ios":
        return "iOS"
      case "android":
        return "Android"
      default:
        return "Unknown OS"
    }
  }

  return (
    <View style={[$container(), active && $containerActive()]}>
      <Pressable key={clientId} onPress={() => setActiveTab(clientId)}>
        <Text numberOfLines={2} style={[$tab(), active && $tabActive()]}>
          {`${label} - ${getOsLabel(clientData?.platform)} ${platformVersion}`}
        </Text>
      </Pressable>
    </View>
  )
}

const $containerActive = themed<ViewStyle>(({ colors }) => ({
  backgroundColor: colors.cardBackground,
}))

const $container = themed<ViewStyle>(({ spacing }) => ({
  gap: spacing.xxs,
  cursor: "pointer",
  borderTopLeftRadius: 8,
  borderTopRightRadius: 8,
  height: 32,
  alignItems: "center",
  justifyContent: "center",
  paddingHorizontal: spacing.xl,
}))

const $tabActive = themed<TextStyle>(() => ({
  fontWeight: "600",
}))

const $tab = themed<TextStyle>(({ colors }) => ({
  fontSize: 14,
  color: colors.mainText,
  textAlign: "center",
}))
