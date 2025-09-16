import {
  useState,
  cloneElement,
  isValidElement,
  useRef,
  type ComponentPropsWithRef,
  type ReactElement,
} from "react"
import {
  View,
  Text,
  Pressable,
  type ViewStyle,
  type TextStyle,
  type LayoutChangeEvent,
  type PressableProps,
} from "react-native"
import { themed } from "../theme/theme"
import { Portal } from "./Portal"
import { getUUID } from "../utils/random/getUUID"

type TooltipState = "hidden" | "showing" | "positioned"

type TooltipProps = {
  /**
   * The text to display in the tooltip
   */
  label: string
  /**
   * The trigger element that will show the tooltip on hover
   */
  children: ReactElement<PressableProps>
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
  const [tooltipState, setTooltipState] = useState<TooltipState>("hidden")
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const triggerRef = useRef<View>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const portalNameRef = useRef<string>(`tooltip-${getUUID()}`)

  if (!isValidElement(children)) {
    return <>{children}</>
  }

  const child = children

  if (__DEV__) {
    const isPressable = child?.type === Pressable
    if (!isPressable) {
      console.warn("Tooltip: child should be a Pressable to support onHoverIn/onHoverOut handlers.")
    }
  }

  // Shows the tooltip for measurement after delay
  const showTooltip = () => {
    if (timeoutRef.current || tooltipState !== "hidden") return
    timeoutRef.current = setTimeout(() => {
      timeoutRef.current = null
      setTooltipState("showing")
    }, delay)
  }

  // Cancels any pending tooltip show
  const cancelTooltip = () => {
    if (!timeoutRef.current) return
    clearTimeout(timeoutRef.current)
    timeoutRef.current = null
  }

  // Hides the tooltip immediately
  const hideTooltip = () => {
    cancelTooltip()
    setTooltipState("hidden")
  }

  // Updates tooltip position when the tooltip is laid out
  const onTooltipLayout = (event: LayoutChangeEvent) => {
    if (!triggerRef.current) return
    const { width } = event.nativeEvent.layout
    // Calculate proper centered position
    triggerRef.current.measureInWindow((x, y, triggerWidth, height) => {
      setPosition({
        x: x + triggerWidth / 2 - width / 2, // Center tooltip under trigger
        y: y + height + 2, // Position below with small gap
      })
      setTooltipState("positioned") // Now show the tooltip
    })
  }

  const enhancedChild = cloneElement<ComponentPropsWithRef<typeof Pressable>>(child, {
    ...child.props,
    ref: triggerRef,
    onHoverIn: (e) => {
      showTooltip()
      child.props?.onHoverIn?.(e)
    },
    onHoverOut: (e) => {
      hideTooltip()
      child.props?.onHoverOut?.(e)
    },
    onPress: (e) => {
      child.props?.onPress?.(e)
    },
  })

  return (
    <>
      {enhancedChild}
      {tooltipState !== "hidden" && (
        <Portal name={portalNameRef.current}>
          <View
            onLayout={onTooltipLayout}
            style={[$tooltipBubble(), $tooltipPosition(position, tooltipState === "positioned")]}
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
