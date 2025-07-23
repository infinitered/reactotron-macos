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
import { useGlobal } from "../../state/useGlobal"
import { TimelineItem, TimelineItemLog, TimelineItemNetwork, LogPayload } from "../../types"
import { LogItem } from "./TimelineItems/LogItem"
import { NetworkItem } from "./TimelineItems/NetworkItem"
import { useThemeName, withTheme } from "../../theme/theme"

interface TimelineState {
  ids: string[]
  items: { [id: string]: TimelineItem }
}

const INITIAL_TIMELINE_STATE: TimelineState = {
  ids: [],
  items: {},
}

interface TestConfig {
  itemCount: number
  itemHeight: number
  testDuration: number
  updateFrequency: number
}

const TEST_CONFIGS: { [key: string]: TestConfig } = {
  light: { itemCount: 1000, itemHeight: 60, testDuration: 10, updateFrequency: 5 },
  medium: { itemCount: 5000, itemHeight: 60, testDuration: 15, updateFrequency: 10 },
  heavy: { itemCount: 10000, itemHeight: 60, testDuration: 20, updateFrequency: 20 },
  extreme: { itemCount: 50000, itemHeight: 60, testDuration: 30, updateFrequency: 50 },
}

const onRenderCallback: ProfilerOnRenderCallback = (id, phase, actualDuration) => {
  console.log(`${id} [${phase}]: ${actualDuration.toFixed(1)}ms`)
}

function addRandomTimelineItems(
  count: number,
  setter: React.Dispatch<React.SetStateAction<TimelineState>>,
) {
  const newItemsMap: { [id: string]: TimelineItem } = {}
  const newIds: string[] = []

  for (let i = 0; i < count; i++) {
    const messageId = Math.floor(Date.now() * Math.random())
    const id = `${messageId}`

    // Create the base object for every item
    const baseItem = {
      id,
      messageId,
      important: Math.random() < 0.1,
      connectionId: 1,
      date: new Date().toISOString(),
      deltaTime: Math.floor(Math.random() * 1000),
      clientId: "test-client",
    }

    let newItem: TimelineItem
    const isLog = Math.random() > 0.3

    if (isLog) {
      const logPayload: LogPayload = {
        level: (["debug", "warn"] as const)[Math.floor(Math.random() * 2)],
        message: `Log message event ${Math.random().toString(36).substring(7)}`,
      }
      newItem = {
        ...baseItem,
        type: "log",
        payload: logPayload,
      } as TimelineItemLog
    } else {
      newItem = {
        ...baseItem,
        type: "api.response",
        payload: {
          type: "api.response",
          request: {
            url: "/users/profile",
            method: "GET",
          },
          response: {
            status: 200,
            statusText: "OK",
            duration: Math.random() * 500,
          },
        },
      } as TimelineItemNetwork
    }

    newItemsMap[id] = newItem
    newIds.push(id)
  }

  setter((prev) => ({
    ids: [...newIds, ...prev.ids],
    items: { ...newItemsMap, ...prev.items },
  }))
}

const TimelineRow = ({ item }: { item: TimelineItem }) => {
  if (!item || !item.type) return null

  if (item.type === "log") return <LogItem item={item} />
  if (item.type === "api.response") return <NetworkItem item={item} />

  console.tron.log("Unknown timelineItem type:", item.type)
  return null
}

export function TimelineScreen() {
  const [themeName] = useThemeName()
  const [timeline, setTimeline] = useGlobal<TimelineState>("timeline", INITIAL_TIMELINE_STATE, {
    persist: false,
  })

  const [selectedConfig, setSelectedConfig] = useState<keyof typeof TEST_CONFIGS>("light")
  const [currentList, setCurrentList] = useState<"legend" | "flatlist">("legend")
  const [isRunning, setIsRunning] = useState(false)
  const config = TEST_CONFIGS[selectedConfig]

  useEffect(() => {
    if (!isRunning) return

    const interval = setInterval(() => {
      addRandomTimelineItems(config.updateFrequency, setTimeline)
    }, 1000)

    return () => clearInterval(interval)
  }, [isRunning, config, setTimeline])

  const startStressTest = useCallback(() => {
    setTimeline(INITIAL_TIMELINE_STATE)
    addRandomTimelineItems(config.itemCount, setTimeline)
    setIsRunning(true)
    setTimeout(() => setIsRunning(false), config.testDuration * 1000)
  }, [config, setTimeline])

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
    const renderItem = ({ item: id }: { item: string }) => {
      const item = timeline.items[id]
      if (!item) return null
      return <TimelineRow item={item} />
    }

    const listProps = {
      data: timeline.ids,
      renderItem,
      keyExtractor: (id: string) => id,
      style: $list(themeName),
    }

    if (currentList === "legend") {
      return (
        <Profiler id="LegendList" onRender={onRenderCallback}>
          <LegendList<string> {...listProps} estimatedItemSize={config.itemHeight} />
        </Profiler>
      )
    }

    return (
      <Profiler id="FlatList" onRender={onRenderCallback}>
        <FlatList<string> {...listProps} />
      </Profiler>
    )
  }, [currentList, timeline, config.itemHeight, themeName])

  return (
    <View style={$container(themeName)}>
      <View style={$header(themeName)}>
        <Text style={$title(themeName)}>Timeline Performance Test</Text>

        {/* Config and List Selectors */}
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
            Items: {timeline.ids.length} | Config: {selectedConfig} | Duration:{" "}
            {config.testDuration}s
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
  borderBottomColor: colors.border,
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
