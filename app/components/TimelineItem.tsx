import { Text, View, type ViewStyle, type TextStyle } from "react-native"
import { useThemeName, withTheme } from "../theme/theme"
import ContextPressable from "./ContextPressable"
import { MenuListEntry } from "../utils/useContextMenu"

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
  contextMenu?: MenuListEntry[]
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
  contextMenu,
}: TimelineItemProps) {
  const [themeName] = useThemeName()

  const time = formatTime(date)

  const handlePress = () => {
    onSelect?.()
  }

  return (
    <View style={[$container(themeName), isSelected && $containerSelected(themeName)]}>
      <ContextPressable
        style={$pressableContainer(themeName)}
        onPress={handlePress}
        items={contextMenu ?? []}
      >
        {/* Top Row: Title + Status + Time */}
        <View style={$topRow}>
          <View style={$leftSection}>
            {isTagged && <View style={$tagDot(themeName)} />}
            <Text
              style={[
                $titleText(themeName),
                isImportant && $titleTextImportant(themeName),
                { color: titleColor },
              ]}
              numberOfLines={1}
            >
              {title}
              {responseStatusCode && (
                <Text style={$statusCode(themeName)}> ({responseStatusCode})</Text>
              )}
            </Text>
          </View>
          <View style={$rightSection}>
            <Text style={$timeText(themeName)}>{time}</Text>
            {isImportant && <View style={$importantDot(themeName)} />}
          </View>
        </View>

        {/* Bottom Row: Preview + Delta Time */}
        <View style={$bottomRow}>
          <Text style={$previewText(themeName)} numberOfLines={1}>
            {preview}
          </Text>
          {!!deltaTime && <Text style={$deltaText(themeName)}>+{deltaTime}ms</Text>}
        </View>
      </ContextPressable>
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

const $container = withTheme<ViewStyle>(({ colors, spacing }) => ({
  marginHorizontal: spacing.sm,
  marginVertical: spacing.xs,
  borderRadius: spacing.xs,
  backgroundColor: colors.background,
}))

const $containerSelected = withTheme<ViewStyle>(({ colors }) => ({
  backgroundColor: colors.neutralVery + "60", // Selection highlight override
}))

const $pressableContainer = withTheme<ViewStyle>(({ spacing }) => ({
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

const $titleText = withTheme<TextStyle>(({ colors, typography }) => ({
  fontSize: typography.caption,
  fontWeight: "500",
  color: colors.mainText,
}))

const $titleTextImportant = withTheme<TextStyle>(() => ({
  fontWeight: "600", // Override for important items
}))

const $statusCode = withTheme<TextStyle>(({ colors, typography }) => ({
  fontSize: typography.small,
  fontWeight: "400",
  color: colors.neutral,
}))

const $timeText = withTheme<TextStyle>(({ colors, typography }) => ({
  fontSize: typography.small,
  color: colors.neutral,
  fontWeight: "400",
  minWidth: 60,
  textAlign: "right",
}))

const $previewText = withTheme<TextStyle>(({ colors, spacing, typography }) => ({
  fontSize: typography.caption,
  color: colors.neutral,
  fontWeight: "400",
  flex: 1,
  marginRight: spacing.xs,
}))

const $deltaText = withTheme<TextStyle>(({ colors, typography }) => ({
  fontSize: typography.small,
  color: colors.neutral,
  fontWeight: "400",
  opacity: 0.8,
}))

// Visual indicators
const $tagDot = withTheme<ViewStyle>(({ colors, spacing }) => ({
  width: 6,
  height: 6,
  borderRadius: 3,
  backgroundColor: colors.primary,
  marginRight: spacing.sm,
}))

const $importantDot = withTheme<ViewStyle>(({ colors, spacing }) => ({
  width: 4,
  height: 4,
  borderRadius: 2,
  backgroundColor: colors.danger,
  marginLeft: spacing.xs,
}))
