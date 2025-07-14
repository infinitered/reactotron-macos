import { FlatList, Text, View, ViewStyle, TextStyle } from "react-native"
import { useGlobal } from "../state/useGlobal"
import { LogEntry } from "../types"
import { useThemeName, withTheme } from "../theme/theme"

export function LogViewer() {
  const [logs] = useGlobal<LogEntry[]>("logs", [])
  return (
    <FlatList<LogEntry>
      data={logs}
      renderItem={({ item }) => <LogEntryView entry={item} />}
      keyExtractor={(item) => item.messageId.toString()}
    />
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

function LogEntryView({ entry }: { entry: LogEntry }) {
  const [themeName] = useThemeName()
  const { payload } = entry

  // Determine log level and color
  let level: string = "DEBUG"
  let levelColor: "neutral" | "primary" | "danger" = "neutral"

  if (payload.level === "warn") {
    level = "WARN"
    levelColor = "primary"
  } else if (payload.level === "error") {
    level = "ERROR"
    levelColor = "danger"
  }

  const time = formatTime(entry.date)

  return (
    <View style={$logEntryContainer(themeName)}>
      <View style={$timeDeltaColumn}>
        <Text style={$timeText(themeName)}>{time}</Text>
        <Text style={$deltaText(themeName)}>+{entry.deltaTime}ms</Text>
      </View>
      <Text style={$levelTextWithColor(themeName, levelColor)}>{level}</Text>
      <Text style={$messageText(themeName)}>
        {Array.isArray(payload.message) ? payload.message[0] : payload.message}
      </Text>
    </View>
  )
}

const $logEntryContainer = withTheme<ViewStyle>(({ colors, spacing }) => ({
  flexDirection: "row",
  alignItems: "flex-start",
  backgroundColor: colors.cardBackground,
  borderRadius: 8,
  paddingVertical: spacing.xs,
  paddingHorizontal: spacing.sm,
  marginVertical: spacing.xxs,
  marginHorizontal: spacing.xs,
  gap: spacing.sm,
}))

const $timeDeltaColumn: ViewStyle = {
  alignItems: "flex-start",
  flexDirection: "column",
  justifyContent: "center",
  marginRight: 8,
  minWidth: 90,
}

const $timeText = withTheme<TextStyle>(({ colors, typography }) => ({
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

const $levelText = withTheme<TextStyle>(({ colors, typography, spacing }) => ({
  color: colors.neutral,
  fontWeight: "bold",
  fontSize: typography.caption,
  minWidth: 48,
  textAlign: "right",
  fontFamily: typography.code.normal,
  marginRight: spacing.sm,
}))

const $levelTextWithColor = (themeName: any, levelColor: "neutral" | "primary" | "danger") => {
  const base = $levelText(themeName)
  const colors = {
    neutral: $levelText(themeName).color,
    primary: withTheme(({ colors }) => colors.primary)(themeName),
    danger: withTheme(({ colors }) => colors.danger)(themeName),
  }
  return {
    ...base,
    color: colors[levelColor],
  }
}

const $messageText = withTheme<TextStyle>(({ colors, typography }) => ({
  color: colors.mainText,
  fontFamily: typography.code.normal,
  fontSize: typography.body,
  flex: 1,
}))
