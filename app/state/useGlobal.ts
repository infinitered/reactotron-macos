import { Dispatch, SetStateAction, useCallback, useEffect, useState } from "react"
import IRFileStorage from "../native/IRFileStorage/NativeIRFileStorage"

type UseGlobalOptions = { persist?: boolean }

const PERSISTED_KEY = "global-state.json"
const STORAGE_DIR = "/tmp/reactotron/filestorage/"
const STORAGE_PATH = `${STORAGE_DIR}${PERSISTED_KEY}`
IRFileStorage.ensureDir(STORAGE_DIR)

// Load the globals from file storage.
let _loadGlobals: any = {}
try {
  const contents = IRFileStorage.read(STORAGE_PATH)
  _loadGlobals = JSON.parse(contents || "{}")
} catch (e) {
  console.error("Error loading globals", e)
}

const _globals: Record<string, unknown> = _loadGlobals
const _persistedGlobals: Record<string, unknown> = _loadGlobals
const _componentsToRerender: Record<string, Dispatch<SetStateAction<never[]>>[]> = {}

let _saveInitiatedAt: number = 0
function saveGlobals() {
  IRFileStorage.write(STORAGE_PATH, JSON.stringify(_persistedGlobals))
  console.tron.log("saved globals", _persistedGlobals)
  _saveInitiatedAt = 0
}

let _debouncePersistTimeout: NodeJS.Timeout | null = null
function debouncePersist(delay: number) {
  if (_saveInitiatedAt === 0) _saveInitiatedAt = Date.now()
  if (Date.now() - _saveInitiatedAt > delay) return saveGlobals()

  if (_debouncePersistTimeout) clearTimeout(_debouncePersistTimeout)
  _debouncePersistTimeout = setTimeout(saveGlobals, delay)
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
    _componentsToRerender[id] ||= []
    _componentsToRerender[id].push(setRender)
    return () => {
      if (!_componentsToRerender[id]) return
      _componentsToRerender[id] = _componentsToRerender[id].filter(
        (listener) => listener !== setRender,
      )
    }
  }, [id])

  // We use the withGlobal hook to do the actual work.
  const [value] = withGlobal<T>(id, initialValue, { persist })

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
  if (_globals[id] === undefined) _globals[id] = initialValue

  return [_globals[id] as T, buildSetValue(id, persist)]
}

function buildSetValue<T>(id: string, persist: boolean) {
  return (value: SetValue<T> | null) => {
    // Call the setter function if it's a function.
    if (typeof value === "function") value = (value as SetValueFn<T>)(_globals[id] as T)
    if (value === null) {
      delete _globals[id]
      if (persist) delete _persistedGlobals[id]
    } else {
      _globals[id] = value
      if (persist) _persistedGlobals[id] = value
    }
    if (persist) debouncePersist(300)
    _componentsToRerender[id] ||= []
    _componentsToRerender[id].forEach((rerender) => rerender([]))
  }
}

export function deleteGlobal(id: string): void {
  delete _globals[id]
}

/**
 * Clear all globals and reset the storage entirely.
 * Optionally rerender all components that use useGlobal.
 */
export function clearGlobals(rerender: boolean = true): void {
  IRFileStorage.remove(STORAGE_PATH)
  Object.keys(_globals).forEach((key) => delete _globals[key])
  if (rerender) {
    Object.keys(_componentsToRerender).forEach((key) => {
      _componentsToRerender[key].forEach((rerender) => rerender([]))
    })
  }
}
