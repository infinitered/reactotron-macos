import { useGlobal } from "../state/useGlobal"
import { TimelineItem } from "../types"
import { TimelineLogItem } from "../components/TimelineLogItem"
import { TimelineNetworkItem } from "../components/TimelineNetworkItem"
import { DetailPanel } from "../components/DetailPanel"
import { ResizableDivider } from "../components/ResizableDivider"
import { TimelineToolbar, TimelineFilters } from "../components/TimelineToolbar"
import { LegendList } from "@legendapp/list"
import { View, ViewStyle } from "react-native-macos"
import { useSelectedTimelineItems } from "../utils/useSelectedTimelineItems"
import { Separator } from "../components/Separator"
import { themed, useThemeName } from "../theme/theme"
import { $flex, $row } from "../theme/basics"
import { useMemo, useState } from "react"
import { filterAndSortTimelineItems } from "app/utils/timelineFilters"

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
  const [timelineItems] = useGlobal<TimelineItem[]>("timelineItems", [], { persist: true })
  const [timelineWidth, setTimelineWidth] = useGlobal<number>("timelineWidth", 300, {
    persist: true,
  })
  const { selectedItem, setSelectedItemId } = useSelectedTimelineItems()

  const [filters, setFilters] = useState<TimelineFilters>({
    type: "all",
    logLevel: "all",
    sortBy: "time-newest",
  })

  const filteredAndSortedItems = useMemo(() => {
    return filterAndSortTimelineItems(timelineItems, filters)
  }, [timelineItems, filters])

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
        <View style={{ flex: 1 }}>
          <TimelineToolbar
            filters={filters}
            onFiltersChange={setFilters}
            itemCount={timelineItems.length}
            filteredCount={filteredAndSortedItems.length}
          />
          <LegendList<TimelineItem>
            data={filteredAndSortedItems}
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
            contentContainerStyle={{ paddingRight: 8 }} // making some room for the scrollbar
            ItemSeparatorComponent={Separator}
          />
        </View>
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
