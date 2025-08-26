import { Text, View, type ViewStyle, type TextStyle, Pressable } from "react-native"
import { useThemeName, themed, type ThemeName, useTheme } from "../theme/theme"
import ActionButton from "../components/ActionButton"
import { useGlobal } from "../state/useGlobal"
import { $flex } from "../theme/basics"

type ExpandableRowProps = {
  id: string
  title: string
  titleColor?: string
  date: Date | number
  deltaTime?: number
  preview: string
  toolbar?: {
    icon: React.ElementType<{ size: number }>
    tip: string
    onClick: () => void
  }[]
  isImportant?: boolean
  isTagged?: boolean
  responseStatusCode?: number
  children?: React.ReactNode
}

export function ExpandableRow({
  toolbar,
  date,
  deltaTime,
  id,
  title,
  titleColor,
  preview,
  isImportant = false,
  isTagged = false,
  responseStatusCode,
  children,
}: ExpandableRowProps) {
  const [themeName] = useThemeName()
  const [isOpen, setIsOpen] = useGlobal(`timeline-${id}-open`, false, { persist: true })

  const time = formatTime(date)

  return (
    <View style={$container(themeName, isOpen)}>
      <Pressable style={$topBarContainer} onPress={() => setIsOpen(!isOpen)}>
        <View style={$timestampContainer}>
          <Text style={$timestampText(themeName)}>{time}</Text>
          {deltaTime ? <Text style={$deltaText(themeName)}>+{deltaTime}ms</Text> : null}
        </View>
        <View style={$titleContainer}>
          <View style={$titleText(themeName, isImportant)}>
            {isTagged && <Text style={$tagIcon}>🏷️</Text>}
            <Text style={[$titleLabel(themeName, isImportant), { color: titleColor }]}>
              {title} {responseStatusCode ? `(${responseStatusCode})` : ""}
            </Text>
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
        <View style={$flex} />
        <View style={$expandIconContainer}>
          <Text style={$expandIcon(themeName)}>{isOpen ? "▲" : "▼"}</Text>
        </View>
      </Pressable>
      {isOpen && <View style={$childrenContainer}>{children}</View>}
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

const $timestampText = themed<TextStyle>(({ colors, typography }) => ({
  color: colors.neutral,
  // fontFamily: typography.code.normal,
  fontSize: typography.caption,
  marginRight: 0,
  minWidth: 90,
  textAlign: "left",
}))

const $deltaText = themed<TextStyle>(({ colors, typography }) => ({
  color: colors.neutral,
  // fontFamily: typography.code.normal,
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

const $previewText = themed<TextStyle>(({ colors, typography }) => ({
  color: colors.mainText,
  // fontFamily: typography.code.normal,
  fontSize: typography.body,
}))

const $toolbarContainer: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
}

const $expandIconContainer: ViewStyle = {
  alignItems: "center",
  justifyContent: "center",
}

const $expandIcon = themed<TextStyle>(({ colors }) => ({
  color: colors.mainText,
  fontSize: 16,
}))

const $childrenContainer: ViewStyle = {
  paddingHorizontal: 40,
  paddingBottom: 30,
}
