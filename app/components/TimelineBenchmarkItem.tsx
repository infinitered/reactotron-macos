import { CommandType, TimelineItemBenchmark } from "../types"
import { TimelineItem } from "./TimelineItem"
type TimelineBenchmarkItemProps = {
  item: TimelineItemBenchmark
  isSelected?: boolean
  onSelect?: () => void
}

/**
 * A single benchmark item in the timeline.
 */
export function TimelineBenchmmarkItem({
  item,
  isSelected = false,
  onSelect,
}: TimelineBenchmarkItemProps) {
  const { payload, date, deltaTime, important } = item

  if (item.type !== CommandType.Benchmark) return null

  const { title } = payload

  return (
    <TimelineItem
      title={"Benchmark"}
      date={new Date(date)}
      deltaTime={deltaTime}
      preview={title}
      isImportant={important}
      isTagged={important}
      isSelected={isSelected}
      onSelect={onSelect}
      actionMenu={[]}
    />
  )
}
