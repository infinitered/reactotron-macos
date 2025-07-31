<<<<<<< HEAD
=======
// import { View, Text } from "react-native"
import { LegendList } from "@legendapp/list"
>>>>>>> cc70354c6d9b4f6261672c2c37448b595709a108
import { useGlobal } from "../../state/useGlobal"
import { TimelineItem } from "../../types"
import { LogItem } from "./TimelineItems/LogItem"
import { NetworkItem } from "./TimelineItems/NetworkItem"
import { LegendList } from "@legendapp/list"

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
    <LegendList<TimelineItem>
      data={timelineItems}
      renderItem={({ item }) => <TimelineItemRenderer item={item} />}
      keyExtractor={(item) => item.id}
<<<<<<< HEAD
      estimatedItemSize={150} // TODO: better estimate pls
      recycleItems={true} // Not sure if this is better
=======
      recycleItems
>>>>>>> cc70354c6d9b4f6261672c2c37448b595709a108
    />
  )
}
