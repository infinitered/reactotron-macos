// Sanitize values to prevent prototype pollution
export function sanitizeValue(value: any): any {
  if (value === null || typeof value !== "object") {
    return value
  }

  if (Array.isArray(value)) {
    return value.map(sanitizeValue)
  }

  // Create a clean object without prototype pollution risks
  const sanitized = Object.create(null)
  for (const [key, val] of Object.entries(value)) {
    // Skip dangerous properties
    if (!isSafeKey(key)) {
      continue
    }
    sanitized[key] = sanitizeValue(val)
  }

  return sanitized
}

export function isSafeKey(key: string): boolean {
  return key !== "__proto__" && key !== "constructor" && key !== "prototype"
}
