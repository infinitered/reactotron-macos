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
   * The trigger element that will show the tooltip on long press
   */
  children: ReactNode
}

/**
 * A tooltip component that displays helpful text when the user long-presses a trigger element.
 * The tooltip appears positioned below the trigger and is automatically centered.
 * Uses the Portal system to render outside the normal component tree for proper layering.
 */
export function Tooltip({ label, children }: TooltipProps) {
  const [show, setShow] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [tooltipWidth, setTooltipWidth] = useState(0)
  const triggerRef = useRef<View>(null)
  const tooltipRef = useRef<View>(null)

  if (!isValidElement(children)) {
    return <>{children}</>
  }

  const child: any = children

  // Measures the trigger position and shows the tooltip centered below it
  const showTooltip = () => {
    if (triggerRef.current) {
      triggerRef.current.measureInWindow((x, y, width, height) => {
        setPosition({
          x: x + width / 2 - tooltipWidth / 2, // Center tooltip under trigger
          y: y + height + 2, // Position below with small gap
        })
        setShow(true)
      })
    }
  }

  // Captures the tooltip's actual width for proper centering
  const onTooltipLayout = (event: any) => {
    const { width } = event.nativeEvent.layout
    setTooltipWidth(width)
  }

  const enhancedChild = cloneElement(child, {
    ref: triggerRef,
    onHoverIn: (e: any) => {
      if (show) {
        setShow(false)
      } else {
        showTooltip()
      }
      child.props?.onHoverIn?.(e)
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
            ref={tooltipRef}
            onLayout={onTooltipLayout}
            style={[
              $tooltipBubble(),
              {
                left: position.x,
                top: position.y,
              },
            ]}
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

const $tooltipText = themed<TextStyle>(({ colors }) => ({
  color: colors.mainText,
  fontSize: 12,
  textAlign: "center",
}))
