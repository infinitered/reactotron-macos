import { View, PanResponder, type ViewStyle } from "react-native"
import { themed } from "../theme/theme"
import { useRef, useState } from "react"

type ResizableDividerProps = {
  onResize: (width: number) => void
  minWidth?: number
  maxWidth?: number
}

export function ResizableDivider({
  onResize,
  minWidth = 300,
  maxWidth = 800,
}: ResizableDividerProps) {
  const [isDragging, setIsDragging] = useState(false)

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      onPanResponderGrant: () => {
        setIsDragging(true)
      },
      onPanResponderMove: (evt, gestureState) => {
        // Calculate new width based on gesture
        const newWidth = Math.max(minWidth, Math.min(maxWidth, gestureState.moveX))
        onResize(newWidth)
      },
      onPanResponderRelease: () => {
        setIsDragging(false)
      },
      onPanResponderTerminate: () => {
        setIsDragging(false)
      },
    }),
  ).current

  return <View {...panResponder.panHandlers} style={$divider(isDragging)} />
}

const $divider = (isDragging: boolean) =>
  themed<ViewStyle>(({ colors }) => ({
    width: 4,
    backgroundColor: isDragging ? colors.neutral : colors.neutralVery,
    cursor: "col-resize",
    opacity: isDragging ? 1 : 0.6,
    transition: "all 0.2s ease",
  }))()
