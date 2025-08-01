import { Text, type ViewStyle, type TextStyle, Pressable, View } from "react-native"
import { useThemeName, withTheme } from "../theme/theme"
import { useState } from "react"
import { traverse } from "../utils/traverse"
import IRKeyboard from "../../specs/NativeIRKeyboard"

// max level to avoid infinite recursion
const MAX_LEVEL = 10

const TreeViewSymbol = Symbol("TreeView")

type TreeViewProps = {
  data: any
  path?: string[]
  level?: number
  onNodePress?: (node: { path: string[]; value: any; key: string }) => void
}

export function TreeView({ data, path = [], level = 0, onNodePress }: TreeViewProps) {
  const [themeName] = useThemeName()
  const [_a, rerender] = useState([])

  // Determine the label for this node
  const label = path.length > 0 ? path[path.length - 1] : "root"

  const isExpandable = data && typeof data === "object" && Object.keys(data).length > 0
  const isExpanded = (isExpandable && data[TreeViewSymbol]) ?? false

  const handlePress = () => {
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
    }

    onNodePress?.({ path, value: data, key: label })
  }

  const renderValue = () => {
    if (data === undefined) return <Text style={$undefinedValue(themeName)}>undefined</Text>

    const type = typeof data

    if (type === "string") {
      return (
        <Text pointerEvents="none" style={$stringValue(themeName)}>
          &quot;{data}&quot;
        </Text>
      )
    } else if (type === "number") {
      return (
        <Text pointerEvents="none" style={$numberValue(themeName)}>
          {data}
        </Text>
      )
    } else if (type === "boolean") {
      return (
        <Text pointerEvents="none" style={$booleanValue(themeName)}>
          {data.toString()}
        </Text>
      )
    } else if (data === null) {
      return (
        <Text pointerEvents="none" style={$nullValue(themeName)}>
          null
        </Text>
      )
    } else if (Array.isArray(data)) {
      if (data.length === 0) return <Text style={$arrayValue(themeName)}>[empty]</Text>

      const maxPreview = 3
      const previewItems = data.slice(0, maxPreview)
      const remaining = data.length - maxPreview

      const previewText = previewItems.map((item) => item.toString()).join(", ")

      const suffix = remaining > 0 ? `, ...${remaining} more` : ""
      return (
        <Text style={$arrayValue(themeName)}>
          [{previewText}
          {suffix}]
        </Text>
      )
    } else if (type === "object") {
      const keys = Object.keys(data)
      return (
        <Text pointerEvents="none" style={$objectValue(themeName)}>{`{${keys.length} keys}`}</Text>
      )
    }

    return (
      <Text pointerEvents="none" style={$defaultValue(themeName)}>
        {String(data)}
      </Text>
    )
  }

  // Get children for rendering
  const getChildren = () => {
    if (Array.isArray(data)) {
      return data.map((item, index) => ({ key: `${index}`, label: `[${index}]`, value: item }))
    } else if (data && typeof data === "object") {
      return Object.entries(data).map(([key, value]) => ({ key, label: key, value }))
    }
    return []
  }

  return (
    <>
      {/* Show this root node value */}
      <Pressable style={$nodeRow(level)} onPress={handlePress}>
        {isExpandable && <Text style={$expandIcon(themeName)}>{isExpanded ? "▼" : "▶"}</Text>}
        <Text style={$nodeLabel(themeName)}>{label}</Text>
        {renderValue()}
      </Pressable>

      {/* If has children, loop TreeView */}
      {isExpandable &&
        isExpanded &&
        level < MAX_LEVEL &&
        getChildren().map(({ key, label: childLabel, value }) => (
          <TreeView
            key={key}
            data={value}
            path={[...path, childLabel]}
            level={level + 1}
            onNodePress={onNodePress}
          />
        ))}
      {isExpandable && isExpanded && level >= MAX_LEVEL && (
        <Text pointerEvents="none" style={$defaultValue(themeName)}>
          {JSON.stringify(data, null, 2)}
        </Text>
      )}
    </>
  )
}

const $nodeRow = (level: number): ViewStyle => ({
  flexDirection: "row",
  alignItems: "center",
  paddingVertical: 2,
  paddingHorizontal: 4,
  marginLeft: level * 16 + 4,
})

const $expandIcon = withTheme<TextStyle>(({ colors }) => ({
  color: colors.mainText,
  fontSize: 10,
  marginRight: 4,
  width: 12,
}))

const $nodeLabel = withTheme<TextStyle>(({ colors, typography }) => ({
  color: colors.mainText,
  // fontFamily: typography.code.normal,
  fontSize: typography.body,
  marginRight: 8,
}))

const $stringValue = withTheme<TextStyle>((_theme) => ({
  color: "#4CAF50",
  // fontFamily: "Courier",
  fontSize: 12,
}))

const $numberValue = withTheme<TextStyle>((_theme) => ({
  color: "#2196F3",
  // fontFamily: "Courier",
  fontSize: 12,
}))

const $booleanValue = withTheme<TextStyle>((_theme) => ({
  color: "#FF9800",
  // fontFamily: "Courier",
  fontSize: 12,
}))

const $nullValue = withTheme<TextStyle>(({ colors }) => ({
  color: colors.neutralVery,
  // fontFamily: "Courier",
  fontSize: 12,
}))

const $undefinedValue = withTheme<TextStyle>(({ colors }) => ({
  color: colors.neutralVery,
  // fontFamily: "Courier",
  fontSize: 12,
}))

const $arrayValue = withTheme<TextStyle>((_theme) => ({
  color: "#9C27B0",
  // fontFamily: "Courier",
  fontSize: 12,
}))

const $objectValue = withTheme<TextStyle>((_theme) => ({
  color: "#607D8B",
  // fontFamily: "Courier",
  fontSize: 12,
}))

const $defaultValue = withTheme<TextStyle>(({ colors }) => ({
  color: colors.mainText,
  // fontFamily: "Courier",
  fontSize: 12,
}))
