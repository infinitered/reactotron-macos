// import { View, Text } from "react-native"
import { FlatList } from "react-native"
import { useGlobal } from "../../state/useGlobal"
import { TimelineItem } from "../../types"
import { LogItem } from "./TimelineItems/LogItem"
import { NetworkItem } from "./TimelineItems/NetworkItem"

/**
 * Renders the correct component for each timeline item.
 */
const TimelineItemRenderer = ({ item }: { item: TimelineItem }) => {
  if (!item) return null

  if (item.type === "log") return <LogItem item={item} />
  if (item.type === "api.response") return <NetworkItem item={item} />
  console.tron.log("Unknown item", item)
  return null
}

export function TimelineScreen() {
  const [timelineItems] = useGlobal<TimelineItem[]>("timelineItems", [], { persist: true })

  return (
    <FlatList<TimelineItem>
      data={timelineItems}
      renderItem={({ item }) => <TimelineItemRenderer item={item} />}
      keyExtractor={(item) => item.id}
    />
  )
}
