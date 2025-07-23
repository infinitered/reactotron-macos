import { Text, View, type ViewStyle, type TextStyle } from "react-native"
import { TimelineItemNetwork } from "../../../types"
import { useGlobal } from "../../../state/useGlobal"
import TimelineRow from "../TimelineRow"
import { TreeView, objectToTree } from "../../../components/TreeView"
import { useTheme, useThemeName } from "../../../theme/theme"

type NetworkItemProps = { item: TimelineItemNetwork }

/**
 * A single network item in the timeline.
 */
export function NetworkItem({ item }: NetworkItemProps) {
  // Type guard to ensure this is a network item
  if (item.type !== "api.response") return null

  const { payload, date, deltaTime, important } = item
  const [isOpen, setIsOpen] = useGlobal(`network-${item.messageId}-open`, false)
  const [themeName] = useThemeName()
  const { colors } = useTheme(themeName)

  // Determine status and color
  let status: string = "UNKNOWN"
  let statusColor: string = colors.mainText
  let responseStatusCode: number | undefined

  if (payload?.response) {
    const response = payload?.response
    responseStatusCode = response?.status
    if (response?.status) {
      if (response.status >= 200 && response.status < 300) {
        status = "SUCCESS"
        statusColor = colors.success
      } else if (response.status >= 400 && response.status < 500) {
        status = "CLIENT ERROR"
        statusColor = colors.danger
      } else if (response.status >= 500) {
        status = "SERVER ERROR"
        statusColor = colors.danger
      } else {
        status = "INFO"
        statusColor = colors.neutral
      }
    } else if (payload?.error) {
      status = "ERROR"
      statusColor = colors.danger
    }
  } else if (payload?.request) {
    status = payload?.request?.method?.toUpperCase() || "REQUEST"
    statusColor = colors.neutral
  } else {
    status = "UNKNOWN"
    statusColor = colors.neutral
  }

  const preview = payload?.request
    ? `${payload?.request?.method || "GET"} ${payload?.request?.url || ""}`
    : payload?.response
    ? `${payload?.response?.status || ""} ${payload?.response?.statusText || ""}`
    : "UNKNOWN"

  const toolbar = [
    {
      icon: ({ size }: { size: number }) => <Text style={{ fontSize: size }}>📋</Text>,
      tip: "Copy to clipboard",
      onClick: () => console.log("Copy to clipboard"),
    },
    {
      icon: ({ size }: { size: number }) => <Text style={{ fontSize: size }}>🔍</Text>,
      tip: "Search similar",
      onClick: () => console.log("Search similar"),
    },
  ]

  return (
    <TimelineRow
      title={status}
      titleColor={statusColor}
      date={new Date(date)}
      deltaTime={deltaTime}
      preview={preview}
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      toolbar={toolbar}
      isImportant={important}
      isTagged={important}
      responseStatusCode={responseStatusCode}
    >
      <View style={$payloadContainer}>
        <Text style={$sectionLabel}>Payload:</Text>
        <TreeView data={objectToTree(payload, "payload")} />
      </View>
    </TimelineRow>
  )
}

const $payloadContainer: ViewStyle = {
  marginBottom: 16,
}

const $sectionLabel: TextStyle = {
  fontSize: 14,
  fontWeight: "bold",
  marginBottom: 8,
  opacity: 0.8,
}
