// import { View, Text } from "react-native"
import { Text, type TextStyle } from "react-native"
import { useGlobal } from "../../state/useGlobal"
import { TimelineItem, TimelineItemNetwork } from "../../types"
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
      estimatedItemSize={150} // TODO: better estimate pls
      recycleItems // Not sure if this is better
    />
    // <NetworkItem item={timelineItems[0] as TimelineItemNetwork} />
    // <>
    //   <Text style={$stringValue}>Hello</Text>
    //   <Text style={$stringValue}>Hello</Text>
    //   <Text style={$stringValue}>Hello</Text>
    //   <Text style={$stringValue}>Hello</Text>
    //   <Text style={$stringValue}>Hello</Text>
    //   <Text style={$stringValue}>Hello</Text>
    //   <Text style={$stringValue}>Hello</Text>
    //   <Text style={$stringValue}>Hello</Text>
    //   <Text style={$stringValue}>Hello</Text>
    //   <Text style={$stringValue}>Hello</Text>
    //   <Text style={$stringValue}>Hello</Text>
    //   <Text style={$stringValue}>Hello</Text>
    //   <Text style={$stringValue}>Hello</Text>
    //   <Text style={$stringValue}>Hello</Text>
    //   <Text style={$stringValue}>Hello</Text>
    //   <Text style={$stringValue}>Hello</Text>
    //   <Text style={$stringValue}>Hello</Text>
    //   <Text style={$stringValue}>Hello</Text>
    //   <Text style={$stringValue}>Hello</Text>
    // </>
  )
}

const $stringValue: TextStyle = {
  color: "#4CAF50",
  // fontFamily: "Courier",
  fontSize: 12,
}
