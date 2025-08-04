import { Dispatch, SetStateAction, useCallback, useEffect, useState } from "react"
import { MMKV } from "react-native-mmkv"

type UseGlobalOptions = { persist?: boolean }

const PERSISTED_KEY = "global-state"
export const storage = new MMKV({
  // TODO: figure out if we can access "~/Library/Application Support/Reactotron/mmkv"?
  path: "/tmp/reactotron/mmkv/",
  id: "reactotron",
})

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

type SetValueFn<T> = (prev: T) => T
type SetValue<T> = T | SetValueFn<T>

/**
 * Trying for the simplest possible global state management.
 * Use anywhere and it'll share the same state globally, and rerender any component that uses it.
 *
 * const [value, setValue] = useGlobal("my-state", "initial-value")
 *
 * // Can pass an option to decide whether to persist this state or not. Defaults to false.
 * const [value, setValue] = useGlobal("my-state", "initial-value", { persist: true })
 *
 */
export function useGlobal<T = unknown>(
  id: string,
  initialValue: T,
  { persist = false }: UseGlobalOptions = {},
): [T, (value: SetValue<T>) => void] {
  // This is a dummy state to rerender any component that uses this global.
  const [_v, setRender] = useState([])

  // Subscribe & unsubscribe from state changes for this ID.
  useEffect(() => {
    components_to_rerender[id] ||= []
    components_to_rerender[id].push(setRender)
    return () => {
      if (!components_to_rerender[id]) return
      components_to_rerender[id] = components_to_rerender[id].filter(
        (listener) => listener !== setRender,
      )
    }
  }, [id])

  // We use the withGlobal hook to do the actual work.
  const [value] = withGlobal<T>(id, initialValue, persist)

  // We use a callback to ensure that the setValue function is stable.
  const setValue = useCallback(buildSetValue(id, persist), [id, persist])

  return [value, setValue]
}

/**
 * For global state used outside of a component. Can be used in a component with
 * the same id string, using useGlobal.
 */
export function withGlobal<T>(
  id: string,
  initialValue: T,
  { persist = false }: UseGlobalOptions = {},
): [T, (value: SetValue<T> | null) => void] {
  // Initialize this global if it doesn't exist.
  if (globals[id] === undefined) globals[id] = initialValue

  return [globals[id] as T, buildSetValue(id, persist)]
}

function buildSetValue<T>(id: string, persist: boolean) {
  return (value: SetValue<T> | null) => {
    // Call the setter function if it's a function.
    if (typeof value === "function") value = (value as SetValueFn<T>)(globals[id] as T)
    if (value === null) {
      delete globals[id]
      if (persist) delete persisted_globals[id]
    } else {
      globals[id] = value
      if (persist) persisted_globals[id] = value
    }
    if (persist) debounce_persist(300)
    components_to_rerender[id] ||= []
    components_to_rerender[id].forEach((rerender) => rerender([]))
  }
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
