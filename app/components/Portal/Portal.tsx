import { View, type ViewStyle } from "react-native"
import { useState, useEffect, type ReactNode } from "react"

// Simple global registry
const portals = new Map<string, ReactNode>()
const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((listener) => listener())
}

export function Portal({ name, children }: { name: string; children: ReactNode }) {
  useEffect(() => {
    portals.set(name, children)
    emit()
    return () => {
      portals.delete(name)
      emit()
    }
  }, [name, children])

  return null
}

export function PortalHost() {
  const [, forceUpdate] = useState({})

  useEffect(() => {
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

const $overlay: ViewStyle = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 9999,
  pointerEvents: "box-none",
}
