import { Text, type ViewStyle, type TextStyle, Pressable, View } from "react-native"
import { themed } from "../theme/theme"
import { useState, useMemo, useCallback, createContext, useContext } from "react"
import IRKeyboard from "../native/IRKeyboard/NativeIRKeyboard"
import { typography } from "../theme/typography"
import { spacing } from "../theme/spacing"

// max level to avoid infinite recursion
const MAX_LEVEL = 10
// Only render this many children at once for performance
const CHILDREN_BATCH_SIZE = 50

type TreeViewProps = {
  data: any
  path?: string[]
  level?: number
  onNodePress?: (node: { path: string[]; value: any; key: string }) => void
}

// Context for managing expansion state across the tree
type TreeViewContextType = {
  expandAll: (path: string[]) => void
  collapseAll: (path: string[]) => void
  isExpanded: (path: string[]) => boolean
  setExpanded: (path: string[], expanded: boolean) => void
}

const TreeViewContext = createContext<TreeViewContextType | null>(null)

// Helper functions for recursive expansion/collapse
function expandAllChildren(data: any, currentPath: string[], context: TreeViewContextType) {
  if (Array.isArray(data)) {
    data.forEach((item, index) => {
      const childPath = [...currentPath, `[${index}]`]
      if (item && typeof item === "object" && Object.keys(item).length > 0) {
        context.setExpanded(childPath, true)
        expandAllChildren(item, childPath, context)
      }
    })
  } else if (data && typeof data === "object") {
    Object.entries(data).forEach(([key, value]) => {
      const childPath = [...currentPath, key]
      if (value && typeof value === "object" && Object.keys(value).length > 0) {
        context.setExpanded(childPath, true)
        expandAllChildren(value, childPath, context)
      }
    })
  }
}

function collapseAllChildren(data: any, currentPath: string[], context: TreeViewContextType) {
  if (Array.isArray(data)) {
    data.forEach((item, index) => {
      const childPath = [...currentPath, `[${index}]`]
      if (item && typeof item === "object" && Object.keys(item).length > 0) {
        context.setExpanded(childPath, false)
        collapseAllChildren(item, childPath, context)
      }
    })
  } else if (data && typeof data === "object") {
    Object.entries(data).forEach(([key, value]) => {
      const childPath = [...currentPath, key]
      if (value && typeof value === "object" && Object.keys(value).length > 0) {
        context.setExpanded(childPath, false)
        collapseAllChildren(value, childPath, context)
      }
    })
  }
}

// Provider component for managing tree expansion state
function TreeViewProvider({ children }: { children: React.ReactNode }) {
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set())

  const expandAll = useCallback((path: string[]) => {
    const pathString = path.join(".")
    setExpandedPaths((prev) => {
      const newSet = new Set(prev)
      newSet.add(pathString)
      return newSet
    })
  }, [])

  const collapseAll = useCallback((path: string[]) => {
    const pathString = path.join(".")
    setExpandedPaths((prev) => {
      const newSet = new Set(prev)
      newSet.delete(pathString)
      return newSet
    })
  }, [])

  const isExpanded = useCallback(
    (path: string[]) => {
      const pathString = path.join(".")
      return expandedPaths.has(pathString)
    },
    [expandedPaths],
  )

  const setExpanded = useCallback((path: string[], expanded: boolean) => {
    const pathString = path.join(".")
    setExpandedPaths((prev) => {
      const newSet = new Set(prev)
      if (expanded) {
        newSet.add(pathString)
      } else {
        newSet.delete(pathString)
      }
      return newSet
    })
  }, [])

  const contextValue = useMemo(
    () => ({
      expandAll,
      collapseAll,
      isExpanded,
      setExpanded,
    }),
    [expandAll, collapseAll, isExpanded, setExpanded],
  )

  return <TreeViewContext.Provider value={contextValue}>{children}</TreeViewContext.Provider>
}

