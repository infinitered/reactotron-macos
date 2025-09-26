/**
 * Global State Management System (React Native Windows)
 *
 * A lightweight global state solution built on React's useSyncExternalStore.
 * Provides both hook-based and imperative access to shared state values.
 *
 * Features:
 * - Type-safe global state with "initialize on first read" semantics
 * - Efficient subscription system with automatic cleanup
 * - Batched updates to minimize re-renders
 * - Support for both React components (useGlobal) and external code (withGlobal)
 * - Memory leak prevention via Set<Listener> cleanup
 * - No-op persistence stubs (API-stable; can be wired later)
 *
 * Usage:
 *   const [count, setCount] = useGlobal('counter', 0);
 *   const [data, setData] = withGlobal('userData', {});
 *   const [persistedData, setPersisted] = useGlobal('key', {}, { persist: true }); // persist currently no-op
 *
 * Notes:
 * - `initialValue` is used as the value if the key is missing. For components,
 *   we DO NOT write during render; we write once post-mount if still missing.
 * - If different `initialValue`s are passed for the same `id`, the first
 *   established value "wins" (subsequent differing defaults are ignored).
 */

import { useSyncExternalStore, useEffect, useCallback } from "react";
import { unstable_batchedUpdates } from "react-native";

type Id = string;
type Listener = () => void;
type SetValue<T> = T | ((prev: T) => T);
type UseGlobalOptions = { persist?: boolean };

/* -----------------------------------------------------------------------------
 * Internal Stores
 * -------------------------------------------------------------------------- */
// Central storage for all global state values, keyed by unique identifiers
const globals = new Map<Id, unknown>();
// Subscription system: maps each global ID to a set of listener functions
const listeners = new Map<Id, Set<Listener>>();

/* -----------------------------------------------------------------------------
 * Persistence Stubs (no-op)
 * RN Web doesn't have react-native-mmkv support out of the box; plan to wire later
 * -------------------------------------------------------------------------- */
function loadPersistedGlobals(): void {
  // No-op: persistence not implemented
}

function debouncePersist(_delay: number = 300): void {
  // No-op: persistence not implemented
}

/* -----------------------------------------------------------------------------
 * Helpers
 * -------------------------------------------------------------------------- */

/**
 * Read a snapshot for an id, returning `initialValue` when missing.
 * Pure read: NEVER writes during render.
 */
function getSnapshotWithDefault<T>(id: Id, initialValue: T): T {
  return (globals.has(id) ? (globals.get(id) as T) : initialValue);
}

/**
 * Read a snapshot without default (used by imperative API and setters).
 */
function getSnapshot<T>(id: Id): T {
  return globals.get(id) as T;
}

/**
 * Subscribe a component to changes for a specific global ID.
 * Returns an unsubscribe function that cleans up both the listener and empty sets.
 */
function subscribe(id: Id, cb: Listener): () => void {
  let set = listeners.get(id);
  if (!set) listeners.set(id, (set = new Set()));
  set.add(cb);

  // Return cleanup function that prevents memory leaks
  return () => {
    const s = listeners.get(id);
    if (!s) return;
    s.delete(cb);
    // Clean up empty listener sets to prevent memory leaks
    if (s.size === 0) listeners.delete(id);
  };
}

/**
 * Notify all subscribers of a global value change.
 * Uses batched updates to prevent excessive re-renders when multiple globals change.
 * Iterates over a copy to be resilient to listeners mutating subscriptions.
 */
function notify(id: Id) {
  const s = listeners.get(id);
  if (!s || s.size === 0) return;

  unstable_batchedUpdates(() => {
    for (const l of Array.from(s)) l();
  });
}

/**
 * Create a setter function that handles state updates (persistence is no-op).
 * - Supports functional updates like React.useState
 * - Skips notifications if value is Object.is-equal (no-op update)
 * - Accepts `null` to reset/delete the value (used by imperative API)
 */
function buildSetValue<T>(id: Id, persist: boolean) {
  return (value: SetValue<T> | null) => {
    const prev = globals.get(id) as T | undefined;

    // Handle null value as reset (imperative API)
    if (value === null) {
      if (!globals.has(id)) return; // nothing to reset
      globals.delete(id);
      // persistence cleanup would go here (no-op for now)
      notify(id);
      return;
    }

    // Resolve functional updater
    const next =
      typeof value === "function"
        ? (value as (prev: T) => T)(getSnapshot<T>(id))
        : value;

    // Avoid unnecessary notifications/re-renders on no-op updates
    if (Object.is(prev, next)) return;

    globals.set(id, next);

    // Would save to persistent storage if implemented (no-op for now)
    if (persist) debouncePersist();

    // Notify all subscribers for re-renders
    notify(id);
  };
}

