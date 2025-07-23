import { Text, View, type ViewStyle, type TextStyle, Pressable } from "react-native"
import { useThemeName, withTheme, type ThemeName } from "../theme/theme"
import { useGlobal } from "../state/useGlobal"

export type TreeNode = {
  key: string
  path: string
  label: string
  value?: any
  children?: TreeNode[]
  isExpanded?: boolean
  type?: "string" | "number" | "boolean" | "object" | "array" | "null" | "undefined"
}

type TreeViewProps = {
  data: TreeNode[]
  level?: number
  onNodePress?: (node: TreeNode) => void
}

export function TreeView({ data, level = 0, onNodePress }: TreeViewProps) {
  const [themeName] = useThemeName()

  console.tron.log("TreeView", data)

  return (
    <View style={$container}>
      {data.map((node) => (
        <TreeNodeComponent
          key={node.key}
          node={node}
          level={level}
          onNodePress={onNodePress}
          themeName={themeName}
        />
      ))}
    </View>
  )
}

type TreeNodeComponentProps = {
  node: TreeNode
  level: number
  onNodePress?: (node: TreeNode) => void
  themeName: ThemeName
}

function TreeNodeComponent({ node, level, onNodePress, themeName }: TreeNodeComponentProps) {
  // Use the node's path for a truly unique key
  const uniqueKey = `tree-node-${node.path}`
  const [isExpanded, setIsExpanded] = useGlobal(uniqueKey, node.isExpanded ?? false)

  const handlePress = () => {
    if (isExpandable(node)) setIsExpanded(!isExpanded)
    onNodePress?.(node)
  }

  const renderValue = () => {
    if (node.value === undefined) return null

    const value = node.value
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

  if (isExpandable(node)) {
    console.tron.log("Expandable children for " + node.label, node.children?.[0]?.children)
  }

  return (
    <View style={$nodeContainer}>
      <Pressable style={$nodeRow} onPress={handlePress}>
        <View style={$indentContainer}>
          {Array.from({ length: level }).map((_, i) => (
            <View key={i} style={$indentLine(themeName)} />
          ))}
        </View>

        {isExpandable(node) && <Text style={$expandIcon(themeName)}>{isExpanded ? "▼" : "▶"}</Text>}

        <Text style={$nodeLabel(themeName)}>{node.label}</Text>
        {renderValue()}
      </Pressable>

      {isExpandable(node) && isExpanded && (
        <TreeView data={node.children!} level={level + 1} onNodePress={onNodePress} />
      )}
    </View>
  )
}

// Helper function to convert objects/arrays to tree structure
export function objectToTree(obj: any, label = "root", path = ""): TreeNode[] {
  if (obj === null) {
    return [{ key: "null", path: `${path}-null`, label, value: null, type: "null" }]
  }

  if (obj === undefined) {
    return [
      { key: "undefined", path: `${path}-undefined`, label, value: undefined, type: "undefined" },
    ]
  }

  if (typeof obj === "string" || typeof obj === "number" || typeof obj === "boolean") {
    return [{ key: "value", path: `${path}-value`, label, value: obj, type: typeof obj as any }]
  }

  if (Array.isArray(obj)) {
    return obj.map((item, index) => ({
      key: `array-${index}`,
      path: `${path}-array-${index}`,
      label: `[${index}]`,
      value: item,
      type: typeof item as any,
      children:
        typeof item === "object" && item !== null
          ? objectToTree(item, `[${index}]`, `${path}-array-${index}`)
          : undefined,
    }))
  }

  if (typeof obj === "object") {
    return Object.entries(obj).map(([key, value]) => ({
      key: `object-${key}`,
      path: `${path}-object-${key}`,
      label: key,
      value,
      type: typeof value as any,
      children:
        typeof value === "object" && value !== null
          ? objectToTree(value, key, `${path}-object-${key}`)
          : undefined,
    }))
  }

  return [{ key: "unknown", path: `${path}-unknown`, label, value: obj, type: "undefined" }]
}

// An expandable object is one that is not a string, number, boolean, undefined, or null
function isExpandable(node: TreeNode): boolean {
  return Boolean(node.children && node.children.length > 0)
}

const $container: ViewStyle = {
  flex: 1,
}

const $nodeContainer: ViewStyle = {
  flex: 1,
}

const $nodeRow: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  paddingVertical: 2,
  paddingHorizontal: 4,
}

const $indentContainer: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
}

const $indentLine = withTheme<ViewStyle>(({ colors }) => ({
  width: 16,
  height: 1,
  backgroundColor: colors.neutralVery,
  marginRight: 4,
}))

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
