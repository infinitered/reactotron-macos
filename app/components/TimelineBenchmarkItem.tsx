import { TimelineItemBenchmark } from "../types"
import { TimelineItem } from "./TimelineItem"

type TimelineBenchmarkItemProps = {
  item: TimelineItemBenchmark
  isSelected?: boolean
  onSelect?: () => void
}

/**
 * A single log item in the timeline.
 */
export function TimelineBenchmmarkItem({
  item,
  isSelected = false,
  onSelect,
}: TimelineBenchmarkItemProps) {
  const { payload, date, deltaTime, important } = item
  //
  // // Type guard to ensure this is a log item
  if (item.type !== "benchmark.report") return null
  //
  const title = payload.type
  const preview = JSON.stringify(payload)
  //
  return (
    <TimelineItem
      title={title}
      date={new Date(date)}
      deltaTime={deltaTime}
      preview={preview}
      isImportant={important}
      isTagged={important}
      isSelected={isSelected}
      onSelect={onSelect}
      actionMenu={[]}
    />
  )
}
