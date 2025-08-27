type TCallback<T, R> = (key: string, value: T, path: string[]) => R
type Result<R> = R | undefined

/**
 * Traverse an object and call a callback for each node, including the parent.
 *
 * @param o - The object to traverse.
 * @param cb - The callback to call for each node. It will be called with the key, value, and path as an array of keys.
 * @param max - The maximum depth to traverse (defaults to 20).
 * @param key - The key of the current node.
 * @param path - The path to the current node.
 * @returns The result of the callback, if any.
 */
export function traverse<T, R = any>(
  o: T,
  cb: TCallback<T, R>,
  max: number = 20,
  key: string = "root",
  path: string[] = [],
): Result<R> {
  // call the callback for this node itself
  const result = cb(key, o, path)

  if (o !== null && o !== undefined && typeof o === "object" && max > 0) {
    // now recurse into the children
    if (Array.isArray(o)) {
      // arrays, we just loop through them
      for (let i = 0; i < o.length; i++) {
        traverse(o[i], cb, max - 1, i.toString(), [...path, i.toString()])
      }
    } else {
      // objects, we recurse into each property
      for (const key in o) {
        traverse((o as Record<string, any>)[key], cb, max - 1, key, [...path, key])
      }
    }
  }

  return result
}
