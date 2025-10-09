import { useState } from "react"
import { View, Text, Pressable, type ViewStyle, type TextStyle } from "react-native"
import { themed } from "../theme/theme"
import type { ErrorStackFrame } from "../types"
import { isNodeModule, getJustFileName } from "../utils/stackFrames"

interface StackFrameRowProps {
  stackFrame: ErrorStackFrame
  onPress: (fileName: string, lineNumber: number) => void
}

/**
 * Renders a single stack frame row in a stack trace.
 * Shows function name, file name, and line number.
 * Dims node_modules entries and shows hover state.
 */
export function StackFrameRow({ stackFrame, onPress }: StackFrameRowProps) {
  const [isHovered, setIsHovered] = useState(false)
  const fileName = stackFrame.fileName || ""
  const functionName = stackFrame.functionName || "(anonymous function)"
  const lineNumber = stackFrame.lineNumber || 0
  const isFromNodeModules = isNodeModule(fileName)
  const justFileName = getJustFileName(fileName)

  const handlePress = () => {
    if (fileName) {
      onPress(fileName, lineNumber)
    }
  }

  return (
    <Pressable
      onPress={handlePress}
      onHoverIn={() => setIsHovered(true)}
      onHoverOut={() => setIsHovered(false)}
    >
      <View
        style={[
          $container(),
          isHovered ? $containerHovered() : {},
          isFromNodeModules ? $containerNodeModules() : {},
        ]}
      >
        <View style={$functionColumn()}>
          <Text style={$functionText()} numberOfLines={1}>
            {functionName}
          </Text>
        </View>
        <View style={$fileColumn()}>
          <Text style={$fileText()} numberOfLines={1}>
            {justFileName}
          </Text>
        </View>
        <View style={$lineColumn()}>
          <Text style={$lineText()}>{lineNumber}</Text>
        </View>
      </View>
    </Pressable>
  )
}

const $container = themed<ViewStyle>(({ spacing }) => ({
  flexDirection: "row",
  paddingVertical: spacing.xs,
  paddingHorizontal: spacing.sm,
  cursor: "pointer",
}))

const $containerHovered = themed<ViewStyle>(({ colors }) => ({
  backgroundColor: colors.neutralVery,
}))

const $containerNodeModules = themed<ViewStyle>(() => ({
  opacity: 0.4,
}))

const $functionColumn = themed<ViewStyle>(() => ({
  flex: 1,
  marginRight: 8,
}))

const $fileColumn = themed<ViewStyle>(() => ({
  flex: 1,
  marginRight: 8,
}))

const $lineColumn = themed<ViewStyle>(() => ({
  width: 60,
  alignItems: "flex-end",
}))

const $functionText = themed<TextStyle>(({ colors, typography }) => ({
  color: colors.mainText,
  fontSize: typography.body,
  fontFamily: typography.code.normal,
}))

const $fileText = themed<TextStyle>(({ colors, typography }) => ({
  color: colors.neutral,
  fontSize: typography.body,
  fontFamily: typography.code.normal,
}))

const $lineText = themed<TextStyle>(({ colors, typography }) => ({
  color: colors.primary,
  fontSize: typography.body,
  fontFamily: typography.code.normal,
}))
