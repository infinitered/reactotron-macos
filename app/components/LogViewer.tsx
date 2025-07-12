import { FlatList, Text, View, StyleSheet } from "react-native"
import { useGlobal } from "../state/useGlobal"
import { LogEntry } from "../types"
import { useThemeName, useTheme } from "../theme/theme"

export function LogViewer() {
  const [logs] = useGlobal<LogEntry[]>("logs", [])

  return (
    <FlatList<LogEntry>
      data={logs}
      renderItem={({ item, index }) => (
        <LogEntryView entry={item} prevDate={index > 0 ? logs[index - 1].date : undefined} />
      )}
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

function formatDelta(current: string, prev?: string) {
  if (!prev) return ""
  const delta = new Date(current).getTime() - new Date(prev).getTime()
  return `+${delta}ms`
}

function LogEntryView({ entry, prevDate }: { entry: LogEntry; prevDate?: string }) {
  const [themeName] = useThemeName()
  const { colors, spacing, typography } = useTheme(themeName)
  const { payload } = entry

  // Determine log level and color
  let level: string = "DEBUG"
  let color: string = colors.neutral
  if (payload.level === "warn") {
    level = "WARN"
    color = colors.primary
  } else if (payload.level === "error") {
    level = "ERROR"
    color = colors.danger
  }

  const time = formatTime(entry.date)
  const delta = formatDelta(entry.date, prevDate)

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "flex-start",
        backgroundColor: colors.cardBackground,
        borderRadius: 8,
        paddingVertical: spacing.xs,
        paddingHorizontal: spacing.sm,
        marginVertical: spacing.xxs,
        marginHorizontal: spacing.xs,
        gap: spacing.sm,
      }}
    >
      <View style={styles.timeDeltaColumn}>
        <Text
          style={[
            styles.time,
            {
              color: colors.neutral,
              fontFamily: typography.code.normal,
              fontSize: typography.caption,
            },
          ]}
        >
          {time}
        </Text>
        <Text
          style={[
            styles.delta,
            {
              color: colors.neutral,
              fontFamily: typography.code.normal,
              fontSize: typography.caption * 0.95,
            },
          ]}
        >
          {delta}
        </Text>
      </View>
      <Text
        style={{
          color,
          fontWeight: "bold",
          fontSize: typography.caption,
          minWidth: 48,
          textAlign: "right",
          fontFamily: typography.code.normal,
          marginRight: spacing.sm,
        }}
      >
        {level}
      </Text>
      <Text
        style={{
          color: colors.mainText,
          fontFamily: typography.code.normal,
          fontSize: typography.body,
          flex: 1,
        }}
      >
        {Array.isArray(payload.message) ? payload.message[0] : payload.message}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  delta: {
    marginRight: 0,
    minWidth: 55,
    opacity: 0.7,
    textAlign: "left",
  },
  time: {
    marginRight: 0,
    minWidth: 90,
    textAlign: "left",
  },
  timeDeltaColumn: {
    alignItems: "flex-start",
    flexDirection: "column",
    justifyContent: "center",
    marginRight: 8,
    minWidth: 90,
  },
})
