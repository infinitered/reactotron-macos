import { CommandType } from "reactotron-core-contract"
import { TimelineItem } from "./TimelineItem"
import { TimelineItemStateActionComplete } from "../types"

type TimelineStateActionItemProps = {
  item: TimelineItemStateActionComplete
  isSelected?: boolean
  onSelect?: () => void
}

/**
 * A single display item in the timeline.
 */
export function TimelineStateActionItem({
  item,
  isSelected = false,
  onSelect,
}: TimelineStateActionItemProps) {
  const { payload, date, deltaTime, important } = item

  // Type guard to ensure this is a display item
  if (item.type !== CommandType.StateActionComplete) return null

  return (
    <TimelineItem
      title={"ACTION"}
      date={new Date(date)}
      deltaTime={deltaTime}
      preview={payload.name}
      isImportant={important}
      isTagged={important}
      isSelected={isSelected}
      onSelect={onSelect}
    />
  )
}
