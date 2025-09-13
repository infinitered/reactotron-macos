import { useState, cloneElement, isValidElement, useRef, type ReactNode } from "react"
import { View, type ViewStyle, type TextStyle, Text } from "react-native"
import { themed } from "../../theme/theme"
import { Portal } from "../Portal/Portal"

type TooltipProps = {
  /**
   * The text to display in the tooltip
   */
  label: string
  /**
   * The trigger element that will show the tooltip on hover
   */
  children: ReactNode
  /**
   * Delay in milliseconds before showing the tooltip
   * @default 500
   */
  delay?: number
}

/**
 * A tooltip component that displays helpful text when the user long-presses a trigger element.
 * The tooltip appears positioned below the trigger and is automatically centered.
 * Uses the Portal system to render outside the normal component tree for proper layering.
 */
export function Tooltip({ label, children, delay = 500 }: TooltipProps) {
  const [show, setShow] = useState(false)
  const [positioned, setPositioned] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const triggerRef = useRef<View>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  if (!isValidElement(children)) {
    return <>{children}</>
  }

  const child: any = children

  // Shows the tooltip for measurement after delay
  const showTooltip = () => {
    timeoutRef.current = setTimeout(() => {
      setShow(true)
      setPositioned(false)
    }, delay)
  }

  // Cancels any pending tooltip show
  const cancelTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }

  // Hides the tooltip immediately
  const hideTooltip = () => {
    cancelTooltip()
    setShow(false)
    setPositioned(false)
  }

  // Updates tooltip position when the tooltip is laid out
  const onTooltipLayout = (event: any) => {
    const { width } = event.nativeEvent.layout
    // Calculate proper centered position
    if (triggerRef.current) {
      triggerRef.current.measureInWindow((x, y, triggerWidth, height) => {
        setPosition({
          x: x + triggerWidth / 2 - width / 2, // Center tooltip under trigger
          y: y + height + 2, // Position below with small gap
        })
        setPositioned(true) // Now show the tooltip
      })
    }
  }

  const enhancedChild = cloneElement(child, {
    ref: triggerRef,
    onHoverIn: (e: any) => {
      showTooltip()
      child.props?.onHoverIn?.(e)
    },
    onHoverOut: (e: any) => {
      hideTooltip()
      child.props?.onHoverOut?.(e)
    },
    onPress: (e: any) => {
      child.props?.onPress?.(e)
    },
  })

  return (
    <>
      {enhancedChild}
      {show && (
        <Portal name={`tooltip-${Math.random()}`}>
          <View
            onLayout={onTooltipLayout}
            style={[$tooltipBubble(), $tooltipPosition(position, positioned)]}
            pointerEvents="none"
          >
            <Text style={$tooltipText()}>{label}</Text>
          </View>
        </Portal>
      )}
    </>
  )
}

const $tooltipBubble = themed<ViewStyle>(({ colors, spacing }) => ({
  position: "absolute",
  backgroundColor: colors.cardBackground,
  borderColor: colors.border,
  borderWidth: 1,
  paddingHorizontal: spacing.xs,
  paddingVertical: spacing.xs,
  borderRadius: spacing.xs,
  alignItems: "center",
  justifyContent: "center",
}))

const $tooltipPosition = (position: { x: number; y: number }, positioned: boolean) => ({
  left: position.x,
  top: position.y,
  opacity: positioned ? 1 : 0,
})

const $tooltipText = themed<TextStyle>(({ colors }) => ({
  color: colors.mainText,
  fontSize: 12,
  textAlign: "center",
}))
