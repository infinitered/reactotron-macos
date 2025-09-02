import { MenuListEntry } from "app/utils/useActionMenu"
import { TimelineItemLog } from "../types"
import { TimelineItem } from "./TimelineItem"
import IRClipboard from "../native/IRClipboard/NativeIRClipboard"

type TimelineLogItemProps = {
  item: TimelineItemLog
  isSelected?: boolean
  onSelect?: () => void
}

/**
 * A single log item in the timeline.
 */
export function TimelineLogItem({ item, isSelected = false, onSelect }: TimelineLogItemProps) {
  const { payload, date, deltaTime, important } = item

  // Type guard to ensure this is a log item
  if (item.type !== "log") return null

  // Determine log level and color
  let level: string = "DEBUG"
  let _levelColor: "neutral" | "primary" | "danger" = "neutral"

  if (payload?.level === "warn") {
    level = "WARN"
    _levelColor = "primary"
  } else if (payload?.level === "error") {
    level = "ERROR"
    _levelColor = "danger"
  }

  const message = Array.isArray(payload?.message) ? payload?.message[0] : payload?.message
  const preview =
    message.toString().substring(0, 100) + (message.toString().length > 100 ? "..." : "")

  const actionMenu: MenuListEntry[] = [
    {
      label: "Copy Message",
      action: () => IRClipboard.setString(message),
    },
  ]

  return (
    <TimelineItem
      title={level}
      date={new Date(date)}
      deltaTime={deltaTime}
      preview={preview}
      isImportant={important}
      isTagged={important}
      isSelected={isSelected}
      onSelect={onSelect}
      actionMenu={actionMenu}
    />
  )
}
