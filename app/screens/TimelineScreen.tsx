import { useGlobal } from "../state/useGlobal"
import { TimelineItem } from "../types"
import { TimelineLogItem } from "../components/TimelineLogItem"
import { TimelineNetworkItem } from "../components/TimelineNetworkItem"
import { TimelineDisplayItem } from "../components/TimelineDisplayItem"
import { DetailPanel } from "../components/DetailPanel"
import { ResizableDivider } from "../components/ResizableDivider"
import { LegendList } from "@legendapp/list"
import { TextInput, View, ViewStyle, TextStyle } from "react-native"
import { useSelectedTimelineItems } from "../utils/useSelectedTimelineItems"
import { Separator } from "../components/Separator"
import { themed, useThemeName } from "../theme/theme"
import { $flex, $row } from "../theme/basics"
import { useTimeline } from "../utils/useTimeline"
import { MenuItemId } from "app/components/Sidebar/SidebarMenu"
import { useEffect } from "react"
import { FilterType } from "../components/TimelineToolbar"
import { ClearLogsButton } from "../components/ClearLogsButton"

/**
 * Renders the correct component for each timeline item.
 */
const TimelineItemRenderer = ({
  item,
  isSelected,
  onSelectItem,
}: {
  item: TimelineItem
  isSelected: boolean
  onSelectItem: (item: TimelineItem) => void
}) => {
  if (!item) return null

  useThemeName()

  const handleSelectItem = () => {
    onSelectItem(item)
  }

  if (item.type === "log") {
    return <TimelineLogItem item={item} isSelected={isSelected} onSelect={handleSelectItem} />
  }
  if (item.type === "display") {
    return <TimelineDisplayItem item={item} isSelected={isSelected} onSelect={handleSelectItem} />
  }
  if (item.type === "api.response") {
    return <TimelineNetworkItem item={item} isSelected={isSelected} onSelect={handleSelectItem} />
  }
  console.tron.log("Unknown item", item)
  return null
}

function getTimelineTypes(activeItem: MenuItemId): FilterType[] {
  switch (activeItem) {
    case "logs":
      return ["log", "display"]
    case "network":
      return ["api.request", "api.response"]
    default:
      return ["log", "display", "api.request", "api.response"]
  }
}

export function TimelineScreen() {
  const [search, setSearch] = useGlobal("search", "")
  const [theme] = useThemeName()
  const [activeItem] = useGlobal<MenuItemId>("sidebar-active-item", "logs", {
    persist: true,
  })
  const [activeClientId] = useGlobal("activeClientId", "")
  const timelineItems = useTimeline({
    types: getTimelineTypes(activeItem),
    clientId: activeClientId,
  })
  const [timelineWidth, setTimelineWidth] = useGlobal<number>("timelineWidth", 300, {
    persist: true,
  })
  const { selectedItem, setSelectedItemId } = useSelectedTimelineItems()
  useEffect(() => {
    setSelectedItemId(null)
  }, [activeItem])

  const handleSelectItem = (item: TimelineItem) => {
    // Toggle selection: if clicking the same item, deselect it
    setSelectedItemId((prev) => (prev === item.id ? null : item.id))
  }

  return (
    <View style={[$flex, $row]}>
      <View style={{ width: timelineWidth }}>
        <View style={$statusRow()}>
          <View style={$searchContainer()}>
            <TextInput
              value={search}
              placeholder="Search"
              style={$searchInput()}
              placeholderTextColor={theme === "dark" ? "white" : "black"}
              onChangeText={setSearch}
            />
          </View>
          <ClearLogsButton />
        </View>
        <LegendList<TimelineItem>
          data={timelineItems}
          extraData={selectedItem?.id}
          renderItem={({ item }) => (
            <TimelineItemRenderer
              item={item}
              isSelected={selectedItem?.id === item.id}
              onSelectItem={handleSelectItem}
            />
          )}
          keyExtractor={(item, index) => `${item.id}-idx-${index}`}
          estimatedItemSize={60}
          recycleItems
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={$contentContainer()} // making some room for the scrollbar
          ItemSeparatorComponent={Separator}
        />
      </View>
      <ResizableDivider onResize={setTimelineWidth} minWidth={300} maxWidth={800} />
      <View style={$flex}>
        <DetailPanel selectedItem={selectedItem} onClose={() => setSelectedItemId(null)} />
      </View>
    </View>
  )
}

const $contentContainer = themed<ViewStyle>(({ spacing }) => ({
  paddingRight: spacing.xs,
}))
const $statusRow = themed<ViewStyle>(({ spacing, colors }) => ({
  flexDirection: "row",
  alignItems: "center",
  padding: spacing.sm,
  justifyContent: "center",
  width: "100%",
  backgroundColor: colors.cardBackground,
}))
const $searchInput = themed<TextStyle>(({ colors, typography, spacing }) => ({
  width: 140,
  fontSize: typography.body,
  backgroundColor: colors.background,
  borderWidth: 1,
  borderRadius: 4,
  padding: spacing.xxs,
  zIndex: 1,
}))
const $searchContainer = themed<ViewStyle>(({ spacing }) => ({
  marginRight: spacing.md,
}))
