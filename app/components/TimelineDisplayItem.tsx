import { CommandType } from "reactotron-core-contract"
import type { TimelineItemDisplay } from "../types"
import { TimelineItem } from "./TimelineItem"

type TimelineDisplayItemProps = {
  item: TimelineItemDisplay
  isSelected?: boolean
  onSelect?: () => void
}

/**
 * A single display item in the timeline.
 */
export function TimelineDisplayItem({
  item,
  isSelected = false,
  onSelect,
}: TimelineDisplayItemProps) {
  const { payload, date, deltaTime, important } = item

  // Type guard to ensure this is a display item
  if (item.type !== CommandType.Display) return null

  return (
    <TimelineItem
      title={payload.name}
      date={new Date(date)}
      deltaTime={deltaTime}
      preview={payload.preview ?? ""}
      isImportant={important}
      isTagged={important}
      isSelected={isSelected}
      onSelect={onSelect}
    />
  )
}
