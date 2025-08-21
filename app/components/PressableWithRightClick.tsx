import React, { useCallback } from "react"
import { Pressable, type PressableProps, type GestureResponderEvent } from "react-native"
import { useActionMenu, type ActionMenuConfig } from "../utils/useActionMenu" // adjust path

/**
 * # PressableWithRightClick (macOS)
 *
 * A minimal wrapper around `Pressable` that also supports a native
 * action menu on right-click or ctrl-click. It wires into your
 * `useActionMenu` hook and opens the menu at the cursor location.
 *
 * ## Props
 * - `items`: The action menu structure (including nested children and `SEPARATOR`).
 * - All other props are forwarded to the underlying `Pressable`.
 *
 * ## Behavior
 * - **Primary click** behaves like a normal `Pressable` (`onPress`).
 * - **Right-click** or **ctrl-click** opens the action menu.
 * - Menu actions are resolved via the `useActionMenu` hook.
 *
 * ## Example
 * ```tsx
 * import { SEPARATOR } from "./useActionMenu"
 *
 * <PressableWithRightClick
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
 * </PressableWithRightClick>
 * ```
 */

export interface PressableWithRightClickProps extends PressableProps {
  items: ActionMenuConfig["items"]
}

export function PressableWithRightClick(props: PressableWithRightClickProps) {
  const { items, onPress, ...rest } = props
  const { open } = useActionMenu({ items })

  const handlePress = useCallback(
    (e: GestureResponderEvent) => {
      if ((e.nativeEvent as any).button === 2) return open()
      if (onPress) onPress(e)
    },
    [open, onPress],
  )

  return <Pressable onPress={handlePress} {...rest} />
}

export default PressableWithRightClick
