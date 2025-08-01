// From https://www.dhiwise.com/post/troubleshooting-typeerror-cyclic-object-value-simple-approach
export function stringifySafe(obj: any): string {
  const seen = new WeakSet()
  return JSON.stringify(obj, (key, value) => {
    if (typeof value === "object" && value !== null) {
      if (seen.has(value)) {
        // Duplicate reference found, skip it
        return
      }
      seen.add(value)
    }
    return value
  })
}
