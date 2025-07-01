const perf: Record<string, number> = {}

export function perfStart(label: string) {
  if (__DEV__) {
    perf[label] ||= performance.now()
  }
  return null
}

export function perfEnd(label: string): number {
  if (__DEV__) {
    perf[label] = performance.now() - perf[label]
  }
  return perf[label] || NaN
}

export function perfLog() {
  if (__DEV__) {
    console.tron.log(perf)
  }
}
