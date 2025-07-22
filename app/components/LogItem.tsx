import { Text, View, type ViewStyle, type TextStyle, Pressable } from "react-native"
import { useThemeName, withTheme, type ThemeName, useTheme } from "../theme/theme"
import { Log } from "../types"
import ActionButton from "./ActionButton"
import { useGlobal } from "../state/useGlobal"

interface LogItemProps {
  item: Log
}

function LogItem({ item }: LogItemProps) {
  const [themeName] = useThemeName()
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

  const time = formatTime(date)
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
    <View style={$container(themeName, isOpen)}>
      <Pressable style={$topBarContainer} onPress={() => setIsOpen(!isOpen)}>
        <View style={$timestampContainer}>
          <Text style={$timestampText(themeName)}>{time}</Text>
          <Text style={$deltaText(themeName)}>+{deltaTime}ms</Text>
        </View>
        <View style={$titleContainer}>
          <View style={$titleText(themeName, important)}>
            {important && <Text style={$tagIcon}>🏷️</Text>}
            <Text style={$titleLabel(themeName, important)}>{level}</Text>
          </View>
        </View>
        {!isOpen && (
          <View style={$previewContainer}>
            <Text style={$previewText(themeName)} numberOfLines={1}>
              {preview}
            </Text>
          </View>
        )}
        {isOpen && toolbar && (
          <View style={$toolbarContainer}>
            {toolbar.map((action, idx) => (
              <ActionButton key={idx} icon={action.icon} onClick={() => action.onClick()} />
            ))}
          </View>
        )}
        <View style={$spacer} />
        <View style={$expandIconContainer}>
          <Text style={$expandIcon(themeName)}>{isOpen ? "▲" : "▼"}</Text>
        </View>
      </Pressable>
      {isOpen && (
        <View style={$childrenContainer}>
          <View style={$messageContainer}>
            <Text style={$messageLabel(themeName)}>Message:</Text>
            <Text style={$messageText(themeName)}>{message.toString()}</Text>
          </View>
          {Array.isArray(payload.message) && payload.message.length > 1 && (
            <View style={$stackContainer}>
              <Text style={$messageLabel(themeName)}>Stack:</Text>
              {(payload.message as any[]).slice(1).map((line: any, idx: number) => (
                <Text key={idx} style={$stackText(themeName)}>
                  {line.toString()}
                </Text>
              ))}
            </View>
          )}
          {payload.level === "error" && "stack" in payload && (
            <View style={$stackContainer}>
              <Text style={$messageLabel(themeName)}>Stack Trace:</Text>
              {Array.isArray(payload.stack) ? (
                payload.stack.map((frame: any, idx: number) => (
                  <Text key={idx} style={$stackText(themeName)}>
                    {typeof frame === "string"
                      ? frame
                      : `${frame.functionName} (${frame.fileName}:${frame.lineNumber})`}
                  </Text>
                ))
              ) : (
                <Text style={$stackText(themeName)}>{payload.stack}</Text>
              )}
            </View>
          )}
        </View>
      )}
    </View>
  )
}

function formatTime(dateString: string) {
  const date = new Date(dateString)
  return (
    date.toLocaleTimeString([], { hour12: false }) +
    "." +
    String(date.getMilliseconds()).padStart(3, "0")
  )
}

const $container = (themeName: ThemeName, isOpen: boolean): ViewStyle => {
  const theme = useTheme(themeName)
  return {
    flexDirection: "column",
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: isOpen ? theme.colors.cardBackground : theme.colors.background,
  }
}

const $topBarContainer: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "flex-start",
  padding: 15,
}

const $timestampContainer: ViewStyle = {
  paddingRight: 10,
  paddingTop: 4,
}

const $timestampText = withTheme<TextStyle>(({ colors, typography }) => ({
  color: colors.neutral,
  fontFamily: typography.code.normal,
  fontSize: typography.caption,
  marginRight: 0,
  minWidth: 90,
  textAlign: "left",
}))

const $deltaText = withTheme<TextStyle>(({ colors, typography }) => ({
  color: colors.neutral,
  fontFamily: typography.code.normal,
  fontSize: typography.caption * 0.95,
  marginRight: 0,
  minWidth: 55,
  opacity: 0.7,
  textAlign: "left",
}))

const $titleContainer: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  width: 168,
}

const $titleText = (themeName: ThemeName, isImportant: boolean): ViewStyle => {
  const theme = useTheme(themeName)
  return {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: isImportant ? theme.colors.primary : "transparent",
    borderRadius: 4,
    padding: 4,
  }
}

const $titleLabel = (themeName: ThemeName, isImportant: boolean): TextStyle => {
  const theme = useTheme(themeName)
  return {
    color: isImportant ? theme.colors.background : theme.colors.primary,
    fontSize: 12,
    fontWeight: "500",
  }
}

const $tagIcon: TextStyle = {
  marginRight: 4,
  fontSize: 12,
}

const $previewContainer: ViewStyle = {
  flex: 1,
  paddingTop: 4,
}

const $previewText = withTheme<TextStyle>(({ colors, typography }) => ({
  color: colors.mainText,
  fontFamily: typography.code.normal,
  fontSize: typography.body,
}))

const $toolbarContainer: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
}

const $spacer: ViewStyle = {
  flex: 1,
}

const $expandIconContainer: ViewStyle = {
  alignItems: "center",
  justifyContent: "center",
}

const $expandIcon = withTheme<TextStyle>(({ colors }) => ({
  color: colors.mainText,
  fontSize: 16,
}))

const $childrenContainer: ViewStyle = {
  paddingHorizontal: 40,
  paddingBottom: 30,
}

const $messageContainer: ViewStyle = {
  marginBottom: 16,
}

const $messageLabel = withTheme<TextStyle>(({ colors, typography }) => ({
  color: colors.neutral,
  fontFamily: typography.code.normal,
  fontSize: typography.caption,
  fontWeight: "bold",
  marginBottom: 8,
}))

const $messageText = withTheme<TextStyle>(({ colors, typography }) => ({
  color: colors.mainText,
  fontFamily: typography.code.normal,
  fontSize: typography.body,
  flex: 1,
}))

const $stackContainer: ViewStyle = {
  marginBottom: 16,
}

const $stackText = withTheme<TextStyle>(({ colors, typography }) => ({
  color: colors.mainText,
  fontFamily: typography.code.normal,
  fontSize: typography.caption,
  marginBottom: 2,
}))

export default LogItem
