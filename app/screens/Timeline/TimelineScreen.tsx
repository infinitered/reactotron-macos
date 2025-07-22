// import { View, Text } from "react-native"
import { FlatList } from "react-native"
import { useGlobal } from "../../state/useGlobal"
import { TimelineItem } from "../../types"
import { LogItem } from "./TimelineItems/LogItem"
import { NetworkItem } from "./TimelineItems/NetworkItem"

const TimelineRow = ({ item }: { item: string }) => {
  const [timelineItem] = useGlobal<TimelineItem>(`timeline-${item}`, {} as TimelineItem, {
    persist: true,
  })

  if (!timelineItem) return null

  if (timelineItem.type === "log") return <LogItem item={timelineItem} />
  if (timelineItem.type === "api.response") return <NetworkItem item={timelineItem} />
  console.tron.log("Unknown timelineItem", timelineItem)
  return null
}

export function TimelineScreen() {
  const [timelineIds] = useGlobal<string[]>("timelineIds", [], { persist: true })

  return (
    <FlatList<string>
      data={timelineIds}
      renderItem={({ item }) => <TimelineRow item={item} />}
      keyExtractor={(id) => id}
    />
  )
}
