import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  Profiler,
  ProfilerOnRenderCallback,
} from "react"
import { View, Text, TouchableOpacity, Alert, ViewStyle, TextStyle } from "react-native"
import { FlatList } from "react-native"
import { LegendList } from "@legendapp/list"
import { useThemeName, withTheme } from "../theme/theme"

interface LogEntry {
  messageId: string
  date: string
  deltaTime: number
  payload: {
    level: "debug" | "warn" | "error"
    message: string | string[]
  }
}

interface TestConfig {
  itemCount: number
  itemHeight: number
  testDuration: number
  updateFrequency: number
}

const onRenderCallback: ProfilerOnRenderCallback = (
  id,
  phase,
  actualDuration,
  _baseDuration,
  _startTime,
  _commitTime,
) => {
  console.log(`${id} [${phase}]: ${actualDuration.toFixed(1)}ms`)
}

const generateLogEntries = (count: number): LogEntry[] => {
  const levels: ("debug" | "warn" | "error")[] = ["debug", "warn", "error"]
  const messages = [
    "System initialized successfully",
    "Database connection established",
    "User authentication failed",
    "API request timeout",
    "Memory usage warning",
    "Cache invalidated",
    "Network error detected",
    "Data synchronization complete",
    "Configuration updated",
    "Service restart required",
  ]

  const now = Date.now()

  return Array.from({ length: count }, (_, index) => ({
    messageId: `${now}-${index}-${Math.random().toString(36).slice(2, 8)}`,
    date: new Date(Date.now() - Math.random() * 86400000).toISOString(),
    deltaTime: Math.floor(Math.random() * 1000),
    payload: {
      level: levels[Math.floor(Math.random() * levels.length)],
      message:
        Math.random() > 0.8
          ? [messages[Math.floor(Math.random() * messages.length)], "Additional context"]
          : messages[Math.floor(Math.random() * messages.length)],
    },
  }))
}

const TEST_CONFIGS: { [key: string]: TestConfig } = {
  light: {
    itemCount: 1000,
    itemHeight: 60,
    testDuration: 10,
    //testDuration: 30,
    updateFrequency: 5,
  },
  medium: {
    itemCount: 5000,
    itemHeight: 60,
    testDuration: 10,
    //testDuration: 60,
    updateFrequency: 10,
  },
  heavy: {
    itemCount: 10000,
    itemHeight: 60,
    testDuration: 10,
    //testDuration: 120,
    updateFrequency: 20,
  },
  extreme: {
    itemCount: 50000,
    itemHeight: 60,
    testDuration: 10,
    //testDuration: 300,
    updateFrequency: 50,
  },
}

