import { Text, View, type ViewStyle, type TextStyle } from "react-native"
import { useThemeName, themed } from "../theme/theme"
import PressableWithRightClick from "./PressableWithRightClick"
import { MenuListEntry } from "../utils/useActionMenu"

/**
 * A single item in the timeline.
 *
 * This is a generic component that is used to render a single item in the timeline.
 *
 *
 */

type TimelineItemProps = {
  date: Date | number
  deltaTime?: number
  title: string
  titleColor?: string
  preview: string
  isImportant?: boolean
  isTagged?: boolean
  responseStatusCode?: number
  isSelected?: boolean
  onSelect?: () => void
  actionMenu?: MenuListEntry[]
}

export function TimelineItem({
  date,
  deltaTime,
  title,
  titleColor,
  preview,
  isImportant = false,
  isTagged = false,
  responseStatusCode,
  isSelected = false,
  onSelect,
  actionMenu,
}: TimelineItemProps) {
  const time = formatTime(date)

  const handlePress = () => {
    onSelect?.()
  }

  return (
    <View style={[$container(), isSelected && $containerSelected()]}>
      <PressableWithRightClick
        style={$pressableContainer()}
        onPress={handlePress}
        items={actionMenu ?? []}
      >
        {/* Top Row: Title + Status + Time */}
        <View style={$topRow}>
          <View style={$leftSection}>
            {isTagged && <View style={$tagDot()} />}
            <Text
              style={[$titleText(), isImportant && $titleTextImportant(), { color: titleColor }]}
              numberOfLines={1}
            >
              {title}
              {responseStatusCode && <Text style={$statusCode()}> ({responseStatusCode})</Text>}
            </Text>
          </View>
          <View style={$rightSection}>
            <Text style={$timeText()}>{time}</Text>
            {isImportant && <View style={$importantDot()} />}
          </View>
        </View>

        {/* Bottom Row: Preview + Delta Time */}
        <View style={$bottomRow}>
          <Text style={$previewText()} numberOfLines={1}>
            {preview}
          </Text>
          {!!deltaTime && <Text style={$deltaText()}>+{deltaTime}ms</Text>}
        </View>
      </PressableWithRightClick>
    </View>
  )
}

function formatTime(date: Date | number) {
  const dateObj = date instanceof Date ? date : new Date(date)
  return (
    dateObj.toLocaleTimeString([], { hour12: false }) +
    "." +
    String(dateObj.getMilliseconds()).padStart(3, "0")
  )
}

const $container = themed<ViewStyle>(({ colors, spacing }) => ({
  marginHorizontal: spacing.sm,
  marginVertical: spacing.xs,
  borderRadius: spacing.xs,
  backgroundColor: colors.background,
}))

const $containerSelected = themed<ViewStyle>(({ colors }) => ({
  backgroundColor: colors.neutralVery + "60", // Selection highlight override
}))

const $pressableContainer = themed<ViewStyle>(({ spacing }) => ({
  marginHorizontal: spacing.md,
  paddingVertical: spacing.sm,
  cursor: "pointer",
}))

// Top row: Title + Time (main info)
const $topRow: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 4,
}

const $leftSection: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  flex: 1,
  minWidth: 0, // Allow truncation
}

const $rightSection: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  marginLeft: 12,
}

// Bottom row: Preview + Delta time (secondary info)
const $bottomRow: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "baseline",
}

const $titleText = themed<TextStyle>(({ colors, typography }) => ({
  fontSize: typography.caption,
  fontWeight: "500",
  color: colors.mainText,
}))

const $titleTextImportant = themed<TextStyle>(() => ({
  fontWeight: "600", // Override for important items
}))

const $statusCode = themed<TextStyle>(({ colors, typography }) => ({
  fontSize: typography.small,
  fontWeight: "400",
  color: colors.neutral,
}))

const $timeText = themed<TextStyle>(({ colors, typography }) => ({
  fontSize: typography.small,
  color: colors.neutral,
  fontWeight: "400",
  minWidth: 60,
  textAlign: "right",
}))

const $previewText = themed<TextStyle>(({ colors, spacing, typography }) => ({
  fontSize: typography.caption,
  color: colors.neutral,
  fontWeight: "400",
  flex: 1,
  marginRight: spacing.xs,
}))

const $deltaText = themed<TextStyle>(({ colors, typography }) => ({
  fontSize: typography.small,
  color: colors.neutral,
  fontWeight: "400",
  opacity: 0.8,
}))

// Visual indicators
const $tagDot = themed<ViewStyle>(({ colors, spacing }) => ({
  width: 6,
  height: 6,
  borderRadius: 3,
  backgroundColor: colors.primary,
  marginRight: spacing.sm,
}))

const $importantDot = themed<ViewStyle>(({ colors, spacing }) => ({
  width: 4,
  height: 4,
  borderRadius: 2,
  backgroundColor: colors.danger,
  marginLeft: spacing.xs,
}))
