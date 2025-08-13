// import { View, Text } from "react-native"
import { useGlobal } from "../state/useGlobal"
import { TimelineItem } from "../types"
import { TimelineLogItem } from "../components/TimelineLogItem"
import { TimelineNetworkItem } from "../components/TimelineNetworkItem"
import { LegendList } from "@legendapp/list"

/**
 * Renders the correct component for each timeline item.
 */
const TimelineItemRenderer = ({ item }: { item: TimelineItem }) => {
  if (!item) return null

  if (item.type === "log") return <TimelineLogItem item={item} />
  if (item.type === "api.response") return <TimelineNetworkItem item={item} />
  console.tron.log("Unknown item", item)
  return null
}

export function TimelineScreen() {
  const [timelineItems] = useGlobal<TimelineItem[]>("timelineItems", [], { persist: true })

  return (
    <LegendList<TimelineItem>
      data={timelineItems}
      renderItem={({ item }) => <TimelineItemRenderer item={item} />}
      keyExtractor={(item) => item.id}
      estimatedItemSize={120} // TODO: better estimate pls
      recycleItems // Not sure if this is better
    />
  )
}
