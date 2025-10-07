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

  const totalDuration = payload.steps[payload.steps.length - 1].time

  return (
    <TimelineItem
      title={"BENCHMARK"}
      date={new Date(date)}
      deltaTime={deltaTime}
      preview={`${payload.title} in ${totalDuration.toFixed(3)}ms`}
      isImportant={important}
      isTagged={important}
      isSelected={isSelected}
      onSelect={onSelect}
      actionMenu={[]}
    />
  )
}
