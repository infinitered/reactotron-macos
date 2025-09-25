// globalStore.ts
import { useSyncExternalStore, useCallback } from "react";
import { unstable_batchedUpdates } from "react-native";

type Id = string;
type Listener = () => void;
type SetValue<T> = T | ((prev: T) => T);

const globals = new Map<Id, unknown>();
const listeners = new Map<Id, Set<Listener>>();

// Initialize global value if it doesn't exist, but don't modify during snapshot reads
function initializeGlobal<T>(id: Id, initialValue: T): void {
  if (!globals.has(id)) {
    globals.set(id, initialValue);
  }
}

function getSnapshot<T>(id: Id): T {
  return globals.get(id) as T;
}

function subscribe(id: Id, cb: Listener): () => void {
  let set = listeners.get(id);
  if (!set) listeners.set(id, (set = new Set()));
  set.add(cb);
  return () => {
    const s = listeners.get(id);
    if (!s) return;
    s.delete(cb);
    if (s.size === 0) listeners.delete(id);
  };
}

function notify(id: Id) {
  const s = listeners.get(id);
  if (!s || s.size === 0) return;
  unstable_batchedUpdates(() => {
    for (const l of s) l();
  });
}

export function useGlobal<T>(id: Id, initialValue: T): [T, (v: SetValue<T>) => void] {
  // Initialize the global value once, outside of the snapshot function
  initializeGlobal(id, initialValue);

  const value = useSyncExternalStore(
    (cb) => subscribe(id, cb),
    () => getSnapshot<T>(id)
  );

  // Memoize the setter function to prevent unnecessary re-renders
  const set = useCallback((next: SetValue<T>) => {
    const current = getSnapshot<T>(id);
    const resolved = typeof next === "function" ? (next as (p: T) => T)(current) : next;
    globals.set(id, resolved);
    notify(id);
  }, [id]);

  return [value, set];
}

// Imperative access (outside components)
export function withGlobal<T>(
  id: Id,
  initialValue: T
): [T, (v: SetValue<T> | null) => void] {
  // Initialize the global value
  initializeGlobal(id, initialValue);

  const setter = (v: SetValue<T> | null) => {
    if (v === null) return resetGlobal(id);
    const current = getSnapshot<T>(id);
    const resolved = typeof v === "function" ? (v as (p: T) => T)(current) : v;
    globals.set(id, resolved);
    notify(id);
  };
  return [getSnapshot<T>(id), setter];
}

export function resetGlobal(id: Id, rerender = true) {
  globals.delete(id);
  if (rerender) notify(id);
}

export function clearGlobals(rerender = true) {
  globals.clear();
  if (rerender) {
    // Only notify ids that have listeners; avoids stale maps
    for (const id of listeners.keys()) notify(id);
  }
}
