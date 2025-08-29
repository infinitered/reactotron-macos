import { Text, type ViewStyle, type TextStyle, Pressable, View } from "react-native"
import { themed } from "../theme/theme"
import { useState, useMemo, useCallback } from "react"
import { traverse } from "../utils/traverse"
import IRKeyboard from "../native/IRKeyboard/NativeIRKeyboard"
import { typography } from "../theme/typography"
import { spacing } from "../theme/spacing"

// max level to avoid infinite recursion
const MAX_LEVEL = 10
// Only render this many children at once for performance
const CHILDREN_BATCH_SIZE = 50

const TreeViewSymbol = Symbol("TreeView")

type TreeViewProps = {
  data: any
  path?: string[]
  level?: number
  onNodePress?: (node: { path: string[]; value: any; key: string }) => void
}

export function TreeView({ data, path = [], level = 0, onNodePress }: TreeViewProps) {
  const [_a, rerender] = useState([])
  const [visibleChildrenCount, setVisibleChildrenCount] = useState(CHILDREN_BATCH_SIZE)
  const [startIndex, setStartIndex] = useState(0)

  // Determine the label for this node
  const label = path.length > 0 ? path[path.length - 1] : "root"

  const isExpandable = data && typeof data === "object" && Object.keys(data).length > 0
  const isExpanded = (isExpandable && data[TreeViewSymbol]) ?? false

  const handlePress = useCallback(() => {
    if (isExpandable) {
      data[TreeViewSymbol] = !data[TreeViewSymbol]
      if (IRKeyboard.shift()) {
        traverse(data, (_key, node) => {
          if (node && typeof node === "object") {
            node[TreeViewSymbol] = data[TreeViewSymbol]
          }
        })
      }
      rerender([])
      // Reset visible children count when expanding
      if (data[TreeViewSymbol]) {
        setVisibleChildrenCount(CHILDREN_BATCH_SIZE)
      }
    }

    onNodePress?.({ path, value: data, key: label })
  }, [isExpandable, data, onNodePress, path, label])

  const renderValue = useCallback(() => {
    if (data === undefined) return <Text style={$undefinedValue()}>undefined</Text>

    const type = typeof data

    if (type === "string") {
      return (
        <Text pointerEvents="none" style={$stringValue}>
          &quot;{data}&quot;
        </Text>
      )
    } else if (type === "number") {
      return (
        <Text pointerEvents="none" style={$numberValue}>
          {data}
        </Text>
      )
    } else if (type === "boolean") {
      return (
        <Text pointerEvents="none" style={$booleanValue}>
          {data.toString()}
        </Text>
      )
    } else if (data === null) {
      return (
        <Text pointerEvents="none" style={$nullValue()}>
          null
        </Text>
      )
    } else if (Array.isArray(data)) {
      if (data.length === 0) return <Text style={$arrayValue}>[empty]</Text>

      if (data.length > 2) {
        return <Text style={$arrayValue}>[] {data.length} items</Text>
      }

      const previewText = data
        .map((item) => {
          if (item && typeof item === "object") {
            return "{...}"
          }
          return item.toString()
        })
        .join(", ")

      return <Text style={$arrayValue}>[{previewText}]</Text>
    } else if (type === "object") {
      const keys = Object.keys(data)
      return <Text pointerEvents="none" style={$objectValue}>{`{${keys.length} keys}`}</Text>
    }

    return (
      <Text pointerEvents="none" style={$defaultValue()}>
        {String(data)}
      </Text>
    )
  }, [data])

  // Get children for rendering - memoized to prevent recalculation
  const children = useMemo(() => {
    if (Array.isArray(data)) {
      return data.map((item, index) => ({ key: `${index}`, label: `[${index}]`, value: item }))
    } else if (data && typeof data === "object") {
      return Object.entries(data).map(([key, value]) => ({ key, label: key, value }))
    }
    return []
  }, [data])

  // Show children from startIndex with batch size
  const visibleChildren = children.slice(startIndex, startIndex + visibleChildrenCount)

  const jumpToBatch = useCallback(
    (startIndex: number) => {
      setVisibleChildrenCount(CHILDREN_BATCH_SIZE)
      // Set a virtual offset to show the selected batch
      setStartIndex(startIndex)
    },
    [CHILDREN_BATCH_SIZE],
  )

  // Generate batch ranges for navigation
  const batchRanges = useMemo(() => {
    if (children.length <= CHILDREN_BATCH_SIZE) return []

    const ranges = []
    for (let i = 0; i < children.length; i += CHILDREN_BATCH_SIZE) {
      const endIndex = Math.min(i + CHILDREN_BATCH_SIZE - 1, children.length - 1)
      ranges.push({
        startIndex: i,
        endIndex,
        label: `${i + 1}-${endIndex + 1}`,
        isCurrent: i < visibleChildrenCount && endIndex < visibleChildrenCount,
      })
    }
    return ranges
  }, [children.length, visibleChildrenCount])

  const renderChild = useCallback(
    ({ key, label: childLabel, value }: { key: string; label: string; value: any }) => (
      <TreeView
        key={key}
        data={value}
        path={[...path, childLabel]}
        level={level + 1}
        onNodePress={onNodePress}
      />
    ),
    [path, level, onNodePress],
  )

  return (
    <>
      {/* Show this root node value */}
      <Pressable style={$nodeRow(level)} onPress={handlePress}>
        {isExpandable && <Text style={$expandIcon()}>{isExpanded ? "▼" : "▶"}</Text>}
        <Text style={$nodeLabel()}>{label}</Text>
        {renderValue()}
      </Pressable>

      {/* If has children, render with virtualization */}
      {isExpandable && isExpanded && level < MAX_LEVEL && (
        <>
          {/* Children */}
          {visibleChildren.map(renderChild)}

          {/* Batch Navigation */}
          {batchRanges.length > 1 && (
            <View style={$batchNavigation(level + 1)}>
              <View style={$batchList}>
                {batchRanges.map((batch) => (
                  <Pressable
                    key={batch.startIndex}
                    style={[$batchButton, batch.isCurrent && $currentBatchButton]}
                    onPress={() => jumpToBatch(batch.startIndex)}
                  >
                    <Text style={[$batchButtonText, batch.isCurrent && $currentBatchButtonText]}>
                      ▶▶ {batch.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}
        </>
      )}
      {isExpandable && isExpanded && level >= MAX_LEVEL && (
        <Text pointerEvents="none" style={$defaultValue()}>
          {JSON.stringify(data, null, 2)}
        </Text>
      )}
    </>
  )
}

const $nodeRow = (level: number): ViewStyle => ({
  flexDirection: "row",
  alignItems: "center",
  paddingVertical: spacing.xxxs,
  paddingHorizontal: spacing.xxs,
  marginLeft: level * spacing.md,
})

const $expandIcon = themed<TextStyle>(({ colors }) => ({
  color: colors.mainText,
  fontSize: typography.small,
  marginRight: spacing.xxs,
  width: 12,
}))

const $value = {
  fontFamily: typography.primary.normal,
  fontSize: typography.caption,
}

const $nodeLabel = themed<TextStyle>(({ colors, typography }) => ({
  color: colors.mainText,
  fontFamily: typography.code.normal,
  fontSize: typography.body,
  marginRight: 8,
}))

const $stringValue = {
  ...$value,
  color: "#4CAF50",
}

const $numberValue = {
  ...$value,
  color: "#2196F3",
}

const $booleanValue = {
  ...$value,
  color: "#FF9800",
}

const $nullValue = themed<TextStyle>(({ colors }) => ({
  ...$value,
  color: colors.neutralVery,
}))

const $undefinedValue = themed<TextStyle>(({ colors }) => ({
  ...$value,
  color: colors.neutralVery,
}))

const $arrayValue = {
  ...$value,
  color: "#bb5ccc",
}

const $objectValue = {
  ...$value,
  color: "#607D8B",
}

const $defaultValue = themed<TextStyle>(({ colors }) => ({
  ...$value,
  color: colors.mainText,
}))

const $batchNavigation = (level: number): ViewStyle => ({
  paddingVertical: spacing.xxxs,
  paddingHorizontal: spacing.xxs,
  marginLeft: level * spacing.md,
  marginTop: spacing.xxs,
})

const $batchList: ViewStyle = {
  flexDirection: "column",
  gap: spacing.xxs,
}

const $batchButton = {
  borderRadius: 4,
  paddingVertical: spacing.xxxs,
}

const $batchButtonText = {
  ...$value,
  color: "#666",
}

const $currentBatchButton = {
  backgroundColor: "rgba(0,0,0,0.1)",
  borderColor: "#666",
  borderWidth: 1,
}

const $currentBatchButtonText: TextStyle = {
  color: "#666",
  fontWeight: "bold" as const,
}