export function TreeView({ data, path = [], level = 0, onNodePress }: TreeViewProps) {
  const [expandedBatches, setExpandedBatches] = useState<Set<number>>(new Set([0]))
  const [localIsExpanded, setLocalIsExpanded] = useState(false)
  const context = useContext(TreeViewContext)

  // Determine the label for this node
  const label = path.length > 0 ? path[path.length - 1] : "root"

  // Memoize expensive object operations
  const isExpandable = useMemo(() => {
    return data && typeof data === "object" && Object.keys(data).length > 0
  }, [data])

  // Count expandable children to limit shift+click functionality
  const expandableChildrenCount = useMemo(() => {
    if (!isExpandable) return 0

    let count = 0
    if (Array.isArray(data)) {
      data.forEach((item) => {
        if (item && typeof item === "object" && Object.keys(item).length > 0) {
          count++
        }
      })
    } else if (data && typeof data === "object") {
      Object.values(data).forEach((value) => {
        if (value && typeof value === "object" && Object.keys(value).length > 0) {
          count++
        }
      })
    }
    return count
  }, [data, isExpandable])

  // Use context for expansion state if available, otherwise fall back to local state
  const isExpanded = context ? context.isExpanded(path) : localIsExpanded

  const handlePress = useCallback(
    (event?: any) => {
      if (isExpandable) {
        const newExpanded = !isExpanded

        // Check for shift key in multiple ways
        const isShiftPressed = IRKeyboard.shift() || event?.nativeEvent?.shiftKey || event?.shiftKey

        // Only allow shift+click if there are fewer than 50 expandable children
        const canShiftClick = expandableChildrenCount < 50

        if (context) {
          context.setExpanded(path, newExpanded)

          if (isShiftPressed && canShiftClick) {
            // Shift+click: expand/collapse all children recursively
            if (newExpanded) {
              context.expandAll(path)
              // Also expand all nested children
              expandAllChildren(data, path, context)
            } else {
              context.collapseAll(path)
              // Also collapse all nested children
              collapseAllChildren(data, path, context)
            }
          }
        } else {
          // Fallback to local state if no context
          setLocalIsExpanded(newExpanded)
        }
      }

      onNodePress?.({ path, value: data, key: label })
    },
    [isExpandable, isExpanded, onNodePress, path, label, context, data, expandableChildrenCount],
  )

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

      return <Text style={$arrayValue}>[{arrayPreviewText}]</Text>
    } else if (type === "object") {
      // Use the already calculated isExpandable to get key count
      const keyCount = isExpandable ? Object.keys(data).length : 0
      return <Text pointerEvents="none" style={$objectValue}>{`{${keyCount} keys}`}</Text>
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

  // Memoize the array preview text to avoid recalculating on every render
  const arrayPreviewText = useMemo(() => {
    if (!Array.isArray(data) || data.length <= 2) return null

    return data
      .map((item) => {
        if (item && typeof item === "object") {
          return "{...}"
        }
        return item.toString()
      })
      .join(", ")
  }, [data])

  const toggleBatch = useCallback((batchStartIndex: number) => {
    setExpandedBatches((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(batchStartIndex)) {
        newSet.delete(batchStartIndex)
      } else {
        newSet.add(batchStartIndex)
      }
      return newSet
    })
  }, [])

  // Generate batch ranges for navigation - memoized more efficiently
  const batchRanges = useMemo(() => {
    if (children.length <= CHILDREN_BATCH_SIZE) return []

    const ranges = []
    const totalBatches = Math.ceil(children.length / CHILDREN_BATCH_SIZE)

    for (let i = 0; i < totalBatches; i++) {
      const startIndex = i * CHILDREN_BATCH_SIZE
      const endIndex = Math.min(startIndex + CHILDREN_BATCH_SIZE - 1, children.length - 1)
      ranges.push({
        startIndex,
        endIndex,
        label: `${startIndex + 1}-${endIndex + 1}`,
        isExpanded: expandedBatches.has(startIndex),
      })
    }
    return ranges
  }, [children.length, expandedBatches])

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

  // Memoize batch children to prevent unnecessary re-slicing
  const memoizedBatchChildren = useMemo(() => {
    const memoized = new Map()
    batchRanges.forEach((batch) => {
      if (batch.isExpanded) {
        memoized.set(batch.startIndex, children.slice(batch.startIndex, batch.endIndex + 1))
      }
    })
    return memoized
  }, [batchRanges, children])

  return (
    <>
      {/* Show this root node value */}
      <Pressable style={$nodeRow(level)} onPress={handlePress}>
        {isExpandable ? <Text style={$expandIcon()}>{isExpanded ? "▼" : "▶"}</Text> : null}
        <Text style={$nodeLabel()}>{label}</Text>
        {renderValue()}
      </Pressable>

      {/* If has children, render with virtualization */}
      {isExpandable && isExpanded && level < MAX_LEVEL ? (
        <>
          {/* If no batching needed, render all children directly */}
          {children.length <= CHILDREN_BATCH_SIZE ? (
            children.map(renderChild)
          ) : (
            <>
              {/* Render each batch with its content */}
              {batchRanges.map((batch) => (
                <View key={batch.startIndex}>
                  {/* Batch Button */}
                  <Pressable
                    style={[
                      $batchButton,
                      $batchNavigation(level + 1),
                      batch.isExpanded && $currentBatchButton,
                    ]}
                    onPress={() => toggleBatch(batch.startIndex)}
                  >
                    <Text style={[$batchButtonText, batch.isExpanded && $currentBatchButtonText]}>
                      {batch.isExpanded ? "▼" : "▶"} {batch.label}
                    </Text>
                  </Pressable>

                  {/* Batch Content */}
                  {batch.isExpanded && (
                    <View style={$batchContent(level + 1)}>
                      {memoizedBatchChildren.get(batch.startIndex)?.map(renderChild)}
                    </View>
                  )}
                </View>
              ))}
            </>
          )}
        </>
      ) : null}
      {isExpandable && isExpanded && level >= MAX_LEVEL ? (
        <Text pointerEvents="none" style={$defaultValue()}>
          {JSON.stringify(data, null, 2)}
        </Text>
      ) : null}
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

const $batchContent = (level: number): ViewStyle => ({
  marginLeft: level * spacing.md,
})

// Wrapper component that provides context automatically
export function TreeViewWithProvider(props: TreeViewProps) {
  return (
    <TreeViewProvider>
      <TreeView {...props} />
    </TreeViewProvider>
  )
}

// Export the provider and the main component
export { TreeViewProvider }
