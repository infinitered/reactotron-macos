import { Button, StyleProp, View, ViewStyle } from "react-native"
import { useGlobal, withGlobal } from "../state/useGlobal"
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
  const [_timelineItems, setTimelineItems] = withGlobal<TimelineItem[]>("timelineItems", [], {
    persist: true,
  })
  const [activeClientId] = useGlobal("activeClientId", "")
  const clearLogs = useCallback(() => {
    setTimelineItems((prev) => prev.filter((item) => item.clientId !== activeClientId))
  }, [setTimelineItems])

  return (
    <View style={$buttonContainer}>
      <Button onPress={clearLogs} title="Clear" />
    </View>
  )
}

const $buttonContainer: StyleProp<ViewStyle> = {
  cursor: "pointer",
}