/* -----------------------------------------------------------------------------
 * Public API
 * -------------------------------------------------------------------------- */

/**
 * React hook for accessing and updating global state (component-friendly API)
 *
 * RN-only: No SSR getServerSnapshot is provided.
 *
 * @param id - Unique identifier for the global value
 * @param initialValue - Default value to use if the global doesn't exist yet
 * @param options - Configuration options including persistence (NOTE: persist is no-op)
 * @returns Tuple of [currentValue, setter] similar to useState
 */
export function useGlobal<T>(
  id: Id,
  initialValue: T,
  { persist = false }: UseGlobalOptions = {}
): [T, (v: SetValue<T>) => void] {
  // Read via useSyncExternalStore; ensure the snapshot read is PURE (no writes)
  const value = useSyncExternalStore(
    (cb) => subscribe(id, cb),                     // subscribe
    () => getSnapshotWithDefault<T>(id, initialValue) // getSnapshot (client)
  );

  /**
   * Post-mount initialization:
   * If the key is still missing, establish it with `initialValue`.
   * This avoids writes during render while ensuring the key exists thereafter.
   * No notify needed: subscribers already read `initialValue` on first render.
   */
  useEffect(() => {
    if (!globals.has(id)) {
      globals.set(id, initialValue);
      // Optionally, a dev-only warning could detect mismatched defaults for same id.
    }
    // We intentionally do not depend on initialValue here:
    // changing the default later should not rewrite established globals.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Memoize the setter; enforce non-null signature for hook users
  const setAny = useCallback(buildSetValue<T>(id, persist), [id, persist]);
  const set = useCallback<(v: SetValue<T>) => void>((v) => setAny(v), [setAny]);

  return [value, set];
}

/**
 * Imperative access to global state (for use outside React components)
 *
 * Useful for accessing global state in utility functions, event handlers,
 * or other non-React code that needs to read/write global values.
 *
 * @param id - Unique identifier for the global value
 * @param initialValue - Default value to use if the global doesn't exist yet
 * @param options - Configuration options including persistence (NOTE: persist is no-op)
 * @returns Tuple of [currentValue, setter] where setter accepts null to reset
 */
export function withGlobal<T>(
  id: Id,
  initialValue: T,
  { persist = false }: UseGlobalOptions = {}
): [T, (v: SetValue<T> | null) => void] {
  // Imperative path can initialize synchronously without render concerns
  if (!globals.has(id)) globals.set(id, initialValue);
  return [getSnapshot<T>(id), buildSetValue<T>(id, persist)];
}

/**
 * Reset a specific global value back to its initial state (delete the key).
 *
 * @param id - The global identifier to reset
 * @param rerender - Whether to trigger re-renders (default: true)
 */
export function resetGlobal(id: Id, rerender = true) {
  if (!globals.has(id)) return;
  globals.delete(id);
  // Note: No persistence cleanup needed since persistence is not implemented
  if (rerender) notify(id);
}

/**
 * Clear all global state values.
 *
 * Useful for testing or app-wide state resets. Only notifies globals
 * that have active listeners to avoid unnecessary work.
 *
 * @param rerender - Whether to trigger re-renders (default: true)
 */
export function clearGlobals(rerender = true) {
  // Clear in-memory state
  const hadAny = globals.size > 0;
  globals.clear();
  // Note: No persistent storage to clear since persistence is not implemented

  if (rerender && hadAny) {
    // Only notify ids that currently have listeners
    for (const id of listeners.keys()) notify(id);
  }
}

/* -----------------------------------------------------------------------------
 * Optional Developer Ergonomics (handy for tests & utilities)
 * -------------------------------------------------------------------------- */

/**
 * Read a global value without subscribing. Returns undefined if missing.
 */
export const getGlobal = <T,>(id: Id): T | undefined =>
  (globals.get(id) as T | undefined);

/**
 * Set a global value without subscribing. (Non-null only.)
 */
export const setGlobal = <T,>(id: Id, v: SetValue<T>): void =>
  buildSetValue<T>(id, false)(v);

/**
 * Check whether a global key exists.
 */
export const hasGlobal = (id: Id): boolean => globals.has(id);

/* -----------------------------------------------------------------------------
 * Module Initialization
 * -------------------------------------------------------------------------- */

// Load persisted globals on module initialization (no-op for now)
loadPersistedGlobals();
