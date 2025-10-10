import { View, PanResponder, type ViewStyle } from "react-native"
import { themed } from "../theme/theme"
import { useMemo, useState } from "react"

type ResizableDividerProps = {
  onResize: (width: number) => void
  minWidth?: number
  maxWidth?: number
  currentWidth?: number
}

export function ResizableDivider({
  onResize,
  minWidth = 300,
  maxWidth = 800,
  currentWidth = 300,
}: ResizableDividerProps) {
  const [isDragging, setIsDragging] = useState(false)

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponderCapture: () => true,
        onPanResponderGrant: () => {
          setIsDragging(true)
        },
        onPanResponderMove: (evt, gestureState) => {
          // Calculate new width based on gesture relative to the current width
          let newWidth = currentWidth + gestureState.dx
          if (newWidth < minWidth) {
            newWidth = minWidth
          }
          if (newWidth > maxWidth) {
            newWidth = maxWidth
          }
          onResize(newWidth)
        },
        onPanResponderRelease: () => {
          setIsDragging(false)
        },
        onPanResponderTerminate: () => {
          setIsDragging(false)
        },
      }),
    [currentWidth, minWidth, maxWidth, onResize],
  )

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
