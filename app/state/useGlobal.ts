import { Dispatch, SetStateAction, useCallback, useEffect, useState } from "react"
import { MMKV } from "react-native-mmkv"

const PERSISTED_KEY = "global-state"
export const storage = new MMKV()

const globals: Record<string, unknown> = JSON.parse(storage.getString(PERSISTED_KEY) || "{}")
const components_to_rerender: Record<string, Dispatch<SetStateAction<never[]>>[]> = {}

type UseGlobalOptions = { persist?: boolean }

/**
 * Trying for the simplest possible global state management.
 * Use anywhere and it'll share the same state globally, and rerender any component that uses it.
 *
 * const [value, setValue] = useGlobalState("my-state", "initial-value")
 *
 * // Can pass an option to decide whether to persist this state or not. Defaults to true.
 * const [value, setValue] = useGlobalState("my-state", "initial-value", { persist: false })
 */
export function useGlobal<T = unknown>(
  id: string,
  initialValue: T,
  { persist = true }: UseGlobalOptions = { persist: true },
): [T, (value: T) => void] {
  // Initialize this global if it doesn't exist.
  if (globals[id] === undefined) globals[id] = initialValue

  // Prepare to rerender any component that uses this global.
  components_to_rerender[id] ||= []

  // This is a dummy state to rerender any component that uses this global.
  const [_v, setRender] = useState([])

  // We provide our own setter to ensure that the state is updated globally.
  const setValue = useCallback(
    (value: T) => {
      globals[id] = value
      if (persist) storage.set(PERSISTED_KEY, JSON.stringify(globals))
      components_to_rerender[id].forEach((rerender) => rerender([]))
    },
    [globals, id],
  )

  // Subscribe & unsubscribe from these state changes
  useEffect(() => {
    components_to_rerender[id].push(setRender)
    return () => {
      components_to_rerender[id] = components_to_rerender[id].filter(
        (listener) => listener !== setRender,
      )
    }
  }, [id])

  return [globals[id] as T, setValue]
}

/**
 * Clear all globals and reset the storage entirely.
 * Optionally rerender all components that use useGlobal.
 */
export function clearGlobals(rerender: boolean = true): void {
  storage.delete(PERSISTED_KEY)
  Object.keys(globals).forEach((key) => delete globals[key])
  if (rerender) {
    Object.keys(components_to_rerender).forEach((key) => {
      components_to_rerender[key].forEach((rerender) => rerender([]))
    })
  }
}