const LogEntryComponent = ({ item }: { item: LogEntry }) => {
  const [themeName] = useThemeName()
  const { payload } = item

  let level: string = "DEBUG"
  let levelColor: "neutral" | "primary" | "danger" = "neutral"

  if (payload.level === "warn") {
    level = "WARN"
    levelColor = "primary"
  } else if (payload.level === "error") {
    level = "ERROR"
    levelColor = "danger"
  }

  const time = formatTime(item.date)

  return (
    <View style={$logEntryContainer(themeName)}>
      <View style={$timeDeltaColumn}>
        <Text style={$timeText(themeName)}>{time}</Text>
        <Text style={$deltaText(themeName)}>+{item.deltaTime}ms</Text>
      </View>
      <Text style={$levelTextWithColor(themeName, levelColor)}>{level}</Text>
      <Text style={$messageText(themeName)}>
        {Array.isArray(payload.message) ? payload.message[0] : payload.message}
      </Text>
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

export const LogViewerTest = () => {
  const [themeName] = useThemeName()
  const [selectedConfig, setSelectedConfig] = useState<keyof typeof TEST_CONFIGS>("light")
  const [currentList, setCurrentList] = useState<"legend" | "flatlist">("legend")
  const [data, setData] = useState<LogEntry[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const config = TEST_CONFIGS[selectedConfig]

  useEffect(() => {
    const initialData = generateLogEntries(config.itemCount)
    setData(initialData)
  }, [selectedConfig])

  useEffect(() => {
    if (!isRunning) return

    const interval = setInterval(() => {
      const newEntries = generateLogEntries(config.updateFrequency)
      setData((prevData) => [
        ...newEntries,
        ...prevData.slice(0, config.itemCount - config.updateFrequency),
      ])
    }, 1000)

    return () => clearInterval(interval)
  }, [isRunning, config])

  const startStressTest = useCallback(async () => {
    setIsRunning(true)

    setTimeout(() => {
      setIsRunning(false)
    }, config.testDuration * 1000)
  }, [currentList, config])

  const switchList = useCallback(
    (listType: "legend" | "flatlist") => {
      if (isRunning) {
        Alert.alert("Test in Progress", "Please wait for the current test to complete.")
        return
      }
      setCurrentList(listType)
    },
    [isRunning],
  )

  const renderList = useMemo(() => {
    if (currentList === "legend") {
      return (
        <Profiler id="LegendList" onRender={onRenderCallback}>
          <LegendList<LogEntry>
            data={data}
            renderItem={LogEntryComponent}
            keyExtractor={(item) => item.messageId.toString()}
            estimatedItemSize={config.itemHeight}
            style={$list(themeName)}
          />
        </Profiler>
      )
    }

    return (
      <Profiler id="FlatList" onRender={onRenderCallback}>
        <FlatList
          data={data}
          renderItem={({ item }) => <LogEntryComponent item={item} />}
          keyExtractor={(item) => item.messageId.toString()}
          //getItemLayout={(data, index) => ({
          //  length: config.itemHeight,
          //  offset: config.itemHeight * index,
          //  index,
          //})}
          //removeClippedSubviews
          //maxToRenderPerBatch={10}
          //windowSize={10}
          //initialNumToRender={20}
          style={$list(themeName)}
        />
      </Profiler>
    )
  }, [currentList, data, config])

  return (
    <View style={$container(themeName)}>
      <View style={$header(themeName)}>
        <Text style={$title(themeName)}>List Performance Stress Test</Text>

        <View style={$configSelector}>
          {Object.keys(TEST_CONFIGS).map((configKey) => (
            <TouchableOpacity
              key={configKey}
              style={[
                $configButton(themeName),
                selectedConfig === configKey && $selectedConfigButton(themeName),
              ]}
              onPress={() => setSelectedConfig(configKey as keyof typeof TEST_CONFIGS)}
              disabled={isRunning}
            >
              <Text style={$configButtonText(themeName)}>{configKey.toUpperCase()}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={$listSelector}>
          <TouchableOpacity
            style={[
              $listButton(themeName),
              currentList === "legend" && $selectedListButton(themeName),
            ]}
            onPress={() => switchList("legend")}
            disabled={isRunning}
          >
            <Text style={$listButtonText(themeName)}>LegendList</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              $listButton(themeName),
              currentList === "flatlist" && $selectedListButton(themeName),
            ]}
            onPress={() => switchList("flatlist")}
            disabled={isRunning}
          >
            <Text style={$listButtonText(themeName)}>FlatList</Text>
          </TouchableOpacity>
        </View>

        <View style={$controls}>
          <TouchableOpacity
            style={[$testButton(themeName), isRunning && $disabledButton(themeName)]}
            onPress={startStressTest}
            disabled={isRunning}
          >
            <Text style={$testButtonText(themeName)}>
              {isRunning ? "Testing..." : "Start Stress Test"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={$testInfo}>
          <Text style={$infoText(themeName)}>
            Config: {selectedConfig} | Items: {config.itemCount} | Duration: {config.testDuration}s
          </Text>
          <Text style={$infoText(themeName)}>
            Current List: {currentList.toUpperCase()} | Updates: {config.updateFrequency}/s
          </Text>
          {isRunning && <Text style={$runningText(themeName)}>🔄 Test in progress...</Text>}
        </View>
      </View>

      <View style={$listContainer}>{renderList}</View>
    </View>
  )
}

const $container = withTheme<ViewStyle>(({ colors }) => ({
  flex: 1,
  backgroundColor: colors.background,
}))

const $header = withTheme<ViewStyle>(({ colors, spacing }) => ({
  padding: spacing.md,
  backgroundColor: colors.cardBackground,
  borderBottomWidth: 1,
}))

const $title = withTheme<TextStyle>(({ colors, typography }) => ({
  fontSize: typography.heading,
  fontWeight: "bold",
  color: colors.mainText,
  marginBottom: 16,
  textAlign: "center",
}))

const $configSelector: ViewStyle = {
  flexDirection: "row",
  justifyContent: "center",
  gap: 16,
  marginBottom: 16,
}

const $configButton = withTheme<ViewStyle>(({ colors, spacing }) => ({
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.xs,
  backgroundColor: colors.neutral,
  borderRadius: 4,
}))

const $selectedConfigButton = withTheme<ViewStyle>(({ colors }) => ({
  backgroundColor: colors.primary,
}))

const $configButtonText = withTheme<TextStyle>(({ colors, typography }) => ({
  color: colors.cardBackground,
  fontSize: typography.caption,
  fontWeight: "600",
}))

const $listSelector: ViewStyle = {
  flexDirection: "row",
  justifyContent: "center",
  marginBottom: 16,
}

const $listButton = withTheme<ViewStyle>(({ colors, spacing }) => ({
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.sm,
  backgroundColor: colors.neutral,
  borderRadius: 4,
  marginHorizontal: spacing.xs,
}))

const $selectedListButton = withTheme<ViewStyle>(({ colors }) => ({
  backgroundColor: colors.primary,
}))

const $listButtonText = withTheme<TextStyle>(({ colors, typography }) => ({
  color: colors.cardBackground,
  fontSize: typography.body,
  fontWeight: "600",
}))

const $controls: ViewStyle = {
  alignItems: "center",
  marginBottom: 16,
}

const $testButton = withTheme<ViewStyle>(({ colors, spacing }) => ({
  paddingHorizontal: spacing.lg,
  paddingVertical: spacing.sm,
  backgroundColor: colors.success,
  borderRadius: 6,
}))

const $disabledButton = withTheme<ViewStyle>(({ colors }) => ({
  backgroundColor: colors.neutral,
  opacity: 0.6,
}))

const $testButtonText = withTheme<TextStyle>(({ colors, typography }) => ({
  color: colors.cardBackground,
  fontSize: typography.body,
  fontWeight: "600",
}))

const $testInfo: ViewStyle = {
  alignItems: "center",
}

const $infoText = withTheme<TextStyle>(({ colors, typography }) => ({
  fontSize: typography.caption,
  color: colors.neutral,
  marginBottom: 2,
}))

const $runningText = withTheme<TextStyle>(({ colors, typography }) => ({
  fontSize: typography.body,
  color: colors.primary,
  marginTop: 4,
}))

const $listContainer: ViewStyle = {
  flex: 1,
}

const $list = withTheme<ViewStyle>(() => ({
  flex: 1,
}))

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
