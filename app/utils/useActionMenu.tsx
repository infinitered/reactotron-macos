import { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from "react"
import NativeIRActionMenuManager, {
  SEPARATOR,
  type ActionMenuItemPressedEvent,
} from "../native/IRActionMenuManager/NativeIRActionMenuManager"
import { Platform } from "react-native"

export { SEPARATOR }

type AsyncableVoid = void | Promise<void>

export type MenuItem = {
  /** Optional stable id to avoid label collisions and ease i18n */
  id?: string
  label: string
  shortcut?: string
  enabled?: boolean
  checked?: boolean
  children?: MenuListEntry[]
  action?: () => AsyncableVoid
}

export type MenuListEntry = MenuItem | typeof SEPARATOR

export interface ActionMenuConfig {
  items: MenuListEntry[]
}

// used to separate path components in the action map key
const DELIM = "\x1F" // 0x1F is the ASCII record separator character
const makeKey = (path: readonly string[]) => path.join(DELIM)

type NativeMenuItem = {
  label: string
  shortcut?: string
  enabled?: boolean
  checked?: boolean
  children?: NativeMenuListEntry[]
}

type NativeMenuListEntry = NativeMenuItem | typeof SEPARATOR

export function useActionMenu(config: ActionMenuConfig) {
  // We keep the latest actionMap in a ref so onPress doesn't resubscribe.
  const actionsRef = useRef<Map<string, () => AsyncableVoid>>(new Map())

  // Build both the sanitized items (for native) and the action map (for lookup) in one pass.
  const { nativeItems, actionMap } = useMemo(() => {
    const nextMap = new Map<string, () => AsyncableVoid>()

    const build = (entries: MenuListEntry[], parent: string[] = []): NativeMenuListEntry[] => {
      const out: NativeMenuListEntry[] = []

      const pushEntry = (e: NativeMenuListEntry) => {
        // prevent consecutive separators
        if (e === SEPARATOR && out[out.length - 1] === SEPARATOR) return
        out.push(e)
      }

      for (const entry of entries) {
        if (entry === SEPARATOR) {
          pushEntry(SEPARATOR)
          continue
        }

        const item = entry as MenuItem
        const { label, shortcut, enabled, checked, children, action } = item

        // Prefer explicit ids in the path; fall back to label if not provided
        const nodeId = item.id ?? label
        const path = [...parent, nodeId]

        if (typeof action === "function") {
          const key = makeKey(path)
          if (__DEV__ && nextMap.has(key)) {
            // Useful when two sibling items share id/label
            console.warn(`Duplicate action-menu path: ${path.join(" > ")}`)
          }
          nextMap.set(key, action)
        }

        pushEntry({
          label, // native UI shows labels, ids are just for our lookup
          shortcut,
          enabled,
          checked,
          children: Array.isArray(children) ? build(children, path) : undefined,
        })
      }

      // trim trailing separator
      while (out.length && out[out.length - 1] === SEPARATOR) out.pop()
      // trim leading separator
      while (out.length && out[0] === SEPARATOR) out.shift()

      return out
    }

    const built = build(config.items)
    return { nativeItems: built, actionMap: nextMap }
  }, [config.items])

  // Keep the latest map in a ref without changing onPress identity.
  useLayoutEffect(() => {
    actionsRef.current = actionMap
  }, [actionMap])

  const onPress = useCallback((evt: ActionMenuItemPressedEvent) => {
    // evt.menuPath is assumed to mirror our id/label path; we support either.
    const key = makeKey(evt.menuPath)
    const action = actionsRef.current.get(key)
    if (!action) return

    try {
      const maybePromise = action()
      // catch errors from async actions
      if (maybePromise && typeof (maybePromise as Promise<void>).then === "function") {
        ;(maybePromise as Promise<void>).catch((err) => {
          if (__DEV__) console.error("Action menu action rejected:", err)
        })
      }
    } catch (err) {
      if (__DEV__) console.error("Action menu action threw:", err)
    }
  }, [])

  // Subscribe once; handler stays stable.
  useEffect(() => {
    if (Platform.OS === "windows") return
    const sub = NativeIRActionMenuManager.onActionMenuItemPressed(onPress)
    return () => sub.remove()
  }, [onPress])

  const open = useCallback(() => {
    NativeIRActionMenuManager.showActionMenu(nativeItems)
  }, [nativeItems])

  return { open }
}
