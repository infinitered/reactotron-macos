import { Text, View, type ViewStyle, type TextStyle, Pressable } from "react-native"
import { useThemeName, withTheme, type ThemeName } from "../theme/theme"
import { useGlobal } from "../state/useGlobal"

export type TreeNode = {
  key: string
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
  const [isExpanded, setIsExpanded] = useGlobal(`tree-node-${node.key}`, node.isExpanded ?? false)
  const hasChildren = node.children && node.children.length > 0

  const handlePress = () => {
    if (hasChildren) {
      setIsExpanded(!isExpanded)
    }
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
    } else if (Array.isArray(value)) {
      return <Text style={$arrayValue(themeName)}>[{value.length} items]</Text>
    } else if (type === "object") {
      const keys = Object.keys(value)
      return <Text style={$objectValue(themeName)}>{`{${keys.length} keys}`}</Text>
    }

    return <Text style={$defaultValue(themeName)}>{String(value)}</Text>
  }

  return (
    <View style={$nodeContainer}>
      <Pressable style={$nodeRow} onPress={handlePress}>
        <View style={$indentContainer}>
          {Array.from({ length: level }).map((_, i) => (
            <View key={i} style={$indentLine(themeName)} />
          ))}
        </View>

        {hasChildren && <Text style={$expandIcon(themeName)}>{isExpanded ? "▼" : "▶"}</Text>}

        <Text style={$nodeLabel(themeName)}>{node.label}</Text>
        {renderValue()}
      </Pressable>

      {hasChildren && isExpanded && (
        <TreeView data={node.children!} level={level + 1} onNodePress={onNodePress} />
      )}
    </View>
  )
}

// Helper function to convert objects/arrays to tree structure
export function objectToTree(obj: any, label = "root"): TreeNode[] {
  if (obj === null) {
    return [{ key: "null", label, value: null, type: "null" }]
  }

  if (obj === undefined) {
    return [{ key: "undefined", label, value: undefined, type: "undefined" }]
  }

  if (typeof obj === "string" || typeof obj === "number" || typeof obj === "boolean") {
    return [{ key: "value", label, value: obj, type: typeof obj as any }]
  }

  if (Array.isArray(obj)) {
    return [
      {
        key: "array",
        label,
        value: obj,
        type: "array",
        children: obj.map((item, index) => ({
          key: `array-${index}`,
          label: `[${index}]`,
          value: item,
          type: typeof item as any,
          children:
            typeof item === "object" && item !== null
              ? objectToTree(item, `[${index}]`)
              : undefined,
        })),
      },
    ]
  }

  if (typeof obj === "object") {
    return [
      {
        key: "object",
        label,
        value: obj,
        type: "object",
        children: Object.entries(obj).map(([key, value]) => ({
          key: `object-${key}`,
          label: key,
          value,
          type: typeof value as any,
          children:
            typeof value === "object" && value !== null ? objectToTree(value, key) : undefined,
        })),
      },
    ]
  }

  return [{ key: "unknown", label, value: obj, type: "undefined" }]
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
  color: colors.neutral,
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
