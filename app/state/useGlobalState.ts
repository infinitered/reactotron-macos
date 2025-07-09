import { useCallback, useState } from "react"

/**
 * The simplest possible global state management.
 *
 * Use anywhere and it'll share the state globally.
 *
 * const [value, setValue] = useGlobalState("my-state", "initial-value")
 */
const _globalState: Record<string, unknown> = {}
export function useGlobalState<T = unknown>(id: string, initialValue: T): [T, (value: T) => void] {
  if (_globalState[id] === undefined) _globalState[id] = initialValue
  const [_v, setRender] = useState([])
  // We provide our own setter to ensure that the state is updated globally.
  const setValue = useCallback(
    (value: T) => {
      _globalState[id] = value
      setRender([]) // simply rerenders this component
    },
    [_globalState, id],
  )
  return [_globalState[id] as T, setValue]
}
