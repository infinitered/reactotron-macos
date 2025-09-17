export function safeTime(d: unknown): number {
  const t = new Date(String(d ?? "")).getTime()
  return Number.isFinite(t) ? t : 0
}
