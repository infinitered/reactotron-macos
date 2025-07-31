import { Text, View, type ViewStyle, type TextStyle, Pressable } from "react-native"
import { useThemeName, withTheme, type ThemeName } from "../theme/theme"
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

  const node: TreeNodeComponentProps = {
    path,
    key: "unknown",
    label: "unknown",
    value: data,
    level,
    themeName,
  }

  if (Array.isArray(data)) {
    // loop through the array and create a tree node for each item
    return (
      <View style={$container}>
        {data.map((item, index) => (
          <TreeNodeComponent
            key={`${index}`}
            path={[...path, `${index}`]}
            label={`[${index}]`}
            value={item}
            level={level}
            onNodePress={onNodePress}
            themeName={themeName}
          />
        ))}
      </View>
    )
  }

  if (typeof data === "object") {
    // loop through the object and create a tree node for each key
    return (
      <View style={$container}>
        {Object.entries(data).map(([key, value]) => (
          <TreeNodeComponent
            key={key}
            path={[...path, key]}
            label={key}
            value={value}
            level={level}
            onNodePress={onNodePress}
            themeName={themeName}
          />
        ))}
      </View>
    )
  }

  if (data === null) {
    node.key = "null"
    node.label = "null"
    node.value = null
  }

  if (data === undefined) {
    node.key = "undefined"
    node.label = "undefined"
    node.value = undefined
  }

  if (typeof data === "string" || typeof data === "number" || typeof data === "boolean") {
    node.key = "value"
    node.label = "value"
    node.value = data
  }

  return (
    <View style={$container}>
      <TreeNodeComponent
        {...node}
        key={node.key}
        path={[...path, node.key]}
        level={level + 1}
        onNodePress={onNodePress}
      />
    </View>
  )
}

type TreeNodeComponentProps = {
  path: string[]
  key: string
  label: string
  value: any
  level: number
  onNodePress?: (node: { path: string[]; value: any; key: string }) => void
  themeName: ThemeName
}

function TreeNodeComponent({
  path,
  label,
  value,
  level,
  onNodePress,
  themeName,
}: TreeNodeComponentProps) {
  // We'll track whether the node should be expanded or not in a symbol, but use this to rerender
  const [_a, rerender] = useState([])

  const isExpandable = value && typeof value === "object" && Object.keys(value).length > 0
  const isExpanded = (isExpandable && value[TreeViewSymbol]) ?? false

  const handlePress = () => {
    if (isExpandable) {
      value[TreeViewSymbol] = !value[TreeViewSymbol]
      if (IRKeyboard.shift()) {
        // if shift is pressed, all the children should be expanded/contracted too
        // traverse the tree and set TreeViewSymbol for all of them to the new value
        traverse(value, (_key, node) => {
          if (node && typeof node === "object") {
            // set the symbol to the same value as the root parent
            node[TreeViewSymbol] = value[TreeViewSymbol]
          }
        })
      }
      rerender([])
    }

    onNodePress?.({ path, value, key: label })
  }

  const renderValue = () => {
    if (value === undefined) return null

    const type = typeof value

    if (type === "string") {
      return <Text style={$stringValue(themeName)}>&quot;{value}&quot;</Text>
    } else if (type === "number") {
      return <Text style={$numberValue(themeName)}>{value}</Text>
    } else if (type === "boolean") {
      return <Text style={$booleanValue(themeName)}>{value.toString()}</Text>
    } else if (value === null) {
      return <Text style={$nullValue(themeName)}>null</Text>
    } else if (type === "undefined") {
      return <Text style={$undefinedValue(themeName)}>undefined</Text>
    } else if (Array.isArray(value)) {
      if (value.length === 0) return <Text style={$arrayValue(themeName)}>[empty]</Text>

      const maxPreview = 3
      const previewItems = value.slice(0, maxPreview)
      const remaining = value.length - maxPreview

      const previewText = previewItems
        .map((item) => {
          return item.toString()
        })
        .join(", ")

      const suffix = remaining > 0 ? `, ...${remaining} more` : ""
      return (
        <Text style={$arrayValue(themeName)}>
          [{previewText}
          {suffix}]
        </Text>
      )
    } else if (type === "object") {
      const keys = Object.keys(value)
      return <Text style={$objectValue(themeName)}>{`{${keys.length} keys}`}</Text>
    }

    return <Text style={$defaultValue(themeName)}>{String(value)}</Text>
  }

  return (
    <>
      <Pressable style={$nodeRow(level)} onPress={handlePress}>
        {isExpandable && <Text style={$expandIcon(themeName)}>{isExpanded ? "▼" : "▶"}</Text>}

        <Text style={$nodeLabel(themeName)}>{label}</Text>
        {renderValue()}
      </Pressable>

      {isExpandable && isExpanded && level < MAX_LEVEL && (
        <TreeView
          data={value}
          path={[...path, label]}
          level={level + 1}
          onNodePress={onNodePress}
        />
      )}
      {isExpandable && isExpanded && level >= MAX_LEVEL && (
        <Text style={$defaultValue(themeName)}>{JSON.stringify(value, null, 2)}</Text>
      )}
    </>
  )
}

const $container: ViewStyle = {
  flex: 1,
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
  fontFamily: typography.code.normal,
  fontSize: typography.body,
  marginRight: 8,
}))

const $stringValue = withTheme<TextStyle>((_theme) => ({
  color: "#4CAF50",
  fontFamily: "Courier",
  fontSize: 12,
}))

const $numberValue = withTheme<TextStyle>((_theme) => ({
  color: "#2196F3",
  fontFamily: "Courier",
  fontSize: 12,
}))

const $booleanValue = withTheme<TextStyle>((_theme) => ({
  color: "#FF9800",
  fontFamily: "Courier",
  fontSize: 12,
}))

const $nullValue = withTheme<TextStyle>(({ colors }) => ({
  color: colors.neutralVery,
  fontFamily: "Courier",
  fontSize: 12,
}))

const $undefinedValue = withTheme<TextStyle>(({ colors }) => ({
  color: colors.neutralVery,
  fontFamily: "Courier",
  fontSize: 12,
}))

const $arrayValue = withTheme<TextStyle>((_theme) => ({
  color: "#9C27B0",
  fontFamily: "Courier",
  fontSize: 12,
}))

const $objectValue = withTheme<TextStyle>((_theme) => ({
  color: "#607D8B",
  fontFamily: "Courier",
  fontSize: 12,
}))

const $defaultValue = withTheme<TextStyle>(({ colors }) => ({
  color: colors.mainText,
  fontFamily: "Courier",
  fontSize: 12,
}))
