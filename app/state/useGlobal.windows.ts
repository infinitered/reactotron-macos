import { Dispatch, SetStateAction, useCallback, useEffect, useState } from "react"

type UseGlobalOptions = {}

const globals: Record<string, unknown> = {}
const components_to_rerender: Record<string, Dispatch<SetStateAction<never[]>>[]> = {}


type SetValueFn<T> = (prev: T) => T
type SetValue<T> = T | SetValueFn<T>

/**
 * Trying for the simplest possible global state management.
 * Use anywhere and it'll share the same state globally, and rerender any component that uses it.
 *
 * const [value, setValue] = useGlobal("my-state", "initial-value")
 *
 */
export function useGlobal<T = unknown>(
  id: string,
  initialValue: T,
  options: UseGlobalOptions = {},
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
  const [value] = withGlobal<T>(id, initialValue, options)

  // We use a callback to ensure that the setValue function is stable.
  const setValue = useCallback(buildSetValue(id), [id])

  return [value, setValue]
}

/**
 * For global state used outside of a component. Can be used in a component with
 * the same id string, using useGlobal.
 */
export function withGlobal<T>(
  id: string,
  initialValue: T,
  options: UseGlobalOptions = {},
): [T, (value: SetValue<T> | null) => void] {
  // Initialize this global if it doesn't exist.
  if (globals[id] === undefined) globals[id] = initialValue

  return [globals[id] as T, buildSetValue(id)]
}

function buildSetValue<T>(id: string) {
  return (value: SetValue<T> | null) => {
    // Call the setter function if it's a function.
    if (typeof value === "function") value = (value as SetValueFn<T>)(globals[id] as T)
    if (value === null) {
      delete globals[id]
    } else {
      globals[id] = value
    }
    components_to_rerender[id] ||= []
    components_to_rerender[id].forEach((rerender) => rerender([]))
  }
}

/**
 * Clear all globals and reset the storage entirely.
 * Optionally rerender all components that use useGlobal.
 */
export function clearGlobals(rerender: boolean = true): void {
  Object.keys(globals).forEach((key) => delete globals[key])
  if (rerender) {
    Object.keys(components_to_rerender).forEach((key) => {
      components_to_rerender[key].forEach((rerender) => rerender([]))
    })
  }
}
