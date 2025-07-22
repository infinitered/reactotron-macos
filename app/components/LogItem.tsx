import { Text, View, type ViewStyle, type TextStyle } from "react-native"
import { Log } from "../types"
import { useGlobal } from "../state/useGlobal"
import TimelineItem from "./TimelineItem"

interface LogItemProps {
  item: Log
}

function LogItem({ item }: LogItemProps) {
  const { payload, date, deltaTime, important } = item
  const [isOpen, setIsOpen] = useGlobal(`log-${item.messageId}-open`, false)

  // Determine log level and color
  let level: string = "DEBUG"
  let _levelColor: "neutral" | "primary" | "danger" = "neutral"

  if (payload.level === "warn") {
    level = "WARN"
    _levelColor = "primary"
  } else if (payload.level === "error") {
    level = "ERROR"
    _levelColor = "danger"
  }

  const message = Array.isArray(payload.message) ? payload.message[0] : payload.message
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

  return (
    <TimelineItem
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
      <View style={$messageContainer}>
        <Text style={$messageLabel}>Message:</Text>
        <Text style={$messageText}>{message.toString()}</Text>
      </View>
      {Array.isArray(payload.message) && payload.message.length > 1 && (
        <View style={$stackContainer}>
          <Text style={$messageLabel}>Stack:</Text>
          {(payload.message as any[]).slice(1).map((line: any, idx: number) => (
            <Text key={idx} style={$stackText}>
              {line.toString()}
            </Text>
          ))}
        </View>
      )}
      {payload.level === "error" && "stack" in payload && (
        <View style={$stackContainer}>
          <Text style={$messageLabel}>Stack Trace:</Text>
          {Array.isArray(payload.stack) ? (
            payload.stack.map((frame: any, idx: number) => (
              <Text key={idx} style={$stackText}>
                {typeof frame === "string"
                  ? frame
                  : `${frame.functionName} (${frame.fileName}:${frame.lineNumber})`}
              </Text>
            ))
          ) : (
            <Text style={$stackText}>{payload.stack}</Text>
          )}
        </View>
      )}
    </TimelineItem>
  )
}

const $messageContainer: ViewStyle = {
  marginBottom: 16,
}

const $messageLabel: TextStyle = {
  fontSize: 12,
  fontWeight: "bold",
  marginBottom: 8,
  opacity: 0.7,
}

const $messageText: TextStyle = {
  fontSize: 14,
  flex: 1,
}

const $stackContainer: ViewStyle = {
  marginBottom: 16,
}

const $stackText: TextStyle = {
  fontSize: 12,
  marginBottom: 2,
}

export default LogItem
