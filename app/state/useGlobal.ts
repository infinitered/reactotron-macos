import { Dispatch, SetStateAction, useCallback, useEffect, useState } from "react"
import { MMKV } from "react-native-mmkv"

type UseGlobalOptions = { persist?: boolean }

const PERSISTED_KEY = "global-state"
export const storage = new MMKV()

// Load the globals from MMKV.
let _load_globals: any = {}
try {
  _load_globals = JSON.parse(storage.getString(PERSISTED_KEY) || "{}")
} catch (e) {
  console.error("Error loading globals", e)
}

const globals: Record<string, unknown> = _load_globals
const persisted_globals: Record<string, unknown> = _load_globals
const components_to_rerender: Record<string, Dispatch<SetStateAction<never[]>>[]> = {}

let _save_initiated_at: number = 0
function save_globals() {
  storage.set(PERSISTED_KEY, JSON.stringify(persisted_globals))
  console.tron.log("saved globals", persisted_globals)
  _save_initiated_at = 0
}

let _debounce_persist_timeout: NodeJS.Timeout | null = null
function debounce_persist(delay: number) {
  if (_save_initiated_at === 0) _save_initiated_at = Date.now()
  if (Date.now() - _save_initiated_at > delay) return save_globals()

  if (_debounce_persist_timeout) clearTimeout(_debounce_persist_timeout)
  _debounce_persist_timeout = setTimeout(save_globals, delay)
}

/**
 * Trying for the simplest possible global state management.
 * Use anywhere and it'll share the same state globally, and rerender any component that uses it.
 *
 * const [value, setValue] = useGlobal("my-state", "initial-value")
 *
 * // Can pass an option to decide whether to persist this state or not. Defaults to false.
 * const [value, setValue] = useGlobal("my-state", "initial-value", { persist: true })
 *
 * // There's also a convenience hook for persisted globals.
 * const [value, setValue] = useSavedGlobal("my-state", "initial-value")
 *
 */
export function useGlobal<T = unknown>(
  id: string,
  initialValue: T,
  { persist = false }: UseGlobalOptions = {},
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
      if (persist) {
        persisted_globals[id] = value
        // debounce save to mmkv
        debounce_persist(1000)
      }
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
