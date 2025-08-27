import { useEffect, useState } from "react"
import { AccessibilityInfo } from "react-native"

/**
 * Hook to detect if the user prefers reduced motion.
 * Returns true when animations should be disabled.
 */
export const useReducedMotion = (): boolean => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    // Get initial preference
    AccessibilityInfo.isReduceMotionEnabled().then(setPrefersReducedMotion)

    // Listen for changes
    const subscription = AccessibilityInfo.addEventListener("reduceMotionChanged", setPrefersReducedMotion)

    return () => subscription?.remove()
  }, [])

  return prefersReducedMotion
}