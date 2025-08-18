import React, { useCallback } from "react"
import { Pressable, type PressableProps, type GestureResponderEvent } from "react-native"
import { useContextMenu, type ContextMenuConfig } from "../utils/useContextMenu" // adjust path

/**
 * # ContextPressable (macOS)
 *
 * A minimal wrapper around `Pressable` that also supports a native
 * context menu on secondary click (right-click or ctrl-click). It wires into your
 * `useContextMenu` hook and opens the menu at the cursor location.
 *
 * ## Props
 * - `items`: The context menu structure (including nested children and `SEPARATOR`).
 * - All other props are forwarded to the underlying `Pressable`.
 *
 * ## Behavior
 * - **Primary click** behaves like a normal `Pressable` (`onPress`).
 * - **Secondary click** (right-click) or **ctrl-click** opens the context menu.
 * - Menu actions are resolved via the `useContextMenu` hook.
 *
 * ## Example
 * ```tsx
 * import { SEPARATOR } from "./useContextMenu"
 *
 * <ContextPressable
 *   items={[
 *     { label: "Open", action: () => console.log("Open") },
 *     SEPARATOR,
 *     {
 *       label: "Share",
 *       children: [
 *         { label: "Copy Link", action: () => console.log("Copy Link") },
 *         { label: "Email…", action: () => console.log("Email") },
 *       ],
 *     },
 *     { label: "Delete", enabled: true, action: () => console.log("Delete") },
 *   ]}
 *   onPress={() => console.log("Primary press")}
 *   style={{ padding: 12 }}
 * >
 *   {children}
 * </ContextPressable>
 * ```
 */

export interface ContextPressableProps extends PressableProps {
  items: ContextMenuConfig["items"]
}

export function ContextPressable(props: ContextPressableProps) {
  const { items, onPress, ...rest } = props
  const { open } = useContextMenu({ items })

  const handlePress = useCallback(
    (e: GestureResponderEvent) => {
      if ((e.nativeEvent as any).button === 2) return open()
      if (onPress) onPress(e)
    },
    [open, onPress],
  )

  return <Pressable onPress={handlePress} {...rest} />
}

export default ContextPressable
