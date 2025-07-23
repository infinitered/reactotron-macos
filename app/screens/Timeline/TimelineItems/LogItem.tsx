import { Text, View, type ViewStyle, type TextStyle } from "react-native"
import { TimelineItemLog } from "../../../types"
import { useGlobal } from "../../../state/useGlobal"
import TimelineRow from "../TimelineRow"
import { TreeView, objectToTree } from "../../../components/TreeView"
import { useThemeName, withTheme } from "../../../theme/theme"

type LogItemProps = { item: TimelineItemLog }

/**
 * A single log item in the timeline.
 */
export function LogItem({ item }: LogItemProps) {
  const [themeName] = useThemeName()
  const { payload, date, deltaTime, important } = item

  console.tron.log("LogItem", item)
  // Type guard to ensure this is a log item
  if (item.type !== "log") return null

  const [isOpen, setIsOpen] = useGlobal(`log-${item.messageId}-open`, false)

  // Determine log level and color
  let level: string = "DEBUG"
  let _levelColor: "neutral" | "primary" | "danger" = "neutral"

  if (payload?.level === "warn") {
    level = "WARN"
    _levelColor = "primary"
  } else if (payload?.level === "error") {
    level = "ERROR"
    _levelColor = "danger"
  }

  const message = Array.isArray(payload?.message) ? payload?.message[0] : payload?.message
  const preview =
    message.toString().substring(0, 100) + (message.toString().length > 100 ? "..." : "")

  // Mock toolbar actions - you can customize these based on your needs
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

  const tree = objectToTree({ payload })

  return (
    <TimelineRow
      title={level}
      date={new Date(date)}
      deltaTime={deltaTime}
      preview={preview}
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      toolbar={toolbar}
      isImportant={important}
      isTagged={important}
    >
      <View style={$payloadContainer}>
        <Text style={$sectionLabel(themeName)}>Payload:</Text>
        <TreeView data={tree} />
      </View>
    </TimelineRow>
  )
}

const $payloadContainer: ViewStyle = {
  marginBottom: 16,
}

const $sectionLabel = withTheme<TextStyle>(({ colors }) => ({
  fontSize: 14,
  fontWeight: "bold",
  marginBottom: 8,
  color: colors.mainText,
  opacity: 0.8,
}))
