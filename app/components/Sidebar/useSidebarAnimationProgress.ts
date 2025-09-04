import { useSidebar } from "../../state/useSidebar"
import { useReducedMotion } from "../../utils/useReducedMotion"
import { useEffect, useRef, useState } from "react"
import { Animated, Easing } from "react-native"

export const useSidebarAnimationProgress = () => {
  const { isOpen } = useSidebar()
  const prefersReducedMotion = useReducedMotion()

  /**
   * progress: 0 = collapsed, 1 = expanded
   */
  const progress = useRef(new Animated.Value(isOpen ? 1 : 0)).current

  /**
   * We keep text/wordmark mounted only while expanded or animating open.
   * After collapse finishes, unmount to avoid measuring/layout work.
   */
  const [mounted, setMounted] = useState(isOpen)

  useEffect(() => {
    if (isOpen) setMounted(true)

    if (prefersReducedMotion) {
      // Skip animation - set value immediately
      progress.setValue(isOpen ? 1 : 0)
      if (!isOpen) setMounted(false)
    } else {
      Animated.timing(progress, {
        toValue: isOpen ? 1 : 0,
        duration: isOpen ? 300 : 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false, // width changes require JS driver
      }).start(() => {
        if (!isOpen) setMounted(false)
      })
    }
  }, [isOpen, progress, prefersReducedMotion])

  return { progress, mounted }
}
