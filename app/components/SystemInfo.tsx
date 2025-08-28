import { useState } from "react"
import { View, Text, type TextStyle, type ViewStyle } from "react-native"
import { useTheme, themed } from "../theme/theme"
import { useSystemInfo } from "../utils/system"

export function SystemInfo() {
  const { colors } = useTheme()
  const [cpuData, setCpuData] = useState<number[]>([])
  const [memoryData, setMemoryData] = useState<number[]>([])
  const [maxMemory, setMaxMemory] = useState<number>(0)

  useSystemInfo((info) => {
    const memoryUsage = info.rss
    const mockCpuUsage = info.cpu

    setCpuData((prev) => {
      const newData = [...prev, mockCpuUsage]
      return newData.slice(-100) // Keep only last 100 items
    })

    setMemoryData((prev) => {
      const newData = [...prev, memoryUsage]
      return newData.slice(-100) // Keep only last 100 items
    })

    setMaxMemory((prev) => Math.max(prev, memoryUsage))
  })

  const getCpuColor = (usage: number) => {
    if (usage < 30) return colors.success
    if (usage < 60) return colors.primary
    if (usage < 80) return colors.primary
    return colors.danger
  }

  const renderBar = (value: number, maxValue: number, color: string, height: number) => (
    <View key={Math.random()} style={$barStyle(value, maxValue, color, height)} />
  )

  return (
    <View style={$systemInfoContainer()}>
      <Text style={$systemInfoTitle()}>System Info</Text>

      <View style={$chartContainer()}>
        <View style={$chartSection()}>
          <Text style={$chartLabel()}>CPU Usage</Text>
          <View style={$chartBars()}>
            {cpuData.map((usage, _index) => renderBar(usage, 100, getCpuColor(usage), 80))}
          </View>
          <Text style={$chartValue()}>{cpuData[cpuData.length - 1]?.toFixed(1) || 0}%</Text>
        </View>

        <View style={$chartSection()}>
          <Text style={$chartLabel()}>Memory Usage</Text>
          <View style={$chartBars()}>
            {memoryData.map((usage, _index) => renderBar(usage, maxMemory, colors.primary, 80))}
          </View>
          <Text style={$chartValue()}>
            {memoryData[memoryData.length - 1]?.toFixed(1) || 0} MB / {maxMemory.toFixed(1)} MB
          </Text>
        </View>
      </View>
    </View>
  )
}

const $systemInfoContainer = themed<ViewStyle>(({ spacing }) => ({
  gap: spacing.lg,
}))

const $systemInfoTitle = themed<TextStyle>(({ colors, typography }) => ({
  fontSize: typography.heading,
  fontWeight: "600",
  color: colors.mainText,
  textAlign: "center",
}))

const $chartContainer = themed<ViewStyle>(({ spacing }) => ({
  flexDirection: "row",
  gap: spacing.xl,
}))

const $chartSection = themed<ViewStyle>(({ spacing }) => ({
  flex: 1,
  alignItems: "center",
  gap: spacing.sm,
}))

const $chartLabel = themed<TextStyle>(({ colors, typography }) => ({
  fontSize: typography.caption,
  fontWeight: "500",
  color: colors.neutral,
}))

const $chartBars = themed<ViewStyle>(({ spacing }) => ({
  flexDirection: "row",
  alignItems: "flex-end",
  height: 80,
  paddingVertical: spacing.xs,
}))

const $chartValue = themed<TextStyle>(({ colors, typography }) => ({
  fontSize: typography.caption,
  fontWeight: "600",
  color: colors.mainText,
}))

const $barStyle = (value: number, maxValue: number, color: string, height: number): ViewStyle => ({
  width: 3,
  height: Math.max(2, (value / maxValue) * height),
  backgroundColor: color,
  borderRadius: 1,
  marginHorizontal: 1,
})
