import { Button } from "react-native"
import { withGlobal } from "../state/useGlobal"
import type { TimelineItem } from "../types"
import { useCallback } from "react"
import { useKeyboardEvents } from "../utils/system"

export function ClearLogsButton() {
  useKeyboardEvents((event) => {
    if (event.type === "keydown" && event.key === "k" && event.modifiers.cmd) {
      clearLogs()
    }
  })

  // Using withGlobal so we don't rerender when the logs change
  const [_timelineItems, setTimelineItems] = withGlobal<TimelineItem[]>("timelineItems", [])
  const clearLogs = useCallback(() => setTimelineItems([]), [setTimelineItems])

  return <Button onPress={clearLogs} title="Clear" />
}
