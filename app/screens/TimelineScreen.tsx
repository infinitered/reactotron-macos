import { useGlobal } from "../state/useGlobal"
import { TimelineItem } from "../types"
import { TimelineLogItem } from "../components/TimelineLogItem"
import { TimelineNetworkItem } from "../components/TimelineNetworkItem"
import { DetailPanel } from "../components/DetailPanel"
import { ResizableDivider } from "../components/ResizableDivider"
import { LegendList } from "@legendapp/list"
import { View, ViewStyle } from "react-native-macos"
import { useSelectedTimelineItems } from "../utils/useSelectedTimelineItems"
import { Separator } from "../components/Separator"
import { themed, useThemeName } from "../theme/theme"
import { $flex, $row } from "../theme/basics"
import { useTimeline } from "../utils/useTimeline"

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
  if (item.type === "api.response") {
    return <TimelineNetworkItem item={item} isSelected={isSelected} onSelect={handleSelectItem} />
  }
  console.tron.log("Unknown item", item)
  return null
}

export function TimelineScreen() {
  // TODO: Use a global state for the filters, set by the user in the TimelineToolbar
  const timelineItems = useTimeline({ types: ["log", "api.request", "api.response"] })
  const [timelineWidth, setTimelineWidth] = useGlobal<number>("timelineWidth", 300, {
    persist: true,
  })
  const { selectedItem, setSelectedItemId } = useSelectedTimelineItems()

  const handleSelectItem = (item: TimelineItem) => {
    // Toggle selection: if clicking the same item, deselect it
    setSelectedItemId((prev) => (prev === item.id ? null : item.id))
  }

  return (
    <View style={[$flex, $row]}>
      <View style={{ width: timelineWidth }}>
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
          keyExtractor={(item) => item.id}
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
