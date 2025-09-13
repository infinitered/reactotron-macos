import { View, type ViewStyle } from "react-native"
import { useState, useEffect, type ReactNode } from "react"

// Global registry for portal content and their listeners
const portals = new Map<string, ReactNode>()
const listeners = new Set<() => void>()

/**
 * Notifies all PortalHost components that portal content has changed
 */
function emit() {
  listeners.forEach((listener) => listener())
}

/**
 * A portal component that renders its children in a different location in the component tree.
 * Instead of rendering where it's declared, the content appears in the PortalHost.
 * Useful for modals, tooltips, and other overlays that need to appear above other content.
 */
export function Portal({ name, children }: { name: string; children: ReactNode }) {
  useEffect(() => {
    // Register this portal's content in the global registry
    portals.set(name, children)
    emit() // Notify PortalHost to re-render with new content
    
    return () => {
      // Clean up when portal unmounts
      portals.delete(name)
      emit() // Notify PortalHost to re-render without this content
    }
  }, [name, children])

  // Portal doesn't render anything in its original location
  return null
}

/**
 * The host component that renders all portal content.
 * Should be placed once in your app tree, typically at the root level.
 * All Portal components will render their content here instead of their original location.
 */
export function PortalHost() {
  const [, forceUpdate] = useState({})

  useEffect(() => {
    // Listen for portal changes and force re-render when they occur
    const listener = () => forceUpdate({})
    listeners.add(listener)
    return () => listeners.delete(listener)
  }, [])

  return (
    <View style={$overlay} pointerEvents="box-none">
      {Array.from(portals.values())}
    </View>
  )
}

// Overlay that covers the entire screen for portal content
// Uses high z-index to appear above other content
// pointerEvents="box-none" allows touches to pass through to underlying content
const $overlay: ViewStyle = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 9999,
  pointerEvents: "box-none",
}
